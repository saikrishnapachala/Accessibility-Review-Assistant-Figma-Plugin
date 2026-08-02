import { startPlugin, type PluginRuntime } from "./controller";
import { createFigmaScreenParser } from "../parser/figma-screen-parser";
import { createFigmaWorkspaceRenderer } from "../renderer/figma-renderer";
import { createReviewApplication } from "./review-application";

const runtime: PluginRuntime = {
  close: () => {
    figma.closePlugin();
  },
  postToUi: (message) => {
    figma.ui.postMessage(message);
  },
  showUi: (html, options) => {
    figma.showUI(html, options);
  },
  subscribeToSelectionChanges: (handler) => {
    figma.on("selectionchange", handler);
  },
  subscribeToUiMessages: (handler) => {
    figma.ui.onmessage = handler;
  },
};

startPlugin(
  runtime,
  createReviewApplication(
    createFigmaScreenParser(figma),
    createFigmaWorkspaceRenderer(figma),
  ),
  __html__,
);
