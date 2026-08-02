import { describe, expect, it } from "vitest";

import { buildAccessibilityModel } from "../model/build-accessibility-model";
import type { ParsedNode } from "../parser/types";
import { runAccessibilityEngines } from "./run-engines";

function node(overrides: Partial<ParsedNode> = {}): ParsedNode {
  return {
    autoLayout: null,
    bounds: { height: 44, width: 120, x: 0, y: 0 },
    children: [],
    componentName: null,
    hasImageFill: false,
    id: "node",
    name: "Layer",
    opacity: 1,
    text: null,
    type: "FRAME",
    variantProperties: {},
    visible: true,
    ...overrides,
  };
}

function model() {
  return buildAccessibilityModel({
    root: node({
      bounds: { height: 844, width: 390, x: 0, y: 0 },
      children: [
        node({
          bounds: { height: 30, width: 200, x: 20, y: 60 },
          id: "heading",
          name: "Heading",
          text: {
            characters: "Plan your trip",
            fontSize: 24,
            fontStyle: "Bold",
            fontWeight: 700,
            lineHeight: 30,
          },
          type: "TEXT",
        }),
        node({
          bounds: { height: 40, width: 120, x: 20, y: 140 },
          componentName: "Primary Button",
          id: "button",
          name: "Continue",
          type: "INSTANCE",
        }),
        node({
          bounds: { height: 100, width: 160, x: 20, y: 220 },
          hasImageFill: true,
          id: "image",
          name: "Destination image",
          type: "RECTANGLE",
        }),
      ],
      id: "screen",
      name: "Trip Planner",
    }),
    sourceNodeId: "screen",
  });
}

const allCategories = {
  CONTENT_HIERARCHY: true,
  FOCUS_GROUPING: true,
  TAB_ORDER: true,
  TEXT_ALTERNATIVES: true,
} as const;

describe("runAccessibilityEngines", () => {
  it("creates all four review sections in stable order", () => {
    const plan = runAccessibilityEngines(model(), allCategories);

    expect(plan.sections.map(({ category }) => category)).toEqual([
      "CONTENT_HIERARCHY",
      "FOCUS_GROUPING",
      "TEXT_ALTERNATIVES",
      "TAB_ORDER",
    ]);
  });

  it("emits reviewer-visible uncertainty and touch-area findings", () => {
    const plan = runAccessibilityEngines(model(), allCategories);
    const annotations = plan.sections.flatMap(({ annotations }) => annotations);

    expect(annotations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "HEADING", reviewStatus: "NEEDS_REVIEW" }),
        expect.objectContaining({ kind: "TEXT_ALTERNATIVE", reviewStatus: "NEEDS_REVIEW" }),
        expect.objectContaining({ kind: "TAB_BADGE", order: 1 }),
        expect.objectContaining({ kind: "TOUCH_TARGET", minimumHeight: 44 }),
      ]),
    );
  });

  it("omits disabled review categories", () => {
    const plan = runAccessibilityEngines(model(), {
      ...allCategories,
      FOCUS_GROUPING: false,
      TEXT_ALTERNATIVES: false,
    });

    expect(plan.sections.map(({ category }) => category)).toEqual([
      "CONTENT_HIERARCHY",
      "TAB_ORDER",
    ]);
  });
});
