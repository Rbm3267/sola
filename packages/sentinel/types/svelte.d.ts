import type { ObserveOptions } from './index.js';

export function sentinel(
  node: HTMLElement,
  options?: ObserveOptions
): { update(options?: ObserveOptions): void; destroy(): void };
