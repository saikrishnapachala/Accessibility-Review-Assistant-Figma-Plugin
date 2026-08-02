import type { WorkspaceLayout } from "../layout/types";
import type { Result } from "../shared/result";

export type RenderError =
  | Readonly<{
      code: "NO_REVIEW_CATEGORIES";
      message: "Enable at least one review category before generating.";
    }>
  | Readonly<{
      code: "SOURCE_NOT_FOUND";
      message: "The selected source frame is no longer available. Select it again.";
    }>;

export interface RenderSummary {
  readonly annotationCount: number;
  readonly durationMs: number;
  readonly sectionCount: number;
  readonly workspaceId: string;
}

export interface WorkspaceRenderer {
  remove(sourceNodeId: string): number;
  render(
    sourceNodeId: string,
    layout: WorkspaceLayout,
  ): Promise<Result<RenderSummary, RenderError>>;
}
