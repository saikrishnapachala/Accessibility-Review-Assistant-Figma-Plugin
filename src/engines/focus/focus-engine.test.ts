import { describe, expect, it } from "vitest";

import type { AccessibilityModel, AccessibilityNode } from "../../model/accessibility-model";
import { createFocusGroupingPlan } from "./focus-engine";

function focusableNode(id: string, x: number, groupId: string | null): AccessibilityNode {
  const falseDecision = { certainty: "NOT_APPLICABLE", reasons: [], value: false } as const;
  return {
    bounds: { height: 44, width: 100, x, y: 100 },
    children: [],
    groupId,
    id,
    isFocusable: { certainty: "DETERMINISTIC", reasons: ["component"], value: true },
    isHeading: falseDecision,
    name: id,
    needsAltText: falseDecision,
    role: "BUTTON",
    sourceType: "INSTANCE",
    tabOrder: null,
    text: null,
  };
}

function model(children: readonly AccessibilityNode[]): AccessibilityModel {
  const falseDecision = { certainty: "NOT_APPLICABLE", reasons: [], value: false } as const;
  return {
    root: {
      bounds: { height: 844, width: 390, x: 0, y: 0 },
      children,
      groupId: null,
      id: "screen",
      isFocusable: falseDecision,
      isHeading: falseDecision,
      name: "Screen",
      needsAltText: falseDecision,
      role: "SCREEN",
      sourceType: "FRAME",
      tabOrder: null,
      text: null,
    },
    screenName: "Screen",
    sourceNodeId: "screen",
  };
}

describe("createFocusGroupingPlan", () => {
  it("combines controls that share an explicit model group", () => {
    const plan = createFocusGroupingPlan(
      model([
        focusableNode("first", 20, "segmented"),
        focusableNode("second", 130, "segmented"),
      ]),
    );

    expect(plan.annotations).toEqual([
      expect.objectContaining({
        bounds: { height: 44, width: 210, x: 20, y: 100 },
        kind: "FOCUS_RECTANGLE",
        targetNodeIds: ["first", "second"],
      }),
    ]);
  });
});
