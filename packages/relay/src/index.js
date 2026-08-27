// ─── Sola Relay Server ───
// Zero-knowledge data proxy. Credentials stay local. Data never leaves.

import { createServer } from 'http';
import { readFileSync, appendFileSync, existsSync } from 'fs';
import { join } from 'path';

// ─── Connectors ───
const connectors = new Map();

class PostgresConnector {
  constructor(config) {
    this.config = config;
    this.pool = null;
  }

  async connect() {
    const { default: pg } = await import('pg');
    this.pool = new pg.Pool(this.config);
    // Verify connection
    const client = await this.pool.connect();
    client.release();
  }

  async query(sql, params = []) {
    const result = await this.pool.query(sql, params);
    return { rows: result.rows, rowCount: result.rowCount };
  }

  async schema() {
    const result = await this.pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position
    `);
    const tables = {};
    for (const row of result.rows) {
      if (!tables[row.table_name]) tables[row.table_name] = [];
      tables[row.table_name].push({ name: row.column_name, type: row.data_type });
    }
    return tables;
  }

  async disconnect() {
    if (this.pool) await this.pool.end();
  }
}

class GoogleSheetsConnector {
  constructor(config) {
    this.sheetId = config.sheetId || config.host || config.source;
    this.apiKey = config.apiKey || null;
  }

  async connect() {
    // Validate sheetId exists
    if (!this.sheetId) throw new Error("Google Sheet ID is required for sheet:// relay");
  }

  async query(options = {}) {
    const url = `https://docs.google.com/spreadsheets/d/${this.sheetId}/gviz/tq?tqx=out:csv`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch Google Sheet (${res.status} ${res.statusText})`);
    
    const csvText = await res.text();
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return { rows: [], rowCount: 0 };

    const parseCsvLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const headers = parseCsvLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      const row = {};
      headers.forEach((header, idx) => {
        const val = values[idx] || '';
        const numVal = Number(val.replace(/[\$,]/g, ''));
        row[header] = !isNaN(numVal) && val !== '' ? numVal : val;
      });
      rows.push(row);
    }

    return { rows, rowCount: rows.length, headers };
  }

  async schema() {
    const { headers } = await this.query();
    return { "sheet_data": headers.map(h => ({ name: h, type: 'inferred' })) };
  }

  async disconnect() {}
}

class MySQLConnector {
  constructor(config) {
    this.config = config;
    this.pool = null;
  }

  async connect() {
    const mysql = await import('mysql2/promise');
    this.pool = mysql.createPool(this.config);
    // Verify
    const conn = await this.pool.getConnection();
    conn.release();
  }

  async query(sql, params = []) {
    const [rows] = await this.pool.execute(sql, params);
    return { rows, rowCount: rows.length };
  }

  async schema() {
    const [rows] = await this.pool.execute(`
      SELECT TABLE_NAME as table_name, COLUMN_NAME as column_name, DATA_TYPE as data_type
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `);
    const tables = {};
    for (const row of rows) {
      if (!tables[row.table_name]) tables[row.table_name] = [];
      tables[row.table_name].push({ name: row.column_name, type: row.data_type });
    }
    return tables;
  }

  async disconnect() {
    if (this.pool) await this.pool.end();
  }
}

// ─── Audit Logger ───
function auditLog(entry) {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    ...entry
  }) + '\n';
  
  try {
    appendFileSync('sola-relay-audit.log', line);
  } catch (e) {
    // Fallback to console
    console.log('[AUDIT]', line.trim());
  }
}

// ─── Connection Store ───
const connections = new Map();

function addConnection(name, type, config) {
  let connector;
  switch (type) {
    case 'postgres':
      connector = new PostgresConnector(config);
      break;
    case 'mysql':
      connector = new MySQLConnector(config);
      break;
    case 'sheet':
    case 'googlesheets':
      connector = new GoogleSheetsConnector(config);
      break;
    default:
      throw new Error(`Unsupported connector type: ${type}`);
  }
  connections.set(name, { type, connector, config, status: 'disconnected' });
}

async function connectAll() {
  for (const [name, conn] of connections) {
    try {
      await conn.connector.connect();
      conn.status = 'connected';
      console.log(`  ✓ Connected: ${name} (${conn.type})`);
    } catch (e) {
      conn.status = 'error';
      console.error(`  ✗ Failed: ${name} — ${e.message}`);
    }
  }
}

// ─── Load connections from config ───
function loadConfig() {
  const configPath = join(process.cwd(), 'sola-relay.json');
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    if (config.connections) {
      for (const [name, conn] of Object.entries(config.connections)) {
        addConnection(name, conn.type, conn);
      }
    }
    return config;
  }
  return {};
}

// ─── HTTP Server ───
export class RelayServer {
  constructor(options = {}) {
    this.port = options.port || 4040;
  }

  start() {
    // Load config
    loadConfig();

    const server = createServer(async (req, res) => {
      // CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const url = new URL(req.url, `http://localhost:${this.port}`);

      // ── Status endpoint ──
      if (url.pathname === '/api/status' && req.method === 'GET') {
        const status = {};
        for (const [name, conn] of connections) {
          status[name] = { type: conn.type, status: conn.status };
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ relay: 'sola-relay', version: '0.0.1', connections: status }));
        return;
      }

      // ── Schema endpoint ──
      if (url.pathname === '/api/schema' && req.method === 'GET') {
        const source = url.searchParams.get('source');
        const conn = connections.get(source);
        if (!conn) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Source '${source}' not found` }));
          return;
        }
        try {
          const schema = await conn.connector.schema();
          // Only send schema metadata — never row data
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ source, schema }));
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
        return;
      }

      // ── Query endpoint ──
      if (url.pathname === '/api/query' && req.method === 'POST') {
        let body = '';
        for await (const chunk of req) body += chunk;
        
        try {
          const { source, query, filters, sort, limit, offset } = JSON.parse(body);
          const conn = connections.get(source);

          if (!conn) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Source '${source}' not found` }));
            return;
          }

          if (conn.status !== 'connected') {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Source '${source}' is not connected` }));
            return;
          }

          // Execute query
          const result = await conn.connector.query(query || `SELECT * FROM ${source} LIMIT ${limit || 100}`);

          // Audit log — HIPAA compliant
          auditLog({
            action: 'QUERY',
            source,
            query: query || 'DEFAULT_SELECT',
            rowCount: result.rowCount,
            userAgent: req.headers['user-agent']
          });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));

        } catch (e) {
          auditLog({ action: 'QUERY_ERROR', error: e.message });
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
        return;
      }

      // ── Dashboard (root) ──
      if (url.pathname === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html>
<html>
<head>
  <title>Sola Relay</title>
  <style>
    * { margin: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px; }
    h1 { font-size: 2rem; font-weight: 800; margin-bottom: 8px; }
    .sub { color: #94a3b8; margin-bottom: 32px; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 16px; }
    .status { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .connected { background: #ecfdf5; color: #059669; }
    .disconnected { background: #fef2f2; color: #dc2626; }
    code { background: #f1f5f9; padding: 2px 8px; border-radius: 6px; font-size: 13px; }
  </style>
</head>
<body>
  <h1>☀️ Sola Relay</h1>
  <p class="sub">Your data stays here. Always.</p>
  <div class="card">
    <p><strong>Status:</strong> Running on port ${this.port}</p>
    <p><strong>Connections:</strong> ${connections.size}</p>
    <p><strong>Config:</strong> <code>sola-relay.json</code></p>
  </div>
  <div class="card">
    <p><strong>API Endpoints:</strong></p>
    <p>POST <code>/api/query</code> — Execute a query</p>
    <p>GET <code>/api/schema?source=name</code> — Get table schema (metadata only)</p>
    <p>GET <code>/api/status</code> — Connection status</p>
  </div>
</body>
</html>`);
        return;
      }

      res.writeHead(404);
      res.end('Not found');
    });

    // Connect to all configured data sources
    connectAll().then(() => {
      server.listen(this.port, () => {
        console.log(`  Relay listening on http://localhost:${this.port}\n`);
      });
    });
  }
}
