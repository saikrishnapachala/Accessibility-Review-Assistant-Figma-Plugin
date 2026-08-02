import type { EnabledReviewCategories } from "../engines/run-engines";

export type UiToPluginMessage =
  | Readonly<{ type: "close" }>
  | Readonly<{ categories: EnabledReviewCategories; type: "generate" }>
  | Readonly<{ type: "refresh-selection" }>
  | Readonly<{ type: "remove-generated" }>;

export type PluginToUiMessage =
  | Readonly<{
      selection: Readonly<{
        frameId: string | null;
        frameName: string | null;
        message: string;
        valid: boolean;
      }>;
      type: "selection-state";
    }>
  | Readonly<{
      message: string;
      phase: "ANALYZING" | "LAYING_OUT" | "RENDERING";
      type: "progress";
    }>
  | Readonly<{
      annotationCount: number;
      durationMs: number;
      sectionCount: number;
      type: "complete";
    }>
  | Readonly<{
      message: string;
      type: "error";
    }>
  | Readonly<{
      removedCount: number;
      type: "removed";
    }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasValidCategories(value: unknown): value is EnabledReviewCategories {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.CONTENT_HIERARCHY === "boolean" &&
    typeof value.FOCUS_GROUPING === "boolean" &&
    typeof value.TEXT_ALTERNATIVES === "boolean" &&
    typeof value.TAB_ORDER === "boolean"
  );
}

export function isUiToPluginMessage(value: unknown): value is UiToPluginMessage {
  if (!isRecord(value) || typeof value.type !== "string") {
    return false;
  }

  switch (value.type) {
    case "close":
    case "refresh-selection":
    case "remove-generated":
      return true;
    case "generate":
      return hasValidCategories(value.categories);
    default:
      return false;
  }
}

export function isPluginToUiMessage(value: unknown): value is PluginToUiMessage {
  if (!isRecord(value) || typeof value.type !== "string") {
    return false;
  }

  switch (value.type) {
    case "selection-state":
      return isRecord(value.selection) && typeof value.selection.valid === "boolean";
    case "progress":
    case "error":
      return typeof value.message === "string";
    case "complete":
      return (
        typeof value.annotationCount === "number" &&
        typeof value.durationMs === "number" &&
        typeof value.sectionCount === "number"
      );
    case "removed":
      return typeof value.removedCount === "number";
    default:
      return false;
  }
}
