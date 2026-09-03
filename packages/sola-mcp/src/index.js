#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { compile } from '@sola-air-ui/compiler';

const server = new McpServer({
  name: 'sola-mcp',
  version: '1.0.0'
});

// ── compile_component ──────────────────────────────────────────────────────
server.tool(
  'compile_component',
  'Compile a Sola single-file component (.sola) to JavaScript. Returns the compiled ES module JS, scoped CSS, and any compilation errors.',
  {
    source: z.string().describe('The full .sola source — may include <script>, <template>, and <style> sections'),
    filename: z.string().optional().describe('Filename hint used in error messages (default: Component.sola)')
  },
  async ({ source, filename }) => {
    try {
      const result = compile(source, filename ?? 'Component.sola');
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ ok: true, js: result.code, css: result.css ?? null })
        }]
      };
    } catch (err) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ ok: false, error: err.message })
        }],
        isError: true
      };
    }
  }
);

// ── validate_component ─────────────────────────────────────────────────────
server.tool(
  'validate_component',
  'Validate a Sola single-file component without returning the full compiled output. Returns a list of errors.',
  {
    source: z.string().describe('The .sola source to validate')
  },
  async ({ source }) => {
    const errors = [];
    try {
      compile(source, 'validate.sola');
    } catch (err) {
      errors.push(err.message);
    }
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ valid: errors.length === 0, errors })
      }]
    };
  }
);

// ── sola://docs resource ───────────────────────────────────────────────────
server.resource(
  'sola-docs',
  'sola://docs',
  { description: 'Sola API reference — template syntax, runes, compiler output', mimeType: 'text/plain' },
  async () => ({
    contents: [{
      uri: 'sola://docs',
      mimeType: 'text/plain',
      text: SOLA_DOCS
    }]
  })
);

const SOLA_DOCS = `
# Sola Single-File Component Reference

## File Structure
A .sola file has three optional sections in any order:

  <script>   reactive logic (JavaScript)
  <template> declarative HTML with Sola template syntax
  <style>    scoped CSS (selectors are automatically namespaced)

---

## Script — Runes

$state      Reactive signal. Auto-generates a set_<name>() setter.
  let count = $state(0)
  // count()        → read current value
  // set_count(n)   → write new value

$derived    Derived computed value; re-evaluates when its signals change.
  let doubled = $derived(() => count() * 2)
  // doubled()      → read derived value

$intent     AI intent binding — connects a signal to an intent handler.
  let response = $intent({ prompt: 'Summarise {topic}', model: 'gemini' })

$data       Live data binding via the Sola Relay.
  let rows = $data({ source: 'users', limit: 50 })
  // rows()         → array of row objects

onMount(fn)   Runs fn once after the component is inserted into the DOM.
onDestroy(fn) Runs fn when the component is removed.

import Widget from './Widget.sola'   Import a child component.

---

## Template Syntax

Reactive text
  {expression}           Inserts a reactive text node.

Conditionals
  {#if condition}
    ...
  {:else if other}
    ...
  {:else}
    ...
  {/if}

Lists
  {#each items as item}
    ...
  {/each}

  {#each items as item, index}    With loop index.
    ...
  {/each}

Event listeners
  on:click="{handler}"          Standard DOM event.
  onclick="{() => fn(arg)}"     Arrow-function form (required when passing args).

Two-way binding
  bind:value="{signal}"         Syncs an <input> value to a signal.

Reactive attributes
  class="{expression}"          Any attribute can be made reactive with {}.
  data-value="{signal()}"

Child component usage
  <Widget />
  <Widget propName="{value}" />

---

## Compiler API

  import { compile } from '@sola-air-ui/compiler';

  const { js, css } = compile(source, filename?);
  // js   — ES module string; exports default mount(target, props)
  // css  — scoped CSS string (also injected automatically by mount)

The compiled mount function signature:
  mount(target: HTMLElement, ...props) → () => void
  // Returns an unmount / cleanup function.

---

## Runtime Exports (@sola-air-ui/core)

  createSignal(initial)    → [getter, setter]
  createEffect(fn)         Runs fn reactively; re-runs when signals it reads change.
  createDerived(fn)        → getter for a derived value.
  createIntent(config)     AI intent signal.
  createData(config)       Relay data signal.
  onMount(fn)
  onDestroy(fn)

---

## Quick Example

<script>
  let count = $state(0);
</script>

<template>
  <div>
    <p>Count: {count()}</p>
    <button onclick="{() => set_count(count() + 1)}">Increment</button>
  </div>
</template>

<style>
  p { font-size: 1.2rem; }
</style>
`.trim();

const transport = new StdioServerTransport();
await server.connect(transport);
