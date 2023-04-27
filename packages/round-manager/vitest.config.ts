import { defineConfig } from "vitest/config";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
    deps: {
      inline: [
        "@spruceid/didkit-wasm",
        "viem",
        "@spruceid",
        "@gitcoinco/passport-sdk-verifier",
        "@gitcoinco",
      ],
    },
  },
});
