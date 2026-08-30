#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { compile } from './index.js';

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(`
  Usage:
    sola compile <file.sola> [options]

  Options:
    -o, --out <file>    Write compiled output to a file (default: stdout)
    -v, --version       Print compiler version
    -h, --help          Show this help message

  Examples:
    sola compile App.sola -o dist/App.js
    sola compile Component.sola
  `);
  process.exit(0);
}

if (args.includes('-v') || args.includes('--version')) {
  console.log('Sola Compiler v1.0.0');
  process.exit(0);
}

let inputFile = null;
let outputFile = null;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === 'compile') continue;
  if (arg === '-o' || arg === '--out') {
    outputFile = args[++i];
  } else if (!inputFile && !arg.startsWith('-')) {
    inputFile = arg;
  }
}

if (!inputFile) {
  console.error('Error: No input .sola file specified.');
  process.exit(1);
}

const inputPath = path.resolve(process.cwd(), inputFile);
if (!fs.existsSync(inputPath)) {
  console.error(`Error: File not found: ${inputFile}`);
  process.exit(1);
}

try {
  const source = fs.readFileSync(inputPath, 'utf8');
  const result = compile(source, inputFile);
  const code = result.code || result;

  if (outputFile) {
    const outPath = path.resolve(process.cwd(), outputFile);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, code, 'utf8');
    console.log(`✓ Compiled ${inputFile} -> ${outputFile} (${code.length} bytes)`);
  } else {
    console.log(code);
  }
} catch (err) {
  console.error(`Compilation Error: ${err.message}`);
  process.exit(1);
}
