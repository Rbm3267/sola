import type { RefObject } from 'react';
import type { ObserveOptions, SolaSentinel } from './index.js';

export interface UseSentinelResult<T extends HTMLElement = HTMLElement> {
  /** Attach to the element containing the fields to watch. */
  ref: RefObject<T>;
  /** The most recent prompt, or null before the gate has opened. */
  prompt: string | null;
  sentinel: SolaSentinel | null;
}

export function useSentinel<T extends HTMLElement = HTMLElement>(
  options?: ObserveOptions
): UseSentinelResult<T>;
