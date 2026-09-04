# @sola-air-ui/behavior

Sola Behavioral Intent Engine for [Sola AIR](https://sola-air.dev) — real-time implicit UI adaptation based on interaction telemetry (typing velocity, hover dwell, rage-click detection) instead of explicit user settings. 100% client-side: no keystrokes are logged, only local timing vectors, and nothing leaves the device.

> **Experimental.** This package is real, working code, but it currently has no automated test coverage. Expect the API to move before 1.0.

## Install

```bash
npm install @sola-air-ui/behavior
```

## Usage

```ts
import { BehavioralObserver } from '@sola-air-ui/behavior';

const observer = new BehavioralObserver();

observer.subscribe((metrics) => {
  // metrics.persona: 'visual_explorer' | 'sre_commander' | 'finops_auditor'
  // metrics.densityMode: 'comfortable' | 'compact' | 'emergency'
  applyDensity(metrics.densityMode);
});
```

The observer infers a persona from real interaction patterns — typing speed, sustained hover/dwell targets (long-press on touch devices), and rage-click frequency — and persists the inferred persona locally so density/layout preferences carry across sessions without an explicit settings screen.

## License

MIT — see the [repo root](https://github.com/rbm3267/sola-air) for the full license and [changelog](https://github.com/rbm3267/sola-air/blob/main/CHANGELOG.md).
