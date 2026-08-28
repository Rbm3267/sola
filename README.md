<p align="center">
  <img src="brand/logo/sola-logo-transparent.png" alt="Sola Logo" width="120" height="120" />
</p>

<h1 align="center">Sola</h1>

<p align="center">
  <b>The Ambient Intent Framework</b><br>
  Compile <code>.sola</code> components into zero-dependency vanilla DOM with native <code>$intent</code> signals that resolve AI state at the framework level.
</p>

<p align="center">
  <a href="https://sola-air.dev"><b>sola-air.dev →</b></a> • 
  <a href="https://sola-air.vercel.app"><b>sola-air.vercel.app →</b></a>
</p>

```bash
npm create sola@latest
```

---

## What is Sola?

Sola is a compiler-first JavaScript framework where AI isn't bolted on — it's a first-class reactive primitive. Write `.sola` files with familiar syntax, and the custom AST compiler outputs hyper-optimized vanilla DOM instructions. No virtual DOM. No heavy runtime framework. Just raw performance.

```html
<script>
  let count = $state(0);
  let doubled = $derived(() => count() * 2);
  let dashboard = $intent("Show MRR trend for Q3");
  let customerData = $data("postgres-primary:customers", { sync: "realtime" });
</script>

<div>
  <h1>Count: {count()}</h1>
  <p>Doubled: {doubled()}</p>
  <input bind:value="count" />

  {#if count() > 10}
    <p>High engagement detected.</p>
  {/if}
</div>

<style>
  h1 { color: #0ea5e9; font-weight: 800; }
</style>
```

The compiler transforms this into a self-contained ES module with:
- **Signals-based reactivity** — Fine-grained DOM updates, zero diffing
- **Scoped styles** — Auto-hashed CSS selectors per component
- **Native AI resolution** — `$intent` resolves structured data from any LLM provider
- **Zero-Knowledge Data Plane** — `$data` connects to local databases via Sola Relay without exposing private credentials to the cloud

---

## Why Sola?

| Feature | Sola | React | Svelte | Vue |
|---|---|---|---|---|
| **Bundle size** (hello world) | **~3.2 KB** | ~45 KB | ~4 KB | ~33 KB |
| **Virtual DOM Overhead** | **None (Direct DOM)** | Yes | No | Yes |
| **Built-in AI Intent Primitive** | **`$intent`** | ❌ | ❌ | ❌ |
| **Secure On-Prem Data Signals** | **`$data` (Sola Relay)** | ❌ | ❌ | ❌ |
| **Scoped Styles** | **Native AST** | CSS Modules | Native | Scoped |
| **Compiler Architecture** | **Acorn AST Transformer** | Babel / SWC | Custom | Template |

---

## Reactive Primitives

- **`$state(initial)`** — Fine-grained reactive signal
- **`$derived(() => fn)`** — Computed values with automatic dependency tracking
- **`$effect(() => fn)`** — Side effects with automatic cleanup
- **`$intent(prompt, options)`** — AI-native signal that resolves structured UI & data from LLMs
- **`$data(source, options)`** — Real-time reactive data pipeline connected through Sola Relay

---

## Monorepo Architecture

```
sola/
├── packages/
│   ├── compiler/    # Custom Acorn AST compiler (.sola -> JS + CSS)
│   ├── core/        # Reactive runtime engine (signals, effects, $intent, $data)
│   ├── ui/          # Standard component library (.sola files)
│   └── relay/       # Zero-knowledge local data proxy (PostgreSQL, MySQL)
├── brand/           # Official brand kit, logos, and favicons
└── app/             # Marketing site & interactive playground
```

---

## Operational Guide (By Role)

### 💻 Application Developers
*   **Workflow**: Build frontends using `.sola` files. Use `$state` and `$derived` for local state, and `$intent` to bind AI capability.
*   **Data Binding**: Connect components to backend databases or APIs using `$data("sheet://...")` or `$data("postgres://...")`.
*   **Security Caret**: Never commit credentials in code; pass only resource identifiers to `$data`.

### ⚙️ System Administrators
*   **Deployment**: Deploy the Sola Relay server on-premises or close to the databases.
    ```bash
    npm install -g @sola/relay
    sola-relay --config ./relay.json
    ```
*   **Access Provisioning**: Configure connection strings and table filters in `relay.json`.
*   **Monitoring**: Check the relay logs for latency targets and query performance (default target is sub-1ms signal propagation).

### 🔒 Security Engineers
*   **Credential Isolation**: Ensure that connection credentials (passwords, certificates) are set via local environment variables on the Sola Relay server. They never leave the private network.
*   **Query Sanitation**: Define read-only schema mappings and query rate-limits in Sola Relay config to prevent injections.
*   **Write-Back Gates**: Assign `TransactionCapability` parameters and security levels (Tiers 1 & 2) to control which mutations require confirmation overlays.

---

## License

MIT © 2026 Sola Contributors

