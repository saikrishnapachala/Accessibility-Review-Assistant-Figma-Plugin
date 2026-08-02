import type { Bounds } from "../parser/types";

export type ReviewCategory =
  | "CONTENT_HIERARCHY"
  | "FOCUS_GROUPING"
  | "TAB_ORDER"
  | "TEXT_ALTERNATIVES";

export type AnnotationReviewStatus = "CONFIRMED" | "NEEDS_REVIEW";

interface AnnotationBase {
  readonly bounds: Bounds;
  readonly id: string;
  readonly reviewStatus: AnnotationReviewStatus;
  readonly targetNodeIds: readonly string[];
}

export interface ScreenTitleAnnotation extends AnnotationBase {
  readonly kind: "SCREEN_TITLE";
  readonly label: string;
}

export interface HeadingAnnotation extends AnnotationBase {
  readonly kind: "HEADING";
  readonly label: "H";
  readonly text: string;
}

export interface FocusRectangleAnnotation extends AnnotationBase {
  readonly kind: "FOCUS_RECTANGLE";
  readonly label: string;
}

export interface TextAlternativeAnnotation extends AnnotationBase {
  readonly kind: "TEXT_ALTERNATIVE";
  readonly placeholder: string;
}

export interface TabBadgeAnnotation extends AnnotationBase {
  readonly kind: "TAB_BADGE";
  readonly order: number;
}

export interface TouchTargetAnnotation extends AnnotationBase {
  readonly actualHeight: number;
  readonly actualWidth: number;
  readonly kind: "TOUCH_TARGET";
  readonly minimumHeight: 44;
  readonly minimumWidth: 44;
}

export type AnnotationPlan =
  | FocusRectangleAnnotation
  | HeadingAnnotation
  | ScreenTitleAnnotation
  | TabBadgeAnnotation
  | TextAlternativeAnnotation
  | TouchTargetAnnotation;

export interface ReviewSectionPlan {
  readonly annotations: readonly AnnotationPlan[];
  readonly category: ReviewCategory;
  readonly title: string;
}

export interface RenderPlan {
  readonly screenHeight: number;
  readonly screenName: string;
  readonly screenWidth: number;
  readonly sections: readonly ReviewSectionPlan[];
  readonly sourceNodeId: string;
}
