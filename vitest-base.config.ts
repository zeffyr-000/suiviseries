import { defineConfig } from 'vitest/config';

// Loaded by the @angular/build:unit-test builder via `runnerConfig` in angular.json.
// Force the jsdom environment: the builder's smart default picks happy-dom when it is
// installed, but happy-dom breaks Angular CDK's passive-listener probing
// (`window.addEventListener is not a function`) for Material components (focus-monitor).
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
