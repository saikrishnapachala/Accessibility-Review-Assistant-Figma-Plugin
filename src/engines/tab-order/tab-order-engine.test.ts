import { describe, expect, it } from "vitest";

import type { AccessibilityModel, AccessibilityNode } from "../../model/accessibility-model";
import { createTabOrderPlan } from "./tab-order-engine";

function node(
  id: string,
  bounds: AccessibilityNode["bounds"],
): AccessibilityNode {
  const falseDecision = { certainty: "NOT_APPLICABLE", reasons: [], value: false } as const;
  return {
    bounds,
    children: [],
    groupId: null,
    id,
    isFocusable: { certainty: "DETERMINISTIC", reasons: [], value: true },
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

describe("createTabOrderPlan", () => {
  it("orders controls top-to-bottom and left-to-right", () => {
    const plan = createTabOrderPlan(
      model([
        node("bottom", { height: 44, width: 100, x: 20, y: 200 }),
        node("right", { height: 44, width: 100, x: 140, y: 100 }),
        node("left", { height: 44, width: 100, x: 20, y: 100 }),
      ]),
    );

    expect(
      plan.annotations
        .filter(({ kind }) => kind === "TAB_BADGE")
        .map(({ targetNodeIds }) => targetNodeIds[0]),
    ).toEqual(["left", "right", "bottom"]);
  });

  it("flags overlapping order as uncertain", () => {
    const plan = createTabOrderPlan(
      model([
        node("one", { height: 44, width: 100, x: 20, y: 100 }),
        node("two", { height: 44, width: 100, x: 40, y: 105 }),
      ]),
    );

    expect(plan.annotations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "tab:two",
          reviewStatus: "NEEDS_REVIEW",
        }),
      ]),
    );
  });
});
