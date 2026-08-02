import type {
  FrameNode,
  PluginAPI,
  SceneNode,
} from "@figma/plugin-typings/plugin-api-standalone";
import { describe, expect, it, vi } from "vitest";

import { removeGeneratedWorkspaces } from "./figma-renderer";
import { GENERATION_TAGS } from "./generation-tags";

function generatedFrame(
  sourceNodeId: string,
): Readonly<{ node: FrameNode; remove: ReturnType<typeof vi.fn> }> {
  const remove = vi.fn();
  return {
    node: {
      getPluginData: (key: string) => {
        if (key === GENERATION_TAGS.generatedType) return "workspace";
        if (key === GENERATION_TAGS.sourceNodeId) return sourceNodeId;
        return "";
      },
      remove,
      type: "FRAME",
    } as unknown as FrameNode,
    remove,
  };
}

describe("removeGeneratedWorkspaces", () => {
  it("removes only workspaces generated for the selected source", () => {
    const matching = generatedFrame("screen");
    const other = generatedFrame("other-screen");
    const nodes: readonly SceneNode[] = [matching.node, other.node];
    const figmaApi = {
      currentPage: {
        findAll: (predicate: (node: SceneNode) => boolean) => nodes.filter(predicate),
      },
    } as unknown as PluginAPI;

    expect(removeGeneratedWorkspaces(figmaApi, "screen")).toBe(1);
    expect(matching.remove).toHaveBeenCalledOnce();
    expect(other.remove).not.toHaveBeenCalled();
  });
});
