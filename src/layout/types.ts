import type { Bounds } from "../parser/types";
import type {
  AnnotationPlan,
  ReviewCategory,
  RenderPlan,
} from "../render-plan/types";

export interface PlacedAnnotation {
  readonly annotation: AnnotationPlan;
  readonly labelBounds: Bounds | null;
  readonly targetBounds: Bounds;
}

export interface WorkspaceSectionLayout {
  readonly annotations: readonly PlacedAnnotation[];
  readonly bounds: Bounds;
  readonly category: ReviewCategory;
  readonly screenBounds: Bounds;
  readonly title: string;
}

export interface WorkspaceLayout {
  readonly height: number;
  readonly renderPlan: RenderPlan;
  readonly sections: readonly WorkspaceSectionLayout[];
  readonly width: number;
}
