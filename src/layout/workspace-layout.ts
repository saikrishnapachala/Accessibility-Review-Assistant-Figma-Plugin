import type { Bounds } from "../parser/types";
import type { AnnotationPlan, RenderPlan } from "../render-plan/types";
import type {
  PlacedAnnotation,
  WorkspaceLayout,
  WorkspaceSectionLayout,
} from "./types";

const SECTION_GAP = 80;
const SECTION_PADDING = 48;
const SCREEN_TOP = 96;
const RIGHT_GUTTER = 280;
const BOTTOM_PADDING = 64;
const LABEL_GAP = 12;
const COLLISION_BAND_HEIGHT = 64;

interface LabelOccupancy {
  collides(bounds: Bounds): boolean;
  occupy(bounds: Bounds): void;
}

function translateBounds(bounds: Bounds, x: number, y: number): Bounds {
  return Object.freeze({
    height: bounds.height,
    width: bounds.width,
    x: bounds.x + x,
    y: bounds.y + y,
  });
}

function intersects(first: Bounds, second: Bounds): boolean {
  return !(
    first.x + first.width + LABEL_GAP <= second.x ||
    second.x + second.width + LABEL_GAP <= first.x ||
    first.y + first.height + LABEL_GAP <= second.y ||
    second.y + second.height + LABEL_GAP <= first.y
  );
}

function collisionBands(bounds: Bounds): readonly number[] {
  const firstBand = Math.floor(bounds.y / COLLISION_BAND_HEIGHT);
  const lastBand = Math.floor(
    (bounds.y + bounds.height + LABEL_GAP) / COLLISION_BAND_HEIGHT,
  );
  return Array.from(
    { length: lastBand - firstBand + 1 },
    (_, index) => firstBand + index,
  );
}

function createLabelOccupancy(): LabelOccupancy {
  const occupiedByBand = new Map<number, Bounds[]>();

  return {
    collides(bounds) {
      const candidates = new Set<Bounds>();
      for (const band of collisionBands(bounds)) {
        for (const occupied of occupiedByBand.get(band) ?? []) {
          candidates.add(occupied);
        }
      }
      return [...candidates].some((occupied) => intersects(bounds, occupied));
    },
    occupy(bounds) {
      for (const band of collisionBands(bounds)) {
        const occupied = occupiedByBand.get(band) ?? [];
        occupied.push(bounds);
        occupiedByBand.set(band, occupied);
      }
    },
  };
}

function labelSize(annotation: AnnotationPlan): Readonly<{ height: number; width: number }> {
  switch (annotation.kind) {
    case "SCREEN_TITLE":
      return { height: 36, width: 220 };
    case "HEADING":
      return { height: 32, width: 40 };
    case "FOCUS_RECTANGLE":
      return { height: 28, width: 112 };
    case "TEXT_ALTERNATIVE":
      return { height: 64, width: 240 };
    case "TAB_BADGE":
      return { height: 32, width: 32 };
    case "TOUCH_TARGET":
      return { height: 40, width: 176 };
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function candidateLabelBounds(
  annotation: AnnotationPlan,
  target: Bounds,
  screen: Bounds,
  section: Bounds,
): readonly Bounds[] {
  const size = labelSize(annotation);
  const rightGutterX = screen.x + screen.width + 24;
  const centeredY = target.y + (target.height - size.height) / 2;
  const clampedY = clamp(
    centeredY,
    SCREEN_TOP,
    section.height - BOTTOM_PADDING - size.height,
  );

  if (annotation.kind === "SCREEN_TITLE") {
    return [
      Object.freeze({
        ...size,
        x: screen.x,
        y: screen.y - size.height - 16,
      }),
    ];
  }

  if (annotation.kind === "TAB_BADGE") {
    return [
      Object.freeze({
        ...size,
        x: target.x - size.width / 2,
        y: target.y - size.height / 2,
      }),
    ];
  }

  return [
    Object.freeze({ ...size, x: rightGutterX, y: clampedY }),
    Object.freeze({
      ...size,
      x: Math.max(SECTION_PADDING, target.x - size.width - LABEL_GAP),
      y: clampedY,
    }),
    Object.freeze({
      ...size,
      x: clamp(target.x, SECTION_PADDING, section.width - size.width - SECTION_PADDING),
      y: Math.max(SCREEN_TOP, target.y - size.height - LABEL_GAP),
    }),
    Object.freeze({
      ...size,
      x: clamp(target.x, SECTION_PADDING, section.width - size.width - SECTION_PADDING),
      y: Math.min(
        section.height - BOTTOM_PADDING - size.height,
        target.y + target.height + LABEL_GAP,
      ),
    }),
  ];
}

function chooseLabelBounds(
  candidates: readonly Bounds[],
  occupancy: LabelOccupancy,
  screen: Bounds,
): Bounds {
  const nonColliding = candidates.find(
    (candidate) =>
      !occupancy.collides(candidate) &&
      (!intersects(candidate, screen) || candidates.indexOf(candidate) > 0),
  );
  if (nonColliding !== undefined) {
    return nonColliding;
  }

  const fallback = candidates[0];
  if (fallback === undefined) {
    throw new Error("Annotation label has no placement candidates.");
  }

  const verticalStep = fallback.height + LABEL_GAP;
  let y = fallback.y;
  while (occupancy.collides({ ...fallback, y })) {
    y += verticalStep;
  }
  return Object.freeze({ ...fallback, y });
}

function placeAnnotations(
  annotations: readonly AnnotationPlan[],
  screenBounds: Bounds,
  sectionBounds: Bounds,
): readonly PlacedAnnotation[] {
  const occupancy = createLabelOccupancy();
  return Object.freeze(
    annotations.map((annotation) => {
      const targetBounds = translateBounds(
        annotation.bounds,
        screenBounds.x,
        screenBounds.y,
      );
      const labelBounds = chooseLabelBounds(
        candidateLabelBounds(annotation, targetBounds, screenBounds, sectionBounds),
        occupancy,
        screenBounds,
      );
      occupancy.occupy(labelBounds);

      return Object.freeze({ annotation, labelBounds, targetBounds });
    }),
  );
}

export function layoutWorkspace(renderPlan: RenderPlan): WorkspaceLayout {
  const sectionWidth =
    SECTION_PADDING + renderPlan.screenWidth + RIGHT_GUTTER + SECTION_PADDING;
  const sectionHeight = SCREEN_TOP + renderPlan.screenHeight + BOTTOM_PADDING;
  const sections: WorkspaceSectionLayout[] = renderPlan.sections.map(
    (section, index) => {
      const initialBounds = Object.freeze({
        height: sectionHeight,
        width: sectionWidth,
        x: index * (sectionWidth + SECTION_GAP),
        y: 0,
      });
      const screenBounds = Object.freeze({
        height: renderPlan.screenHeight,
        width: renderPlan.screenWidth,
        x: SECTION_PADDING,
        y: SCREEN_TOP,
      });
      const annotations = placeAnnotations(
        section.annotations,
        screenBounds,
        initialBounds,
      );
      const requiredHeight = annotations.reduce(
        (height, annotation) =>
          Math.max(
            height,
            (annotation.labelBounds?.y ?? annotation.targetBounds.y) +
              (annotation.labelBounds?.height ?? annotation.targetBounds.height) +
              BOTTOM_PADDING,
          ),
        sectionHeight,
      );
      const bounds = Object.freeze({ ...initialBounds, height: requiredHeight });

      return Object.freeze({
        annotations,
        bounds,
        category: section.category,
        screenBounds,
        title: section.title,
      });
    },
  );

  return Object.freeze({
    height: Math.max(sectionHeight, ...sections.map(({ bounds }) => bounds.height)),
    renderPlan,
    sections: Object.freeze(sections),
    width:
      sections.length === 0
        ? 0
        : sections.length * sectionWidth + (sections.length - 1) * SECTION_GAP,
  });
}
