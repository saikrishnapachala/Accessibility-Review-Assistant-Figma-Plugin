import { describe, expect, it } from "vitest";

import { runAccessibilityEngines } from "../src/engines/run-engines";
import { layoutWorkspace } from "../src/layout/workspace-layout";
import { buildAccessibilityModel } from "../src/model/build-accessibility-model";
import type { ParsedNode } from "../src/parser/types";

function control(index: number): ParsedNode {
  return {
    autoLayout: null,
    bounds: {
      height: 44,
      width: 140,
      x: 20 + (index % 2) * 160,
      y: 20 + Math.floor(index / 2) * 52,
    },
    children: [],
    componentName: "Primary Button",
    hasImageFill: false,
    id: `control-${index}`,
    name: `Control ${index}`,
    opacity: 1,
    text: null,
    type: "INSTANCE",
    variantProperties: {},
    visible: true,
  };
}

describe("analysis performance", () => {
  it("builds and lays out a large deterministic screen well under the MVP budget", () => {
    const children = Array.from({ length: 1_000 }, (_, index) => control(index));
    const startedAt = Date.now();
    const model = buildAccessibilityModel({
      root: {
        autoLayout: null,
        bounds: { height: 26_020, width: 390, x: 0, y: 0 },
        children,
        componentName: null,
        hasImageFill: false,
        id: "screen",
        name: "Large Screen",
        opacity: 1,
        text: null,
        type: "FRAME",
        variantProperties: {},
        visible: true,
      },
      sourceNodeId: "screen",
    });
    const renderPlan = runAccessibilityEngines(model, {
      CONTENT_HIERARCHY: true,
      FOCUS_GROUPING: true,
      TAB_ORDER: true,
      TEXT_ALTERNATIVES: true,
    });
    const layout = layoutWorkspace(renderPlan);
    const durationMs = Date.now() - startedAt;

    expect(layout.sections).toHaveLength(4);
    expect(durationMs).toBeLessThan(2_000);
  });
});
