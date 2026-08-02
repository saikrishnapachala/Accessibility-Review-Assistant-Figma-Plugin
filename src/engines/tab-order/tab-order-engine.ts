import {
  flattenAccessibilityNodes,
  type AccessibilityModel,
  type AccessibilityNode,
} from "../../model/accessibility-model";
import type {
  AnnotationPlan,
  AnnotationReviewStatus,
  ReviewSectionPlan,
} from "../../render-plan/types";

const MINIMUM_TOUCH_TARGET = 44;
const ROW_TOLERANCE = 8;

function compareReadingOrder(
  first: AccessibilityNode,
  second: AccessibilityNode,
): number {
  const verticalDifference = first.bounds.y - second.bounds.y;
  if (Math.abs(verticalDifference) > ROW_TOLERANCE) {
    return verticalDifference;
  }

  const horizontalDifference = first.bounds.x - second.bounds.x;
  return horizontalDifference !== 0
    ? horizontalDifference
    : first.id.localeCompare(second.id);
}

function rangesOverlap(
  firstStart: number,
  firstLength: number,
  secondStart: number,
  secondLength: number,
): boolean {
  return (
    firstStart < secondStart + secondLength &&
    secondStart < firstStart + firstLength
  );
}

function isOrderAmbiguous(
  current: AccessibilityNode,
  previous: AccessibilityNode | undefined,
): boolean {
  if (previous === undefined) {
    return false;
  }

  return (
    rangesOverlap(
      current.bounds.x,
      current.bounds.width,
      previous.bounds.x,
      previous.bounds.width,
    ) &&
    rangesOverlap(
      current.bounds.y,
      current.bounds.height,
      previous.bounds.y,
      previous.bounds.height,
    )
  );
}

function tabReviewStatus(
  node: AccessibilityNode,
  ambiguous: boolean,
): AnnotationReviewStatus {
  return node.isFocusable.certainty === "DETERMINISTIC" && !ambiguous
    ? "CONFIRMED"
    : "NEEDS_REVIEW";
}

export function createTabOrderPlan(model: AccessibilityModel): ReviewSectionPlan {
  const focusableNodes = [...flattenAccessibilityNodes(model.root)]
    .filter(({ isFocusable }) => isFocusable.value)
    .sort(compareReadingOrder);
  const annotations: AnnotationPlan[] = [];

  for (const [index, node] of focusableNodes.entries()) {
    const previous = index > 0 ? focusableNodes[index - 1] : undefined;
    annotations.push(
      Object.freeze({
        bounds: node.bounds,
        id: `tab:${node.id}`,
        kind: "TAB_BADGE",
        order: index + 1,
        reviewStatus: tabReviewStatus(node, isOrderAmbiguous(node, previous)),
        targetNodeIds: Object.freeze([node.id]),
      }),
    );

    if (
      node.bounds.width < MINIMUM_TOUCH_TARGET ||
      node.bounds.height < MINIMUM_TOUCH_TARGET
    ) {
      annotations.push(
        Object.freeze({
          actualHeight: node.bounds.height,
          actualWidth: node.bounds.width,
          bounds: node.bounds,
          id: `touch:${node.id}`,
          kind: "TOUCH_TARGET",
          minimumHeight: MINIMUM_TOUCH_TARGET,
          minimumWidth: MINIMUM_TOUCH_TARGET,
          reviewStatus: "NEEDS_REVIEW",
          targetNodeIds: Object.freeze([node.id]),
        }),
      );
    }
  }

  return Object.freeze({
    annotations: Object.freeze(annotations),
    category: "TAB_ORDER",
    title: "Tab Order and Touch Areas",
  });
}
