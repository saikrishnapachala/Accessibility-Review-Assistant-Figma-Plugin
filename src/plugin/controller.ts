import {
  isUiToPluginMessage,
  type PluginToUiMessage,
} from "../contracts/messages";
import type { ReviewApplication } from "./review-application";

export interface PluginRuntime {
  close(): void;
  postToUi(message: PluginToUiMessage): void;
  showUi(html: string, options: Readonly<{ height: number; width: number }>): void;
  subscribeToSelectionChanges(handler: () => void): void;
  subscribeToUiMessages(handler: (message: unknown) => void): void;
}

const UI_SIZE = Object.freeze({
  height: 500,
  width: 380,
});

export function startPlugin(
  runtime: PluginRuntime,
  application: ReviewApplication,
  uiHtml: string,
): void {
  let generationInProgress = false;

  const publishSelection = (): void => {
    runtime.postToUi({
      selection: application.readSelection(),
      type: "selection-state",
    });
  };

  const handleGenerate = async (
    categories: Parameters<ReviewApplication["generate"]>[0],
  ): Promise<void> => {
    if (generationInProgress) {
      runtime.postToUi({
        message: "A review is already being generated.",
        type: "error",
      });
      return;
    }

    generationInProgress = true;
    try {
      const result = await application.generate(categories, (phase, message) => {
        runtime.postToUi({ message, phase, type: "progress" });
      });

      if (!result.ok) {
        runtime.postToUi({ message: result.error.message, type: "error" });
        return;
      }

      runtime.postToUi({
        annotationCount: result.value.annotationCount,
        durationMs: result.value.durationMs,
        sectionCount: result.value.sectionCount,
        type: "complete",
      });
    } catch (error) {
      console.error("Accessibility review generation failed", error);
      runtime.postToUi({
        message: "The review could not be generated. Try again or inspect the plugin console.",
        type: "error",
      });
    } finally {
      generationInProgress = false;
    }
  };

  runtime.showUi(uiHtml, UI_SIZE);
  runtime.subscribeToSelectionChanges(publishSelection);
  runtime.subscribeToUiMessages((message) => {
    if (!isUiToPluginMessage(message)) {
      runtime.postToUi({
        message: "The plugin received an unsupported UI request.",
        type: "error",
      });
      return;
    }

    switch (message.type) {
      case "close":
        runtime.close();
        break;
      case "refresh-selection":
        publishSelection();
        break;
      case "remove-generated": {
        const result = application.removeGenerated();
        if (result.ok) {
          runtime.postToUi({ removedCount: result.value, type: "removed" });
        } else {
          runtime.postToUi({ message: result.error.message, type: "error" });
        }
        break;
      }
      case "generate":
        void handleGenerate(message.categories);
        break;
    }
  });
  publishSelection();
}
