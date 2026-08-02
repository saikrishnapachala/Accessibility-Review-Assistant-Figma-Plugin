import {
  DEFAULT_ACCESSIBILITY_RULESET,
  type AccessibilityRoleRule,
  type AccessibilityRuleset,
} from "../config/accessibility-rules";
import type { ParsedNode, ParsedScreen } from "../parser/types";
import type {
  AccessibilityDecision,
  AccessibilityModel,
  AccessibilityNode,
  AccessibilityRole,
} from "./accessibility-model";

function decision<TValue>(
  value: TValue,
  certainty: AccessibilityDecision<TValue>["certainty"],
  reasons: readonly string[] = [],
): AccessibilityDecision<TValue> {
  return Object.freeze({ certainty, reasons: Object.freeze([...reasons]), value });
}

function searchableName(node: ParsedNode): string {
  return [
    node.name,
    node.componentName ?? "",
    ...Object.entries(node.variantProperties).flatMap(([key, value]) => [key, value]),
  ].join(" ");
}

function matchRole(
  name: string,
  patterns: readonly AccessibilityRoleRule[],
): AccessibilityRole | null {
  return patterns.find(({ pattern }) => pattern.test(name))?.role ?? null;
}

function inferRole(
  node: ParsedNode,
  isRoot: boolean,
  ruleset: AccessibilityRuleset,
): AccessibilityRole {
  if (isRoot) {
    return "SCREEN";
  }

  const name = searchableName(node);
  const interactiveRole = matchRole(name, ruleset.interactiveRoles);
  if (interactiveRole !== null) {
    return interactiveRole;
  }

  const groupRole = matchRole(name, ruleset.groupingRoles);
  if (groupRole !== null) {
    return groupRole;
  }

  if (node.hasImageFill) {
    return "IMAGE";
  }

  if (/\b(avatar|profile photo)\b/iu.test(name)) {
    return "AVATAR";
  }

  if (
    node.type === "VECTOR" ||
    node.type === "BOOLEAN_OPERATION" ||
    /\bicon\b/iu.test(name)
  ) {
    return "ICON";
  }

  if (node.type === "TEXT") {
    return "TEXT";
  }

  return "UNKNOWN";
}

function inferFocusable(
  node: ParsedNode,
  role: AccessibilityRole,
): AccessibilityDecision<boolean> {
  if (
    role !== "BUTTON" &&
    role !== "INPUT" &&
    role !== "SEGMENTED_CONTROL" &&
    role !== "SWITCH"
  ) {
    return decision(false, "NOT_APPLICABLE");
  }

  const componentEvidence = node.componentName !== null;
  return decision(
    true,
    componentEvidence ? "DETERMINISTIC" : "NEEDS_REVIEW",
    [
      componentEvidence
        ? `Component metadata indicates ${role.toLowerCase().replaceAll("_", " ")}.`
        : `Layer naming suggests ${role.toLowerCase().replaceAll("_", " ")}; confirm intent.`,
    ],
  );
}

function inferHeading(node: ParsedNode): AccessibilityDecision<boolean> {
  if (node.text === null) {
    return decision(false, "NOT_APPLICABLE");
  }

  const nameSuggestsHeading = /\b(title|heading|header)\b/iu.test(node.name);
  const typographySuggestsHeading =
    (node.text.fontSize ?? 0) >= 20 && (node.text.fontWeight ?? 0) >= 600;

  if (!nameSuggestsHeading && !typographySuggestsHeading) {
    return decision(false, "DETERMINISTIC", ["No heading evidence was found."]);
  }

  const reasons = [
    ...(nameSuggestsHeading ? ["Layer naming suggests heading intent."] : []),
    ...(typographySuggestsHeading
      ? ["Typography is visually prominent enough to be a heading candidate."]
      : []),
  ];
  return decision(true, "NEEDS_REVIEW", reasons);
}

function inferAltText(
  role: AccessibilityRole,
): AccessibilityDecision<boolean> {
  if (
    role !== "AVATAR" &&
    role !== "ICON" &&
    role !== "IMAGE"
  ) {
    return decision(false, "NOT_APPLICABLE");
  }

  return decision(true, "NEEDS_REVIEW", [
    `${role.toLowerCase()} may convey information; confirm whether it is decorative and provide an alternative when needed.`,
  ]);
}

function isGroupingContainer(role: AccessibilityRole): boolean {
  return role === "CARD" || role === "GROUP" || role === "LIST" || role === "SEGMENTED_CONTROL";
}

function buildNode(
  node: ParsedNode,
  screenOrigin: Readonly<{ x: number; y: number }>,
  parentGroupId: string | null,
  isRoot: boolean,
  ruleset: AccessibilityRuleset,
): AccessibilityNode | null {
  if (
    !node.visible ||
    node.opacity <= 0.01 ||
    node.bounds === null ||
    node.bounds.height <= 0 ||
    node.bounds.width <= 0
  ) {
    return null;
  }

  const role = inferRole(node, isRoot, ruleset);
  const groupId = isGroupingContainer(role) ? node.id : parentGroupId;
  const children = node.children
    .map((child) => buildNode(child, screenOrigin, groupId, false, ruleset))
    .filter((child): child is AccessibilityNode => child !== null);

  return Object.freeze({
    bounds: Object.freeze({
      height: node.bounds.height,
      width: node.bounds.width,
      x: node.bounds.x - screenOrigin.x,
      y: node.bounds.y - screenOrigin.y,
    }),
    children: Object.freeze(children),
    groupId: parentGroupId,
    id: node.id,
    isFocusable: inferFocusable(node, role),
    isHeading: inferHeading(node),
    name: node.name,
    needsAltText: inferAltText(role),
    role,
    sourceType: node.type,
    tabOrder: null,
    text: node.text?.characters.trim() || null,
  });
}

export function buildAccessibilityModel(
  parsedScreen: ParsedScreen,
  ruleset: AccessibilityRuleset = DEFAULT_ACCESSIBILITY_RULESET,
): AccessibilityModel {
  const rootBounds = parsedScreen.root.bounds;
  if (rootBounds === null || rootBounds.height <= 0 || rootBounds.width <= 0) {
    throw new Error("The selected frame does not have usable bounds.");
  }

  const root = buildNode(
    parsedScreen.root,
    { x: rootBounds.x, y: rootBounds.y },
    null,
    true,
    ruleset,
  );
  if (root === null) {
    throw new Error("The selected frame is hidden or has unusable bounds.");
  }

  return Object.freeze({
    root,
    screenName: parsedScreen.root.name,
    sourceNodeId: parsedScreen.sourceNodeId,
  });
}
