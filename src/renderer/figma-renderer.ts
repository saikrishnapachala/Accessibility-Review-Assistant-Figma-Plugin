import type {
  ComponentNode,
  FontName,
  FrameNode,
  InstanceNode,
  PluginAPI,
  RGB,
  SolidPaint,
  TextNode,
} from "@figma/plugin-typings/plugin-api-standalone";

import type { PlacedAnnotation, WorkspaceLayout } from "../layout/types";
import type { Bounds } from "../parser/types";
import type { AnnotationPlan } from "../render-plan/types";
import { failure, success, type Result } from "../shared/result";
import { GENERATION_TAGS, tagGeneratedNode } from "./generation-tags";
import type {
  RenderError,
  RenderSummary,
  WorkspaceRenderer,
} from "./workspace-renderer";

const FONT_REGULAR: FontName = { family: "Inter", style: "Regular" };
const FONT_BOLD: FontName = { family: "Inter", style: "Bold" };
const WORKSPACE_OFFSET = 200;
const TEMPLATE_RAIL_HEIGHT = 144;
const TEMPLATE_RAIL_GAP = 48;

type AnnotationKind = AnnotationPlan["kind"];
type ComponentTemplates = Readonly<Record<AnnotationKind, ComponentNode>>;

const COLORS = Object.freeze({
  alt: { b: 0.96, g: 0.62, r: 0.12 },
  background: { b: 0.97, g: 0.97, r: 0.97 },
  focus: { b: 0.55, g: 0.14, r: 0.9 },
  heading: { b: 0.58, g: 0.18, r: 0.45 },
  needsReview: { b: 0.05, g: 0.55, r: 0.98 },
  screenTitle: { b: 0.28, g: 0.42, r: 0.08 },
  tab: { b: 0.98, g: 0.38, r: 0.05 },
  text: { b: 0.09, g: 0.09, r: 0.09 },
  touch: { b: 0.03, g: 0.48, r: 0.98 },
  white: { b: 1, g: 1, r: 1 },
});

function solidPaint(color: RGB): readonly SolidPaint[] {
  return [{ color, type: "SOLID" }];
}

function createText(
  figmaApi: PluginAPI,
  characters: string,
  options: Readonly<{
    color?: RGB;
    font?: FontName;
    fontSize?: number;
    height?: number;
    width?: number;
  }> = {},
): TextNode {
  const text = figmaApi.createText();
  text.fontName = options.font ?? FONT_REGULAR;
  text.fontSize = options.fontSize ?? 14;
  text.characters = characters;
  text.fills = solidPaint(options.color ?? COLORS.text);
  if (options.width !== undefined && options.height !== undefined) {
    text.textAutoResize = "NONE";
    text.resize(options.width, options.height);
  } else {
    text.textAutoResize = "WIDTH_AND_HEIGHT";
  }
  return text;
}

function configureTemplate(
  component: ComponentNode,
  kind: AnnotationKind,
): void {
  component.name = `ARA / ${kind}`;
  component.clipsContent = false;
  component.cornerRadius = kind === "TAB_BADGE" ? 999 : 6;
  component.strokeWeight = kind === "FOCUS_RECTANGLE" || kind === "TOUCH_TARGET" ? 3 : 0;

  switch (kind) {
    case "SCREEN_TITLE":
      component.resize(220, 36);
      component.fills = solidPaint(COLORS.screenTitle);
      break;
    case "HEADING":
      component.resize(40, 32);
      component.fills = solidPaint(COLORS.heading);
      break;
    case "FOCUS_RECTANGLE":
      component.resize(112, 44);
      component.fills = [];
      component.strokes = solidPaint(COLORS.focus);
      break;
    case "TEXT_ALTERNATIVE":
      component.resize(240, 64);
      component.fills = solidPaint(COLORS.alt);
      break;
    case "TAB_BADGE":
      component.resize(32, 32);
      component.fills = solidPaint(COLORS.tab);
      break;
    case "TOUCH_TARGET":
      component.resize(44, 44);
      component.fills = [];
      component.strokes = solidPaint(COLORS.touch);
      break;
  }
}

function templateLabel(kind: AnnotationKind): string {
  switch (kind) {
    case "SCREEN_TITLE":
      return "Screen title";
    case "HEADING":
      return "H";
    case "FOCUS_RECTANGLE":
      return "Focus";
    case "TEXT_ALTERNATIVE":
      return "Text alternative";
    case "TAB_BADGE":
      return "1";
    case "TOUCH_TARGET":
      return "44";
  }
}

function addTemplateText(
  figmaApi: PluginAPI,
  component: ComponentNode,
  kind: AnnotationKind,
): void {
  const text = createText(figmaApi, templateLabel(kind), {
    color:
      kind === "FOCUS_RECTANGLE" || kind === "TOUCH_TARGET"
        ? COLORS.text
        : COLORS.white,
    font: FONT_BOLD,
    fontSize: kind === "TAB_BADGE" || kind === "HEADING" ? 15 : 12,
    height: Math.max(16, component.height - 12),
    width: Math.max(24, component.width - 16),
  });
  text.textAlignHorizontal = kind === "TAB_BADGE" || kind === "HEADING" ? "CENTER" : "LEFT";
  text.textAlignVertical = "CENTER";
  text.x = kind === "TAB_BADGE" || kind === "HEADING" ? 8 : 8;
  text.y = 6;
  component.appendChild(text);
}

function createComponentTemplates(
  figmaApi: PluginAPI,
  workspace: FrameNode,
  sourceNodeId: string,
  y: number,
): ComponentTemplates {
  const rail = figmaApi.createFrame();
  rail.name = "Reusable Greenlines Components";
  rail.resize(Math.max(workspace.width, 960), TEMPLATE_RAIL_HEIGHT);
  rail.x = 0;
  rail.y = y;
  rail.fills = solidPaint(COLORS.background);
  rail.strokes = solidPaint({ b: 0.82, g: 0.82, r: 0.82 });
  workspace.appendChild(rail);

  const title = createText(figmaApi, "Reusable Greenlines Components", {
    font: FONT_BOLD,
    fontSize: 16,
  });
  title.x = 20;
  title.y = 16;
  rail.appendChild(title);

  const kinds: readonly AnnotationKind[] = [
    "SCREEN_TITLE",
    "HEADING",
    "FOCUS_RECTANGLE",
    "TEXT_ALTERNATIVE",
    "TAB_BADGE",
    "TOUCH_TARGET",
  ];
  const templates = {} as Record<AnnotationKind, ComponentNode>;
  let x = 20;
  for (const kind of kinds) {
    const component = figmaApi.createComponent();
    configureTemplate(component, kind);
    addTemplateText(figmaApi, component, kind);
    component.x = x;
    component.y = 56;
    tagGeneratedNode(component, "component", sourceNodeId);
    rail.appendChild(component);
    templates[kind] = component;
    x += component.width + 24;
  }

  return Object.freeze(templates);
}

function annotationText(annotation: AnnotationPlan): string {
  const prefix = annotation.reviewStatus === "NEEDS_REVIEW" ? "? " : "";
  switch (annotation.kind) {
    case "SCREEN_TITLE":
      return `${prefix}${annotation.label}`;
    case "HEADING":
      return `${prefix}${annotation.label}`;
    case "FOCUS_RECTANGLE":
      return `${prefix}${annotation.label}`;
    case "TEXT_ALTERNATIVE":
      return `${prefix}${annotation.placeholder}`;
    case "TAB_BADGE":
      return `${prefix}${annotation.order}`;
    case "TOUCH_TARGET":
      return `${prefix}${Math.round(annotation.actualWidth)}×${Math.round(annotation.actualHeight)}`;
  }
}

function setInstanceText(instance: InstanceNode, characters: string): void {
  const text = instance.findOne((node) => node.type === "TEXT");
  if (text?.type === "TEXT") {
    text.characters = characters;
  }
}

function targetInstanceBounds(placed: PlacedAnnotation): Bounds {
  if (placed.annotation.kind !== "TOUCH_TARGET") {
    return placed.targetBounds;
  }

  const width = Math.max(placed.annotation.minimumWidth, placed.targetBounds.width);
  const height = Math.max(placed.annotation.minimumHeight, placed.targetBounds.height);
  return {
    height,
    width,
    x: placed.targetBounds.x - (width - placed.targetBounds.width) / 2,
    y: placed.targetBounds.y - (height - placed.targetBounds.height) / 2,
  };
}

function shouldUseTargetBounds(kind: AnnotationKind): boolean {
  return kind === "FOCUS_RECTANGLE" || kind === "TOUCH_TARGET";
}

function drawConnector(
  figmaApi: PluginAPI,
  section: FrameNode,
  target: Bounds,
  label: Bounds,
): void {
  const startX = target.x + target.width / 2;
  const startY = target.y + target.height / 2;
  const endX = label.x + label.width / 2;
  const endY = label.y + label.height / 2;
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const line = figmaApi.createLine();
  line.name = "Connector";
  line.x = startX;
  line.y = startY;
  line.resize(Math.hypot(deltaX, deltaY), 0);
  line.rotation = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
  line.strokeWeight = 2;
  line.strokes = solidPaint(COLORS.heading);
  section.appendChild(line);
}

function renderAnnotation(
  figmaApi: PluginAPI,
  section: FrameNode,
  templates: ComponentTemplates,
  placed: PlacedAnnotation,
  sourceNodeId: string,
): void {
  const annotation = placed.annotation;
  const component = templates[annotation.kind];
  const instance = component.createInstance();
  const bounds = shouldUseTargetBounds(annotation.kind)
    ? targetInstanceBounds(placed)
    : placed.labelBounds;
  if (bounds === null) {
    throw new Error(`Annotation ${annotation.id} has no renderable bounds.`);
  }

  instance.name = `${annotation.kind} · ${annotation.id}`;
  instance.x = bounds.x;
  instance.y = bounds.y;
  instance.resize(bounds.width, bounds.height);
  setInstanceText(instance, annotationText(annotation));
  if (annotation.reviewStatus === "NEEDS_REVIEW") {
    instance.strokes = solidPaint(COLORS.needsReview);
    instance.strokeWeight = Math.max(
      typeof instance.strokeWeight === "number" ? instance.strokeWeight : 0,
      2,
    );
  }
  tagGeneratedNode(instance, "annotation", sourceNodeId);
  section.appendChild(instance);

  if (
    placed.labelBounds !== null &&
    annotation.kind !== "SCREEN_TITLE" &&
    annotation.kind !== "TAB_BADGE" &&
    !shouldUseTargetBounds(annotation.kind)
  ) {
    drawConnector(figmaApi, section, placed.targetBounds, placed.labelBounds);
  }
}

function createSection(
  figmaApi: PluginAPI,
  workspace: FrameNode,
  source: FrameNode,
  layout: WorkspaceLayout["sections"][number],
  templates: ComponentTemplates,
): void {
  const section = figmaApi.createFrame();
  section.name = layout.title;
  section.x = layout.bounds.x;
  section.y = layout.bounds.y;
  section.resize(layout.bounds.width, layout.bounds.height);
  section.clipsContent = false;
  section.fills = solidPaint(COLORS.background);
  section.strokes = solidPaint({ b: 0.82, g: 0.82, r: 0.82 });
  tagGeneratedNode(section, "section", source.id);
  workspace.appendChild(section);

  const title = createText(figmaApi, layout.title, {
    font: FONT_BOLD,
    fontSize: 20,
  });
  title.x = 48;
  title.y = 32;
  section.appendChild(title);

  const screenCopy = source.clone();
  section.appendChild(screenCopy);
  screenCopy.name = `${source.name} · ${layout.title}`;
  screenCopy.x = layout.screenBounds.x;
  screenCopy.y = layout.screenBounds.y;

  for (const annotation of layout.annotations) {
    renderAnnotation(figmaApi, section, templates, annotation, source.id);
  }
}

function findGeneratedWorkspaces(
  figmaApi: PluginAPI,
  sourceNodeId: string,
): readonly FrameNode[] {
  return figmaApi.currentPage
    .findAll(
      (node) =>
      node.type === "FRAME" &&
      node.getPluginData(GENERATION_TAGS.generatedType) === "workspace" &&
      node.getPluginData(GENERATION_TAGS.sourceNodeId) === sourceNodeId,
    )
    .filter((node): node is FrameNode => node.type === "FRAME");
}

export function removeGeneratedWorkspaces(
  figmaApi: PluginAPI,
  sourceNodeId: string,
): number {
  const workspaces = findGeneratedWorkspaces(figmaApi, sourceNodeId);
  for (const workspace of workspaces) {
    workspace.remove();
  }
  return workspaces.length;
}

export async function renderWorkspace(
  figmaApi: PluginAPI,
  source: FrameNode,
  layout: WorkspaceLayout,
): Promise<Result<RenderSummary, RenderError>> {
  if (layout.sections.length === 0) {
    return failure({
      code: "NO_REVIEW_CATEGORIES",
      message: "Enable at least one review category before generating.",
    });
  }

  const startedAt = Date.now();
  await Promise.all([
    figmaApi.loadFontAsync(FONT_REGULAR),
    figmaApi.loadFontAsync(FONT_BOLD),
  ]);

  const priorWorkspaces = findGeneratedWorkspaces(figmaApi, source.id);
  const priorWorkspace = priorWorkspaces[0];
  const sourceBounds = source.absoluteBoundingBox;
  const workspace = figmaApi.createFrame();

  try {
    workspace.name = `Accessibility Review · ${source.name}`;
    workspace.clipsContent = false;
    workspace.layoutMode = "NONE";
    workspace.fills = [];
    workspace.resize(
      layout.width,
      layout.height + TEMPLATE_RAIL_GAP + TEMPLATE_RAIL_HEIGHT,
    );
    workspace.x =
      priorWorkspace?.x ??
      (sourceBounds === null ? source.x : sourceBounds.x) + source.width + WORKSPACE_OFFSET;
    workspace.y = priorWorkspace?.y ?? (sourceBounds === null ? source.y : sourceBounds.y);
    tagGeneratedNode(workspace, "workspace", source.id);

    const templates = createComponentTemplates(
      figmaApi,
      workspace,
      source.id,
      layout.height + TEMPLATE_RAIL_GAP,
    );
    for (const sectionLayout of layout.sections) {
      createSection(figmaApi, workspace, source, sectionLayout, templates);
    }

    for (const existing of priorWorkspaces) {
      existing.remove();
    }

    figmaApi.viewport.scrollAndZoomIntoView([workspace]);

    return success(
      Object.freeze({
        annotationCount: layout.sections.reduce(
          (total, section) => total + section.annotations.length,
          0,
        ),
        durationMs: Date.now() - startedAt,
        sectionCount: layout.sections.length,
        workspaceId: workspace.id,
      }),
    );
  } catch (error) {
    workspace.remove();
    throw error;
  }
}

export function createFigmaWorkspaceRenderer(
  figmaApi: PluginAPI,
): WorkspaceRenderer {
  return {
    remove: (sourceNodeId) => removeGeneratedWorkspaces(figmaApi, sourceNodeId),
    async render(sourceNodeId, layout) {
      const source = await figmaApi.getNodeByIdAsync(sourceNodeId);
      if (source === null || source.type !== "FRAME") {
        return failure({
          code: "SOURCE_NOT_FOUND",
          message: "The selected source frame is no longer available. Select it again.",
        });
      }
      return renderWorkspace(figmaApi, source, layout);
    },
  };
}
