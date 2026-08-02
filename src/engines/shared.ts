import type {
  AccessibilityDecision,
  AccessibilityNode,
} from "../model/accessibility-model";
import type { AnnotationReviewStatus } from "../render-plan/types";

export function reviewStatusFromDecision(
  decision: AccessibilityDecision<boolean>,
): AnnotationReviewStatus {
  return decision.certainty === "DETERMINISTIC" ? "CONFIRMED" : "NEEDS_REVIEW";
}

export function unionBounds(nodes: readonly AccessibilityNode[]): AccessibilityNode["bounds"] {
  const first = nodes[0];
  if (first === undefined) {
    throw new Error("Cannot calculate bounds for an empty node collection.");
  }

  const left = Math.min(...nodes.map(({ bounds }) => bounds.x));
  const top = Math.min(...nodes.map(({ bounds }) => bounds.y));
  const right = Math.max(...nodes.map(({ bounds }) => bounds.x + bounds.width));
  const bottom = Math.max(...nodes.map(({ bounds }) => bounds.y + bounds.height));

  return Object.freeze({
    height: bottom - top,
    width: right - left,
    x: left,
    y: top,
  });
}
