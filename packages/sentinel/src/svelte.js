// Svelte action. Put it on any element containing fields:
//
//   <form use:sentinel={{ onSuggest: (p) => (prompt = p) }}>…</form>
//
// Nothing inside the form has to change.
import { observe } from './observe.js';

export function sentinel(node, options = {}) {
  let handle = observe(node, options);
  return {
    update(next = {}) {
      handle.disconnect();
      handle = observe(node, next);
    },
    destroy() {
      handle.disconnect();
    }
  };
}
