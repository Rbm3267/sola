// The Sentinel implementation now lives in @sola-air-ui/sentinel, which has no
// dependencies and works in React, Svelte, or plain DOM without adopting Sola.
//
// Core re-exports it so `import { createSentinel } from '@sola-air-ui/core'`
// keeps working exactly as before — one implementation, two entry points.
export { SolaSentinel, createSentinel } from '@sola-air-ui/sentinel';
