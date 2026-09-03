// React binding, in its own entry point so importing the package in a
// non-React app never pulls React in.
import { useEffect, useRef, useState } from 'react';
import { observe } from './observe.js';

/**
 * Watch a form and get a prompt when the user pauses meaningfully.
 *
 *   const { ref, prompt } = useSentinel();
 *   return <form ref={ref}>…</form>;
 *
 * Nothing inside the form changes — no wrapper components, no per-field
 * handlers. That is the point: adopting this must not mean a rewrite.
 *
 * `onSuggest` is read through a ref so an inline arrow does not re-attach the
 * observer on every render, which is the usual way hooks like this silently
 * reset their own state.
 */
export function useSentinel(options = {}) {
  const ref = useRef(null);
  const [prompt, setPrompt] = useState(null);
  const [sentinel, setSentinel] = useState(null);

  const latest = useRef(options.onSuggest);
  latest.current = options.onSuggest;

  const { onSuggest: _ignored, pollMs, name, redact, ...gate } = options;
  // Gate settings are plain numbers; serialising them keeps the effect stable
  // when a caller passes a fresh object literal each render.
  const gateKey = JSON.stringify(gate);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const handle = observe(node, {
      ...JSON.parse(gateKey),
      name,
      pollMs,
      redact,
      onSuggest: (p, s) => {
        setPrompt(p);
        latest.current?.(p, s);
      }
    });
    setSentinel(handle.sentinel);
    return () => handle.disconnect();
  }, [gateKey, pollMs, name, redact]);

  return { ref, prompt, sentinel };
}
