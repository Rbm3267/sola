// @sola-air-ui/sentinel — ambient behaviour observation, framework-agnostic.
//
// This is the part of Sola that works without adopting Sola: it watches how
// someone is filling a form, decides when a pause is meaningful, and builds a
// prompt describing what it saw. What you do with that prompt — call a model,
// look something up, show a hint — is yours.
//
// Zero dependencies, no build step, and none of our runtime in your page.

export { SolaSentinel, createSentinel } from './sentinel.js';
export { observe, fieldNameOf, isSensitive } from './observe.js';
