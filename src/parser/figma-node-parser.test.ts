import type {
  FrameNode,
  InstanceNode,
  TextNode,
} from "@figma/plugin-typings/plugin-api-standalone";
import { describe, expect, it } from "vitest";

import { parseFigmaScreen } from "./figma-node-parser";

describe("parseFigmaScreen", () => {
  it("captures geometry, text, component, variant, image, and Auto Layout data", async () => {
    const text = {
      absoluteBoundingBox: { height: 28, width: 180, x: 20, y: 40 },
      characters: "Search destinations",
      fills: [],
      fontName: { family: "Inter", style: "Bold" },
      fontSize: 24,
      fontWeight: 700,
      id: "title",
      lineHeight: { unit: "PIXELS", value: 28 },
      name: "Screen title",
      opacity: 1,
      type: "TEXT",
      visible: true,
    } as unknown as TextNode;
    const instance = {
      absoluteBoundingBox: { height: 44, width: 160, x: 20, y: 100 },
      children: [],
      fills: [{ imageHash: "image", scaleMode: "FILL", type: "IMAGE" }],
      getMainComponentAsync: async () => ({ name: "Primary Button" }),
      id: "button",
      layoutMode: "HORIZONTAL",
      name: "Continue",
      opacity: 1,
      variantProperties: { State: "Default" },
      visible: true,
      type: "INSTANCE",
      counterAxisAlignItems: "CENTER",
      itemSpacing: 8,
      paddingBottom: 12,
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 12,
      primaryAxisAlignItems: "CENTER",
    } as unknown as InstanceNode;
    const frame = {
      absoluteBoundingBox: { height: 844, width: 390, x: 0, y: 0 },
      children: [text, instance],
      fills: [],
      id: "screen",
      layoutMode: "NONE",
      name: "Search",
      opacity: 1,
      type: "FRAME",
      visible: true,
    } as unknown as FrameNode;

    const parsed = await parseFigmaScreen(frame);

    expect(parsed.root.children[0]).toMatchObject({
      text: {
        characters: "Search destinations",
        fontSize: 24,
        fontWeight: 700,
      },
      type: "TEXT",
    });
    expect(parsed.root.children[1]).toMatchObject({
      autoLayout: { itemSpacing: 8, layoutMode: "HORIZONTAL" },
      componentName: "Primary Button",
      hasImageFill: true,
      variantProperties: { State: "Default" },
    });
  });
});
