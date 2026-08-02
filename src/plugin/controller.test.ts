import { describe, expect, it, vi } from "vitest";

import type { PluginToUiMessage } from "../contracts/messages";
import { success } from "../shared/result";
import { startPlugin, type PluginRuntime } from "./controller";
import type { ReviewApplication } from "./review-application";

function createHarness(): {
  readonly application: ReviewApplication;
  readonly close: ReturnType<typeof vi.fn>;
  readonly getMessageHandler: () => (message: unknown) => void;
  readonly postToUi: ReturnType<typeof vi.fn<(message: PluginToUiMessage) => void>>;
  readonly runtime: PluginRuntime;
  readonly showUi: ReturnType<typeof vi.fn>;
} {
  const close = vi.fn();
  const postToUi = vi.fn<(message: PluginToUiMessage) => void>();
  const showUi = vi.fn();
  let messageHandler: ((message: unknown) => void) | undefined;

  return {
    application: {
      generate: vi.fn(async (_categories, reportProgress) => {
        reportProgress("ANALYZING", "Analyzing…");
        return success({
          annotationCount: 7,
          durationMs: 50,
          sectionCount: 4,
          workspaceId: "workspace",
        });
      }),
      readSelection: () => ({
        frameId: "screen",
        frameName: "Search",
        message: "Ready",
        valid: true,
      }),
      removeGenerated: () => success(1),
    },
    close,
    getMessageHandler: () => {
      if (messageHandler === undefined) {
        throw new Error("UI message handler was not registered.");
      }
      return messageHandler;
    },
    postToUi,
    runtime: {
      close,
      postToUi,
      showUi,
      subscribeToSelectionChanges: vi.fn(),
      subscribeToUiMessages: (handler) => {
        messageHandler = handler;
      },
    },
    showUi,
  };
}

const categories = {
  CONTENT_HIERARCHY: true,
  FOCUS_GROUPING: true,
  TAB_ORDER: true,
  TEXT_ALTERNATIVES: true,
} as const;

describe("startPlugin", () => {
  it("opens the UI and immediately publishes selection state", () => {
    const { application, postToUi, runtime, showUi } = createHarness();

    startPlugin(runtime, application, "<html>UI</html>");

    expect(showUi).toHaveBeenCalledWith("<html>UI</html>", {
      height: 500,
      width: 380,
    });
    expect(postToUi).toHaveBeenCalledWith(
      expect.objectContaining({
        selection: expect.objectContaining({ frameName: "Search", valid: true }),
        type: "selection-state",
      }),
    );
  });

  it("reports progress and completion for generation", async () => {
    const { application, getMessageHandler, postToUi, runtime } = createHarness();
    startPlugin(runtime, application, "<html>UI</html>");

    getMessageHandler()({ categories, type: "generate" });

    await vi.waitFor(() => {
      expect(postToUi).toHaveBeenCalledWith({
        annotationCount: 7,
        durationMs: 50,
        sectionCount: 4,
        type: "complete",
      });
    });
    expect(postToUi).toHaveBeenCalledWith({
      message: "Analyzing…",
      phase: "ANALYZING",
      type: "progress",
    });
  });

  it("removes generated content through the application boundary", () => {
    const { application, getMessageHandler, postToUi, runtime } = createHarness();
    startPlugin(runtime, application, "<html>UI</html>");

    getMessageHandler()({ type: "remove-generated" });

    expect(postToUi).toHaveBeenCalledWith({ removedCount: 1, type: "removed" });
  });

  it("closes only for a valid close message", () => {
    const { application, close, getMessageHandler, runtime } = createHarness();
    startPlugin(runtime, application, "<html>UI</html>");

    const handleMessage = getMessageHandler();
    handleMessage({ type: "unknown" });
    handleMessage(null);
    expect(close).not.toHaveBeenCalled();

    handleMessage({ type: "close" });
    expect(close).toHaveBeenCalledOnce();
  });
});
