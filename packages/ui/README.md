# @sola-air-ui/ui

Real, importable `.sola` components for [Sola AIR](https://sola-air.dev) — a component library, not a set of code snippets to copy-paste. Each export below is a real `.sola` single-file component compiled the same way your own components are.

## Install

```bash
npm install @sola-air-ui/ui
```

## Usage

Import individual components by subpath:

```html
<script>
  import Table from '@sola-air-ui/ui/table';
  import Badge from '@sola-air-ui/ui/badge';
  import Modal from '@sola-air-ui/ui/modal';
</script>

<Table columns={columns} rows={rows} />
<Badge label="In Progress" variant="warning" />
```

## Components

**Layout & display** — `Card`, `Stack`, `Dashboard`, `Table`, `DataCard`, `StatGrid`, `Canvas`

**Inputs & forms** — `TextInput`, `Select`, `DatePicker`, `Toggle`, `Button`

**Feedback** — `Alert`, `Toast`, `Spinner`, `Badge`, `Modal`

**Content rendering** — `MarkdownViewer`, `HtmlViewer`, `Chart`, `StreamView`

**AI / intent-driven** — `IntentCard`, `IntentList`, `AmbientSuggestion`, and under `./ai/`: `ConversationThread`, `ActionStrip`, `ConfidenceBadge`, `IntentSheet`

Each has its own export path (e.g. `@sola-air-ui/ui/data-card`) — see `package.json` `exports` for the full map, or import everything from `@sola-air-ui/ui` directly.

## Peer dependency

Requires `@sola-air-ui/core` (installed automatically as a dependency) and expects your build to compile `.sola` files — use `@sola-air-ui/vite-plugin-sola`, or the `sola-air` meta-package for a complete setup.

## License

MIT — see the [repo root](https://github.com/rbm3267/sola-air) for the full license and [changelog](https://github.com/rbm3267/sola-air/blob/main/CHANGELOG.md).
