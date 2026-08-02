import { describe, expect, it } from "vitest";

import type { RenderPlan } from "../render-plan/types";
import { layoutWorkspace } from "./workspace-layout";

const plan: RenderPlan = {
  screenHeight: 844,
  screenName: "Search",
  screenWidth: 390,
  sections: [
    {
      annotations: [
        {
          bounds: { height: 30, width: 200, x: 20, y: 60 },
          id: "heading:one",
          kind: "HEADING",
          label: "H",
          reviewStatus: "NEEDS_REVIEW",
          targetNodeIds: ["one"],
          text: "Heading one",
        },
        {
          bounds: { height: 30, width: 200, x: 20, y: 60 },
          id: "heading:two",
          kind: "HEADING",
          label: "H",
          reviewStatus: "NEEDS_REVIEW",
          targetNodeIds: ["two"],
          text: "Heading two",
        },
      ],
      category: "CONTENT_HIERARCHY",
      title: "Content Hierarchy",
    },
    {
      annotations: [],
      category: "FOCUS_GROUPING",
      title: "Focus Grouping",
    },
  ],
  sourceNodeId: "screen",
};

describe("layoutWorkspace", () => {
  it("places each review section without overlap", () => {
    const layout = layoutWorkspace(plan);
    const [first, second] = layout.sections;

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect((first?.bounds.x ?? 0) + (first?.bounds.width ?? 0)).toBeLessThan(
      second?.bounds.x ?? 0,
    );
  });

  it("translates annotation targets into section coordinates", () => {
    const annotation = layoutWorkspace(plan).sections[0]?.annotations[0];

    expect(annotation?.targetBounds).toEqual({
      height: 30,
      width: 200,
      x: 68,
      y: 156,
    });
  });

  it("moves colliding labels to different positions", () => {
    const annotations = layoutWorkspace(plan).sections[0]?.annotations ?? [];

    expect(annotations[0]?.labelBounds).not.toEqual(annotations[1]?.labelBounds);
  });

  it("returns a zero-width workspace when every category is disabled", () => {
    expect(layoutWorkspace({ ...plan, sections: [] })).toMatchObject({
      sections: [],
      width: 0,
    });
  });
});
