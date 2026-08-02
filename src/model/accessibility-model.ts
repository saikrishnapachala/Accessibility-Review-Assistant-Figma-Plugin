import type { Bounds } from "../parser/types";

export type ReviewCertainty = "DETERMINISTIC" | "NEEDS_REVIEW" | "NOT_APPLICABLE";

export interface AccessibilityDecision<TValue> {
  readonly certainty: ReviewCertainty;
  readonly reasons: readonly string[];
  readonly value: TValue;
}

export type AccessibilityRole =
  | "AVATAR"
  | "BUTTON"
  | "CARD"
  | "GROUP"
  | "ICON"
  | "IMAGE"
  | "INPUT"
  | "LIST"
  | "SCREEN"
  | "SEGMENTED_CONTROL"
  | "SWITCH"
  | "TEXT"
  | "UNKNOWN";

export interface AccessibilityNode {
  readonly bounds: Bounds;
  readonly children: readonly AccessibilityNode[];
  readonly groupId: string | null;
  readonly id: string;
  readonly isFocusable: AccessibilityDecision<boolean>;
  readonly isHeading: AccessibilityDecision<boolean>;
  readonly name: string;
  readonly needsAltText: AccessibilityDecision<boolean>;
  readonly role: AccessibilityRole;
  readonly sourceType: string;
  readonly tabOrder: number | null;
  readonly text: string | null;
}

export interface AccessibilityModel {
  readonly root: AccessibilityNode;
  readonly screenName: string;
  readonly sourceNodeId: string;
}

export function flattenAccessibilityNodes(
  root: AccessibilityNode,
): readonly AccessibilityNode[] {
  const nodes: AccessibilityNode[] = [];
  const stack: AccessibilityNode[] = [root];

  while (stack.length > 0) {
    const node = stack.pop();
    if (node === undefined) {
      continue;
    }

    nodes.push(node);
    for (let index = node.children.length - 1; index >= 0; index -= 1) {
      const child = node.children[index];
      if (child !== undefined) {
        stack.push(child);
      }
    }
  }

  return Object.freeze(nodes);
}
