import {
  flattenAccessibilityNodes,
  type AccessibilityModel,
  type AccessibilityNode,
} from "../../model/accessibility-model";
import type {
  AnnotationReviewStatus,
  FocusRectangleAnnotation,
  ReviewSectionPlan,
} from "../../render-plan/types";
import { reviewStatusFromDecision, unionBounds } from "../shared";

function groupedFocusableNodes(
  nodes: readonly AccessibilityNode[],
): ReadonlyMap<string, readonly AccessibilityNode[]> {
  const groups = new Map<string, AccessibilityNode[]>();
  for (const node of nodes) {
    const key = node.groupId ?? node.id;
    const group = groups.get(key) ?? [];
    group.push(node);
    groups.set(key, group);
  }
  return groups;
}

function groupReviewStatus(
  nodes: readonly AccessibilityNode[],
): AnnotationReviewStatus {
  return nodes.every(({ isFocusable }) => isFocusable.certainty === "DETERMINISTIC")
    ? "CONFIRMED"
    : "NEEDS_REVIEW";
}

export function createFocusGroupingPlan(
  model: AccessibilityModel,
): ReviewSectionPlan {
  const focusableNodes = flattenAccessibilityNodes(model.root).filter(
    ({ isFocusable }) => isFocusable.value,
  );
  const annotations: FocusRectangleAnnotation[] = [];

  for (const [groupId, nodes] of groupedFocusableNodes(focusableNodes)) {
    const isGroup = nodes.length > 1 || nodes[0]?.groupId !== null;
    const first = nodes[0];
    if (first === undefined) {
      continue;
    }

    annotations.push(
      Object.freeze({
        bounds: isGroup ? unionBounds(nodes) : first.bounds,
        id: `focus:${groupId}`,
        kind: "FOCUS_RECTANGLE",
        label: isGroup ? "Focus group" : first.name,
        reviewStatus: isGroup
          ? groupReviewStatus(nodes)
          : reviewStatusFromDecision(first.isFocusable),
        targetNodeIds: Object.freeze(nodes.map(({ id }) => id)),
      }),
    );
  }

  return Object.freeze({
    annotations: Object.freeze(annotations),
    category: "FOCUS_GROUPING",
    title: "Focus Grouping",
  });
}
