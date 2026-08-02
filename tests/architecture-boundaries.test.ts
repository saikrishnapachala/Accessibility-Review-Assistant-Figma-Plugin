import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const FIGMA_INDEPENDENT_FILES = [
  "src/config/accessibility-rules.ts",
  "src/model/accessibility-model.ts",
  "src/model/build-accessibility-model.ts",
  "src/engines/run-engines.ts",
  "src/engines/heading/heading-engine.ts",
  "src/engines/focus/focus-engine.ts",
  "src/engines/text-alternative/text-alternative-engine.ts",
  "src/engines/tab-order/tab-order-engine.ts",
  "src/layout/workspace-layout.ts",
  "src/render-plan/types.ts",
  "src/plugin/review-application.ts",
] as const;

describe("architecture boundaries", () => {
  it("keeps business logic independent of Figma APIs", async () => {
    const sources = await Promise.all(
      FIGMA_INDEPENDENT_FILES.map((file) =>
        readFile(resolve(process.cwd(), file), "utf8"),
      ),
    );

    for (const source of sources) {
      expect(source).not.toContain("@figma/plugin-typings");
      expect(source).not.toMatch(/\bPluginAPI\b/u);
      expect(source).not.toMatch(/\bfigma\./u);
    }
  });
});
