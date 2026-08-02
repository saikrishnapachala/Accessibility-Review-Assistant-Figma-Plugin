import {
  flattenAccessibilityNodes,
  type AccessibilityModel,
} from "../../model/accessibility-model";
import type { ReviewSectionPlan } from "../../render-plan/types";
import { reviewStatusFromDecision } from "../shared";

export function createContentHierarchyPlan(
  model: AccessibilityModel,
): ReviewSectionPlan {
  const headingAnnotations = flattenAccessibilityNodes(model.root)
    .filter((node) => node.id !== model.root.id && node.isHeading.value)
    .map((node) => ({
      bounds: node.bounds,
      id: `heading:${node.id}`,
      kind: "HEADING" as const,
      label: "H" as const,
      reviewStatus: reviewStatusFromDecision(node.isHeading),
      targetNodeIds: Object.freeze([node.id]),
      text: node.text ?? node.name,
    }));

  return Object.freeze({
    annotations: Object.freeze([
      Object.freeze({
        bounds: model.root.bounds,
        id: `screen-title:${model.root.id}`,
        kind: "SCREEN_TITLE" as const,
        label: model.screenName,
        reviewStatus: "CONFIRMED" as const,
        targetNodeIds: Object.freeze([model.root.id]),
      }),
      ...headingAnnotations.map((annotation) => Object.freeze(annotation)),
    ]),
    category: "CONTENT_HIERARCHY",
    title: "Content Hierarchy",
  });
}
