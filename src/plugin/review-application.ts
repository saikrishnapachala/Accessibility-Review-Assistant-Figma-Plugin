import type { PluginToUiMessage } from "../contracts/messages";
import {
  runAccessibilityEngines,
  type EnabledReviewCategories,
} from "../engines/run-engines";
import { layoutWorkspace } from "../layout/workspace-layout";
import { buildAccessibilityModel } from "../model/build-accessibility-model";
import type { ScreenParser } from "../parser/screen-parser";
import type { SelectionError } from "../parser/selection-validation";
import type {
  RenderError,
  RenderSummary,
  WorkspaceRenderer,
} from "../renderer/workspace-renderer";
import { failure, success, type Result } from "../shared/result";

export interface SelectionState {
  readonly frameId: string | null;
  readonly frameName: string | null;
  readonly message: string;
  readonly valid: boolean;
}

export type ApplicationError = SelectionError | RenderError;
export type ProgressPhase = Extract<PluginToUiMessage, { type: "progress" }>["phase"];

export interface ReviewApplication {
  generate(
    categories: EnabledReviewCategories,
    reportProgress: (phase: ProgressPhase, message: string) => void,
  ): Promise<Result<RenderSummary, ApplicationError>>;
  readSelection(): SelectionState;
  removeGenerated(): Result<number, SelectionError>;
}

function selectionStateFromError(error: SelectionError): SelectionState {
  return Object.freeze({
    frameId: null,
    frameName: null,
    message: error.message,
    valid: false,
  });
}

export function createReviewApplication(
  parser: ScreenParser,
  renderer: WorkspaceRenderer,
): ReviewApplication {
  return {
    async generate(categories, reportProgress) {
      reportProgress("ANALYZING", "Analyzing the selected screen…");
      const parsedScreen = await parser.parseSelectedScreen();
      if (!parsedScreen.ok) {
        return failure(parsedScreen.error);
      }
      const model = buildAccessibilityModel(parsedScreen.value);

      reportProgress("LAYING_OUT", "Preparing review sections and annotations…");
      const renderPlan = runAccessibilityEngines(model, categories);
      const workspaceLayout = layoutWorkspace(renderPlan);

      reportProgress("RENDERING", "Rendering the Greenlines review workspace…");
      return renderer.render(parsedScreen.value.sourceNodeId, workspaceLayout);
    },

    readSelection() {
      const selectedFrame = parser.readSelection();
      if (!selectedFrame.ok) {
        return selectionStateFromError(selectedFrame.error);
      }

      return Object.freeze({
        frameId: selectedFrame.value.id,
        frameName: selectedFrame.value.name,
        message: "Ready to generate an accessibility review.",
        valid: true,
      });
    },

    removeGenerated() {
      const selectedFrame = parser.readSelection();
      if (!selectedFrame.ok) {
        return failure(selectedFrame.error);
      }

      return success(renderer.remove(selectedFrame.value.id));
    },
  };
}
