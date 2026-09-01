# @sola-air-ui/mcp

An MCP (Model Context Protocol) server for [Sola AIR](https://sola-air.dev) — lets Claude Code (or any MCP-compatible client) compile `.sola` components and query the Sola API reference directly, without leaving your editor/agent session.

## Install & run

```bash
npx @sola-air-ui/mcp
```

## Add to Claude Code

```bash
claude mcp add sola -- npx @sola-air-ui/mcp
```

Once connected, an agent working in a Sola project can compile `.sola` files and look up component/API references as tool calls, instead of shelling out to the compiler manually.

## License

MIT — see the [repo root](https://github.com/rbm3267/sola-air) for the full license and [changelog](https://github.com/rbm3267/sola-air/blob/main/CHANGELOG.md).
