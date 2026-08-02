import type { AccessibilityRole } from "../model/accessibility-model";

export interface AccessibilityRoleRule {
  readonly pattern: RegExp;
  readonly role: AccessibilityRole;
}

export interface AccessibilityRuleset {
  readonly groupingRoles: readonly AccessibilityRoleRule[];
  readonly interactiveRoles: readonly AccessibilityRoleRule[];
  readonly version: string;
}

export const DEFAULT_ACCESSIBILITY_RULESET: AccessibilityRuleset = Object.freeze({
  groupingRoles: Object.freeze([
    Object.freeze({ pattern: /\b(list|collection)\b/iu, role: "LIST" }),
    Object.freeze({ pattern: /\b(card|tile)\b/iu, role: "CARD" }),
    Object.freeze({ pattern: /\b(group|section)\b/iu, role: "GROUP" }),
  ]),
  interactiveRoles: Object.freeze([
    Object.freeze({ pattern: /\b(switch|toggle)\b/iu, role: "SWITCH" }),
    Object.freeze({ pattern: /\b(text ?field|input|search ?field)\b/iu, role: "INPUT" }),
    Object.freeze({ pattern: /\b(segmented|segment control)\b/iu, role: "SEGMENTED_CONTROL" }),
    Object.freeze({
      pattern: /\b(button|btn|cta|link|tab item|menu item|checkbox|radio)\b/iu,
      role: "BUTTON",
    }),
  ]),
  version: "1.0.0",
});
