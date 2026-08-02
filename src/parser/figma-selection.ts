import type { FrameNode, SceneNode } from "@figma/plugin-typings/plugin-api-standalone";

import { failure, success, type Result } from "../shared/result";
import {
  validateSingleFrameSelection,
  type SelectionError,
} from "./selection-validation";

export function getSelectedFrame(
  selection: readonly SceneNode[],
): Result<FrameNode, SelectionError> {
  const validation = validateSingleFrameSelection(
    selection.map(({ id, name, type }) => ({ id, name, type })),
  );

  if (!validation.ok) {
    return failure(validation.error);
  }

  const selectedNode = selection[0];
  if (selectedNode === undefined || selectedNode.type !== "FRAME") {
    throw new Error("Validated frame selection did not resolve to a FrameNode.");
  }

  return success(selectedNode);
}
