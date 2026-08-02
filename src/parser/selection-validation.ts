import { failure, success, type Result } from "../shared/result";

export interface SelectionCandidate {
  readonly id: string;
  readonly name: string;
  readonly type: string;
}

export type SelectionError =
  | Readonly<{
      code: "NO_SELECTION";
      message: "Select one iOS screen frame before generating a review.";
    }>
  | Readonly<{
      code: "MULTIPLE_SELECTION";
      message: "Select exactly one frame. Multiple objects are selected.";
    }>
  | Readonly<{
      code: "NOT_A_FRAME";
      message: "The selected object must be a frame containing one iOS screen.";
      selectedName: string;
      selectedType: string;
    }>;

export function validateSingleFrameSelection(
  selection: readonly SelectionCandidate[],
): Result<SelectionCandidate, SelectionError> {
  if (selection.length === 0) {
    return failure({
      code: "NO_SELECTION",
      message: "Select one iOS screen frame before generating a review.",
    });
  }

  if (selection.length > 1) {
    return failure({
      code: "MULTIPLE_SELECTION",
      message: "Select exactly one frame. Multiple objects are selected.",
    });
  }

  const candidate = selection[0];
  if (candidate === undefined) {
    throw new Error("Selection length was one but no candidate was present.");
  }

  if (candidate.type !== "FRAME") {
    return failure({
      code: "NOT_A_FRAME",
      message: "The selected object must be a frame containing one iOS screen.",
      selectedName: candidate.name,
      selectedType: candidate.type,
    });
  }

  return success(candidate);
}
