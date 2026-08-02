import type { PluginAPI } from "@figma/plugin-typings/plugin-api-standalone";

import { failure, success } from "../shared/result";
import { parseFigmaScreen } from "./figma-node-parser";
import { getSelectedFrame } from "./figma-selection";
import type { ScreenParser } from "./screen-parser";

export function createFigmaScreenParser(figmaApi: PluginAPI): ScreenParser {
  return {
    async parseSelectedScreen() {
      const frame = getSelectedFrame(figmaApi.currentPage.selection);
      if (!frame.ok) {
        return failure(frame.error);
      }
      return success(await parseFigmaScreen(frame.value));
    },

    readSelection() {
      const frame = getSelectedFrame(figmaApi.currentPage.selection);
      if (!frame.ok) {
        return failure(frame.error);
      }
      return success(Object.freeze({ id: frame.value.id, name: frame.value.name }));
    },
  };
}
