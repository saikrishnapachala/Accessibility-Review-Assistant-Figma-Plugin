import type { BaseNodeMixin } from "@figma/plugin-typings/plugin-api-standalone";

export const GENERATION_TAGS = Object.freeze({
  generatedType: "accessibilityReviewAssistantType",
  sourceNodeId: "accessibilityReviewAssistantSourceNodeId",
  version: "accessibilityReviewAssistantVersion",
});

export const GENERATION_VERSION = "1";

export type GeneratedNodeType =
  | "annotation"
  | "component"
  | "section"
  | "workspace";

export function tagGeneratedNode(
  node: BaseNodeMixin,
  type: GeneratedNodeType,
  sourceNodeId: string,
): void {
  node.setPluginData(GENERATION_TAGS.generatedType, type);
  node.setPluginData(GENERATION_TAGS.sourceNodeId, sourceNodeId);
  node.setPluginData(GENERATION_TAGS.version, GENERATION_VERSION);
}
