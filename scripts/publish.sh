#!/usr/bin/env bash
# Publish all Sola packages to npm in dependency order.
# Run from the repo root: bash scripts/publish.sh
# Requires: npm login (or NPM_TOKEN set in env)

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

publish() {
  local pkg="$1"
  echo ""
  echo "▶ Publishing $pkg..."
  cd "$ROOT/packages/$pkg"
  npm publish --access public
  cd "$ROOT"
}

# Dependency order: core → compiler → vite-plugin → relay → mcp → sola-air (meta)
publish core
publish compiler
publish vite-plugin-sola
publish relay
publish sola-mcp
publish sola-air

echo ""
echo "✓ All packages published."
echo ""
echo "  npm install sola-air          # full install"
echo "  npm install @sola/core        # runtime only"
echo "  npm install @sola/compiler    # compiler only"
echo "  npx sola-mcp                  # MCP server for Claude Code"
