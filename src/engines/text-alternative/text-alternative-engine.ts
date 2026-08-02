import {
  flattenAccessibilityNodes,
  type AccessibilityModel,
} from "../../model/accessibility-model";
import type { ReviewSectionPlan } from "../../render-plan/types";
import { reviewStatusFromDecision } from "../shared";

export function createTextAlternativesPlan(
  model: AccessibilityModel,
): ReviewSectionPlan {
  const annotations = flattenAccessibilityNodes(model.root)
    .filter(({ needsAltText }) => needsAltText.value)
    .map((node) =>
      Object.freeze({
        bounds: node.bounds,
        id: `alt:${node.id}`,
        kind: "TEXT_ALTERNATIVE" as const,
        placeholder: `Describe “${node.name}” or mark it decorative`,
        reviewStatus: reviewStatusFromDecision(node.needsAltText),
        targetNodeIds: Object.freeze([node.id]),
      }),
    );

  return Object.freeze({
    annotations: Object.freeze(annotations),
    category: "TEXT_ALTERNATIVES",
    title: "Text Alternatives",
  });
}
