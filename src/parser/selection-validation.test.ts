import { describe, expect, it } from "vitest";

import { validateSingleFrameSelection } from "./selection-validation";

describe("validateSingleFrameSelection", () => {
  it("accepts exactly one frame", () => {
    expect(
      validateSingleFrameSelection([
        { id: "screen", name: "Search", type: "FRAME" },
      ]),
    ).toEqual({
      ok: true,
      value: { id: "screen", name: "Search", type: "FRAME" },
    });
  });

  it("returns an actionable error when nothing is selected", () => {
    expect(validateSingleFrameSelection([])).toMatchObject({
      error: { code: "NO_SELECTION" },
      ok: false,
    });
  });

  it("rejects multiple selected objects", () => {
    expect(
      validateSingleFrameSelection([
        { id: "one", name: "One", type: "FRAME" },
        { id: "two", name: "Two", type: "FRAME" },
      ]),
    ).toMatchObject({ error: { code: "MULTIPLE_SELECTION" }, ok: false });
  });

  it("rejects a single non-frame selection without losing its context", () => {
    expect(
      validateSingleFrameSelection([
        { id: "button", name: "Continue", type: "INSTANCE" },
      ]),
    ).toEqual({
      error: {
        code: "NOT_A_FRAME",
        message: "The selected object must be a frame containing one iOS screen.",
        selectedName: "Continue",
        selectedType: "INSTANCE",
      },
      ok: false,
    });
  });
});
