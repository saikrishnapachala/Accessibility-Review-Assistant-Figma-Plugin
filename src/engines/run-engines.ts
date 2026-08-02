import type { AccessibilityModel } from "../model/accessibility-model";
import type {
  RenderPlan,
  ReviewCategory,
  ReviewSectionPlan,
} from "../render-plan/types";
import { createFocusGroupingPlan } from "./focus/focus-engine";
import { createContentHierarchyPlan } from "./heading/heading-engine";
import { createTabOrderPlan } from "./tab-order/tab-order-engine";
import { createTextAlternativesPlan } from "./text-alternative/text-alternative-engine";

export type EnabledReviewCategories = Readonly<Record<ReviewCategory, boolean>>;

const ENGINE_ORDER: readonly Readonly<{
  category: ReviewCategory;
  createPlan: (model: AccessibilityModel) => ReviewSectionPlan;
}>[] = [
  { category: "CONTENT_HIERARCHY", createPlan: createContentHierarchyPlan },
  { category: "FOCUS_GROUPING", createPlan: createFocusGroupingPlan },
  { category: "TEXT_ALTERNATIVES", createPlan: createTextAlternativesPlan },
  { category: "TAB_ORDER", createPlan: createTabOrderPlan },
];

export function runAccessibilityEngines(
  model: AccessibilityModel,
  enabledCategories: EnabledReviewCategories,
): RenderPlan {
  return Object.freeze({
    screenHeight: model.root.bounds.height,
    screenName: model.screenName,
    screenWidth: model.root.bounds.width,
    sections: Object.freeze(
      ENGINE_ORDER.filter(({ category }) => enabledCategories[category]).map(
        ({ createPlan }) => createPlan(model),
      ),
    ),
    sourceNodeId: model.sourceNodeId,
  });
}
