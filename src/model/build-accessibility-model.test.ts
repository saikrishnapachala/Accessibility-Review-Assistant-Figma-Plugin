import { describe, expect, it } from "vitest";

import type { ParsedNode, ParsedScreen } from "../parser/types";
import { buildAccessibilityModel } from "./build-accessibility-model";

function parsedNode(overrides: Partial<ParsedNode> = {}): ParsedNode {
  return {
    autoLayout: null,
    bounds: { height: 44, width: 120, x: 10, y: 10 },
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

function parsedScreen(children: readonly ParsedNode[]): ParsedScreen {
  return {
    root: parsedNode({
      bounds: { height: 844, width: 390, x: 100, y: 200 },
      children,
      id: "screen",
      name: "Search",
    }),
    sourceNodeId: "screen",
  };
}

describe("buildAccessibilityModel", () => {
  it("normalizes bounds and recognizes component-backed controls", () => {
    const model = buildAccessibilityModel(
      parsedScreen([
        parsedNode({
          bounds: { height: 44, width: 160, x: 120, y: 300 },
          componentName: "Primary Button",
          id: "continue",
          name: "Continue",
          type: "INSTANCE",
        }),
      ]),
    );

    expect(model.root.children[0]).toMatchObject({
      bounds: { height: 44, width: 160, x: 20, y: 100 },
      isFocusable: { certainty: "DETERMINISTIC", value: true },
      role: "BUTTON",
    });
  });

  it("marks inferred headings and visual alternatives for human review", () => {
    const model = buildAccessibilityModel(
      parsedScreen([
        parsedNode({
          id: "title",
          name: "Section heading",
          text: {
            characters: "Popular destinations",
            fontSize: 24,
            fontStyle: "Bold",
            fontWeight: 700,
            lineHeight: 28,
          },
          type: "TEXT",
        }),
        parsedNode({ hasImageFill: true, id: "photo", name: "Beach", type: "RECTANGLE" }),
      ]),
    );

    expect(model.root.children[0]?.isHeading).toMatchObject({
      certainty: "NEEDS_REVIEW",
      value: true,
    });
    expect(model.root.children[1]?.needsAltText).toMatchObject({
      certainty: "NEEDS_REVIEW",
      value: true,
    });
  });

  it("omits hidden and zero-sized nodes", () => {
    const model = buildAccessibilityModel(
      parsedScreen([
        parsedNode({ id: "hidden", visible: false }),
        parsedNode({ bounds: { height: 0, width: 10, x: 0, y: 0 }, id: "empty" }),
      ]),
    );

    expect(model.root.children).toEqual([]);
  });

  it("rejects a screen without usable geometry", () => {
    expect(() =>
      buildAccessibilityModel({
        root: parsedNode({ bounds: null, id: "screen" }),
        sourceNodeId: "screen",
      }),
    ).toThrow("does not have usable bounds");
  });

  it("is directly inspectable as JSON", () => {
    const model = buildAccessibilityModel(parsedScreen([]));

    expect(JSON.parse(JSON.stringify(model))).toMatchObject({
      root: { role: "SCREEN" },
      screenName: "Search",
      sourceNodeId: "screen",
    });
  });
});
