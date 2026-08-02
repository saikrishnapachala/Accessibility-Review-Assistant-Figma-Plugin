# Product Requirements Document: Accessibility Review Assistant

| Field | Value |
| --- | --- |
| Version | MVP v1.0 |
| Owner | Pooja |
| Platform | Figma plugin for iOS screen designs |
| Status | Draft |
| Last reviewed | 2026-08-02 |

## 1. Problem statement

Accessibility Greenlines are currently created manually. The workflow requires a
designer to:

1. Duplicate the Greenlines template.
2. Delete sample screens.
3. Copy in a new screen.
4. Create four accessibility review pages.
5. Add heading annotations.
6. Add focus grouping.
7. Add text alternatives.
8. Add tab order.
9. Send the result to the ADA team.

Even with the enterprise Greenlines plugin, users still manually select every
element, choose annotation types, drag stickers, resize boxes, and position
connectors. This process is repetitive, slow, and error-prone.

## 2. Vision

Build an intelligent Figma plugin that transforms one selected iOS screen into a
complete ADA review package. The plugin automates repetitive work while keeping
accessibility decisions reviewable by humans.

## 3. Goals

- Reduce Greenlines creation time by more than 80%.
- Eliminate repetitive sticker placement.
- Generate ADA-ready review pages.
- Work entirely inside Figma.
- Require no cloud dependency, MCP dependency, or external AI API.

## 4. Non-goals for MVP

- Android or web support.
- AI-generated accessibility descriptions.
- VoiceOver simulation.
- Accessibility testing or scoring.
- WCAG validation.
- Flow detection.
- Multi-screen automation.

## 5. Users

Primary users are accessibility designers. Secondary users are UX and product
designers.

## 6. Scope

The plugin operates on exactly one selected screen.

Given a frame such as `Search Destination Filled`, it produces:

```text
Search Destination Filled
├── Content Hierarchy
├── Focus Grouping
├── Text Alternatives
└── Tab Order
```

## 7. User journey

Current:

```text
Duplicate template → Delete demo screens → Copy screen → Draw headings
→ Draw focus → Draw text alternatives → Draw tab order
```

Target:

```text
Select screen → Open Accessibility Review Assistant → Generate → Review → Done
```

## 8. Functional requirements

### FR-1: Selection validation

The user selects exactly one frame, and the plugin validates that selection.

### FR-2: Node parsing

The plugin reads the selected frame's node hierarchy and collects:

- Bounds.
- Node type.
- Children.
- Variants.
- Text.
- Component name.
- Auto Layout metadata.

### FR-3: Accessibility model

The plugin converts parsed Figma data into a Figma-independent Accessibility
Model.

### FR-4: Review workspace

The plugin automatically creates a review workspace containing:

- Content Hierarchy.
- Focus Grouping.
- Text Alternatives.
- Tab Order.

### FR-5: Screen duplication

Each review section receives a duplicate of the selected screen. The original
design is never modified.

### FR-6: Annotation generation

Each accessibility engine generates its own review annotations.

### FR-7: Safe regeneration

Generated content is grouped, tagged, removable, and regeneratable. Running
Generate more than once updates the prior generated output rather than creating
duplicates.

### FR-8: Uncertainty handling

When a deterministic rule cannot make a reliable decision, the output is marked
`Needs Review`; the plugin does not invent an accessibility decision.

## 9. Accessibility engines

### Content Hierarchy

Detects screen titles, headings, and section headings. Produces heading (`H`) and
screen-title stickers.

### Focus Grouping

Detects interactive controls, groups, cards, segmented controls, and lists.
Produces focus rectangles.

### Text Alternatives

Detects images, icons, avatars, illustrations, and icon-only buttons. Produces
text-alternative stickers whose descriptions are completed by the reviewer.

### Tab Order

Determines navigation order and produces numbered tab-order badges.

## 10. Accessibility model

All engines depend on a single model rather than reading Figma directly.

```text
Selected Screen → Accessibility Model → Engines → Render Plan
```

Each `AccessibilityNode` includes, at minimum:

- `id`
- `type`
- `bounds`
- `children`
- `text`
- `isHeading`
- `isFocusable`
- `needsAltText`
- `tabOrder`
- `groupId`

The concrete model may evolve, but it must remain immutable, typed, and
independent of Figma APIs.

## 11. Architecture

```text
Figma
  ↓
Plugin controller
  ↓
Node parser
  ↓
Accessibility model
  ↓
Accessibility engines
  ↓
Render plan
  ↓
Layout engine
  ↓
Renderer
  ↓
Greenlines output in Figma
```

Only the parser and renderer may depend on Figma APIs. Business logic and engines
must operate on application-owned types.

## 12. Layout engine

The layout engine handles sticker placement, connector placement, collision
detection, spacing, and margins. It contains no accessibility decision logic.

## 13. Renderer

The renderer uses reusable Greenlines components rather than drawing ad hoc raw
rectangles. It creates:

- Heading stickers.
- Screen-title stickers.
- Focus rectangles.
- Text-alternative stickers.
- Tab-order badges.

## 14. Plugin UI

The MVP UI presents the selected frame, lets the user enable or disable each
review category, and provides a Generate action.

```text
Accessibility Review Assistant

Selected: Search Destination Filled

☑ Content Hierarchy
☑ Focus Grouping
☑ Text Alternatives
☑ Tab Order

[ Generate ]
```

## 15. Output

The generated workspace contains the selected screen plus Content Hierarchy,
Focus Grouping, Text Alternatives, and Tab Order review sections, matching the
current ADA Greenlines review format.

## 16. Intended project structure

```text
src/
  plugin/
  ui/
  parser/
  model/
  engines/
    heading/
    focus/
    textAlternative/
    tabOrder/
  layout/
  renderer/
  templates/
  utils/
```

## 17. Development phases

1. Plugin setup: load a minimal Hello World plugin.
2. Selection reader: identify buttons, images, text, and inputs in one frame.
3. Accessibility Model: generate and inspect the typed model as JSON.
4. Workspace generator: create the four review sections.
5. Renderer: insert reusable Greenlines stickers.
6. Tab Order engine: calculate order and generate numbers.
7. Content Hierarchy engine: generate heading and screen-title stickers.
8. Focus Grouping engine: generate focus rectangles.
9. Text Alternatives engine: generate review placeholders.
10. Polish: collision detection, spacing, reliability, and performance.

Current delivery state for these phases is maintained in
[PROJECT_STATUS.md](PROJECT_STATUS.md).

## 18. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Unknown custom components | Use deterministic rules and configurable component mappings. |
| Designers rename layers | Prefer hierarchy and component metadata over layer names. |
| Annotation overlap | Keep placement and collision handling in a dedicated layout engine. |
| Missing accessibility context | Mark the result `Needs Review` instead of guessing. |
| Design-system updates | Keep component mappings in external local configuration. |

## 19. Success metrics

- Generate a review workspace in under 10 seconds.
- Reduce manual effort by at least 80%.
- Detect common iOS controls (buttons, text fields, switches, segmented controls,
  and icons) with greater than 90% accuracy.
- Require only minor manual adjustments before ADA review.

## 20. Future roadmap

### v1.1

- Batch processing for multiple selected screens.
- Save plugin settings per project.
- Export an accessibility review summary.

### v1.2

- Smart focus-grouping suggestions.
- Better collision avoidance.
- Design-system component mapping.

### v2.0

- AI-assisted alt-text suggestions.
- AI heading suggestions.
- Accessibility quality scoring.
- WCAG rule validation.
- Change detection between design revisions.

The AI items are explicitly post-MVP and would require revisiting the local-only,
no-external-AI constraints before implementation.

## Architecture principles

1. **Screen-first, not flow-first.** Operate on one selected screen at a time.
2. **Deterministic over AI.** Keep core analysis rule-based and explainable.
3. **One accessibility model.** All engines consume the same parsed representation.
4. **Modular engines.** Each annotation category is independent and replaceable.
5. **Rendering is separate from logic.** Engines decide what to annotate; the
   renderer decides how to display it.
6. **Human in the loop.** Accelerate review without replacing accessibility
   judgment.

