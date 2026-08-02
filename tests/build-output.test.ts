import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("build output", () => {
  it("produces the plugin controller bundle", async () => {
    const code = await readFile(resolve(process.cwd(), "dist/code.js"), "utf8");

    expect(code).toContain("figma.showUI");
    expect(code).toContain("__html__");
  });

  it("inlines the UI JavaScript into the generated HTML", async () => {
    const html = await readFile(resolve(process.cwd(), "dist/ui.html"), "utf8");

    expect(html).toContain("Accessibility Review Assistant");
    expect(html).toContain("parent.postMessage");
    expect(html).not.toContain("<!-- UI_SCRIPT -->");
    expect(html).not.toMatch(/<script[^>]+src=/u);
  });
});
