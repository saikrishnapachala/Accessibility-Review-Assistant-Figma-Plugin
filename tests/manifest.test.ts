import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

interface PluginManifest {
  readonly api?: unknown;
  readonly documentAccess?: unknown;
  readonly editorType?: unknown;
  readonly main?: unknown;
  readonly networkAccess?: Readonly<{ allowedDomains?: unknown }>;
  readonly ui?: unknown;
}

describe("plugin manifest", () => {
  it("declares a local-only Figma plugin with build outputs", async () => {
    const manifestPath = resolve(process.cwd(), "manifest.json");
    const manifest = JSON.parse(
      await readFile(manifestPath, "utf8"),
    ) as PluginManifest;

    expect(manifest).toMatchObject({
      api: "1.0.0",
      documentAccess: "dynamic-page",
      editorType: ["figma"],
      main: "dist/code.js",
      networkAccess: { allowedDomains: ["none"] },
      ui: "dist/ui.html",
    });
  });
});
