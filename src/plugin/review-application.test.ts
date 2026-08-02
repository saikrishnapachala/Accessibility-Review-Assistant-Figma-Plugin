import { describe, expect, it, vi } from "vitest";

import type { ScreenParser } from "../parser/screen-parser";
import type { ParsedScreen } from "../parser/types";
import type { WorkspaceRenderer } from "../renderer/workspace-renderer";
import { failure, success } from "../shared/result";
import { createReviewApplication } from "./review-application";

const parsedScreen: ParsedScreen = {
  root: {
    autoLayout: null,
    bounds: { height: 844, width: 390, x: 0, y: 0 },
    children: [],
    componentName: null,
    hasImageFill: false,
    id: "screen",
    name: "Search",
    opacity: 1,
    text: null,
    type: "FRAME",
    variantProperties: {},
    visible: true,
  },
  sourceNodeId: "screen",
};

const categories = {
  CONTENT_HIERARCHY: true,
  FOCUS_GROUPING: true,
  TAB_ORDER: true,
  TEXT_ALTERNATIVES: true,
} as const;

describe("createReviewApplication", () => {
  it("orchestrates parsing, modeling, engines, layout, and rendering", async () => {
    const render = vi.fn<WorkspaceRenderer["render"]>(async () =>
      success({
        annotationCount: 1,
        durationMs: 25,
        sectionCount: 4,
        workspaceId: "workspace",
      }),
    );
    const parser: ScreenParser = {
      parseSelectedScreen: async () => success(parsedScreen),
      readSelection: () => success({ id: "screen", name: "Search" }),
    };
    const renderer: WorkspaceRenderer = { remove: () => 0, render };
    const progress = vi.fn();

    const result = await createReviewApplication(parser, renderer).generate(
      categories,
      progress,
    );

    expect(result).toMatchObject({ ok: true, value: { sectionCount: 4 } });
    expect(render).toHaveBeenCalledWith(
      "screen",
      expect.objectContaining({ sections: expect.arrayContaining([]) }),
    );
    expect(progress.mock.calls.map(([phase]) => phase)).toEqual([
      "ANALYZING",
      "LAYING_OUT",
      "RENDERING",
    ]);
  });

  it("returns typed selection failures without invoking the renderer", async () => {
    const selectionError = {
      code: "NO_SELECTION",
      message: "Select one iOS screen frame before generating a review.",
    } as const;
    const parser: ScreenParser = {
      parseSelectedScreen: async () => failure(selectionError),
      readSelection: () => failure(selectionError),
    };
    const render = vi.fn<WorkspaceRenderer["render"]>();
    const renderer: WorkspaceRenderer = { remove: () => 0, render };

    const result = await createReviewApplication(parser, renderer).generate(
      categories,
      vi.fn(),
    );

    expect(result).toEqual({ error: selectionError, ok: false });
    expect(render).not.toHaveBeenCalled();
  });
});
