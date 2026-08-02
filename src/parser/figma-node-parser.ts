import type { FrameNode, SceneNode } from "@figma/plugin-typings/plugin-api-standalone";

import type {
  AutoLayoutMetadata,
  Bounds,
  ParsedNode,
  ParsedScreen,
  ParsedText,
} from "./types";

function readBounds(node: SceneNode): Bounds | null {
  const bounds = node.absoluteBoundingBox;
  if (bounds === null) {
    return null;
  }

  return Object.freeze({
    height: bounds.height,
    width: bounds.width,
    x: bounds.x,
    y: bounds.y,
  });
}

function readAutoLayout(node: SceneNode): AutoLayoutMetadata | null {
  if (!("layoutMode" in node)) {
    return null;
  }

  const layoutMode = node.layoutMode;
  if (
    layoutMode !== "HORIZONTAL" &&
    layoutMode !== "VERTICAL" &&
    layoutMode !== "NONE"
  ) {
    return null;
  }

  return Object.freeze({
    counterAxisAlignItems:
      "counterAxisAlignItems" in node ? node.counterAxisAlignItems : null,
    itemSpacing: "itemSpacing" in node ? node.itemSpacing : null,
    layoutMode,
    paddingBottom: "paddingBottom" in node ? node.paddingBottom : 0,
    paddingLeft: "paddingLeft" in node ? node.paddingLeft : 0,
    paddingRight: "paddingRight" in node ? node.paddingRight : 0,
    paddingTop: "paddingTop" in node ? node.paddingTop : 0,
    primaryAxisAlignItems:
      "primaryAxisAlignItems" in node ? node.primaryAxisAlignItems : null,
  });
}

function readText(node: SceneNode): ParsedText | null {
  if (node.type !== "TEXT") {
    return null;
  }

  const fontName = node.fontName;
  const lineHeight = node.lineHeight;

  return Object.freeze({
    characters: node.characters,
    fontSize: typeof node.fontSize === "number" ? node.fontSize : null,
    fontStyle: typeof fontName === "object" ? fontName.style : null,
    fontWeight: typeof node.fontWeight === "number" ? node.fontWeight : null,
    lineHeight:
      typeof lineHeight === "object" && lineHeight.unit === "PIXELS"
        ? lineHeight.value
        : null,
  });
}

function hasImageFill(node: SceneNode): boolean {
  if (!("fills" in node) || !Array.isArray(node.fills)) {
    return false;
  }

  return node.fills.some((fill) => fill.type === "IMAGE" && fill.visible !== false);
}

async function readComponentName(node: SceneNode): Promise<string | null> {
  if (node.type === "COMPONENT") {
    return node.name;
  }

  if (node.type !== "INSTANCE") {
    return null;
  }

  const mainComponent = await node.getMainComponentAsync();
  return mainComponent?.name ?? node.name;
}

function readVariantProperties(node: SceneNode): Readonly<Record<string, string>> {
  if (node.type !== "INSTANCE" || node.variantProperties === null) {
    return Object.freeze({});
  }

  return Object.freeze({ ...node.variantProperties });
}

async function parseNode(node: SceneNode): Promise<ParsedNode> {
  const children = "children" in node
    ? await Promise.all(node.children.map((child) => parseNode(child)))
    : [];

  return Object.freeze({
    autoLayout: readAutoLayout(node),
    bounds: readBounds(node),
    children: Object.freeze(children),
    componentName: await readComponentName(node),
    hasImageFill: hasImageFill(node),
    id: node.id,
    name: node.name,
    opacity: "opacity" in node ? node.opacity : 1,
    text: readText(node),
    type: node.type,
    variantProperties: readVariantProperties(node),
    visible: "visible" in node ? node.visible : true,
  });
}

export async function parseFigmaScreen(frame: FrameNode): Promise<ParsedScreen> {
  return Object.freeze({
    root: await parseNode(frame),
    sourceNodeId: frame.id,
  });
}
