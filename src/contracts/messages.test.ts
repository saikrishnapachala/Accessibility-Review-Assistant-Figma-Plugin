import { describe, expect, it } from "vitest";

import { isPluginToUiMessage, isUiToPluginMessage } from "./messages";

describe("isUiToPluginMessage", () => {
  it("accepts a supported close message", () => {
    expect(isUiToPluginMessage({ type: "close" })).toBe(true);
  });

  it("accepts generate only when every category flag is boolean", () => {
    expect(
      isUiToPluginMessage({
        categories: {
          CONTENT_HIERARCHY: true,
          FOCUS_GROUPING: true,
          TAB_ORDER: false,
          TEXT_ALTERNATIVES: true,
        },
        type: "generate",
      }),
    ).toBe(true);
    expect(
      isUiToPluginMessage({
        categories: { CONTENT_HIERARCHY: true },
        type: "generate",
      }),
    ).toBe(false);
  });

  it.each([null, undefined, "close", 1, {}, { type: "generate" }])(
    "rejects invalid input: %j",
    (value) => {
      expect(isUiToPluginMessage(value)).toBe(false);
    },
  );
});

describe("isPluginToUiMessage", () => {
  it("accepts a complete generation summary", () => {
    expect(
      isPluginToUiMessage({
        annotationCount: 8,
        durationMs: 120,
        sectionCount: 4,
        type: "complete",
      }),
    ).toBe(true);
  });

  it("rejects malformed plugin messages", () => {
    expect(isPluginToUiMessage({ type: "complete" })).toBe(false);
    expect(isPluginToUiMessage({ message: 12, type: "error" })).toBe(false);
  });
});
