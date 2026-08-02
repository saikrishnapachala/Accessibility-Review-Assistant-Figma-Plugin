# Architecture

## Dependency flow

```text
Figma selection
  → Parser
  → Parsed screen
  → Accessibility Model
  → Accessibility engines
  → Render Plan
  → Layout
  → Figma renderer
  → Generated review workspace
```

The parser and renderer are the only analysis/output layers that import Figma
node types. The plugin composition root owns lifecycle and message wiring. The
model, engines, render plan, and layout operate only on application-owned types.

## Modules

| Module | Responsibility |
| --- | --- |
| `src/parser` | Validate one selected frame and capture its tree in one traversal. |
| `src/model` | Build an immutable, JSON-inspectable accessibility representation. |
| `src/config` | Version deterministic component-name and grouping rules. |
| `src/engines` | Produce category-specific, Figma-independent annotations. |
| `src/render-plan` | Define the discriminated annotation and section contracts. |
| `src/layout` | Place screens, labels, badges, and connectors; avoid common collisions. |
| `src/renderer` | Clone the source, create reusable components, tag output, and safely regenerate/remove it. |
| `src/plugin` | Orchestrate the pipeline and translate typed results into UI messages. |
| `src/ui` | Present selection state, category controls, progress, errors, and actions. |

## Deterministic rules and uncertainty

Component metadata is treated as stronger evidence than layer naming. Naming and
visual typography heuristics never become confirmed accessibility intent; their
annotations are marked `Needs Review`. The default local ruleset is versioned in
`src/config/accessibility-rules.ts` and can be replaced at the model-builder
boundary without changing an engine.

The current supported roles are screen, text, button, input, switch, segmented
control, group, list, card, image, icon, and avatar. Unknown nodes remain in the
parsed tree but do not receive an invented accessibility role.

## Generated-content lifecycle

Every workspace, section, reusable component, and annotation receives plugin-data
tags containing its generated type, source frame ID, and schema version. A new
workspace is fully built before an older workspace for the same source is
removed. If rendering throws, the incomplete replacement is removed and the
prior generated output remains intact. The selected source frame is only cloned.

## Performance

Parsing and model traversal are linear in node count. Label collision queries use
vertical spatial bands so ordinary placement does not scan every prior label.
The automated performance fixture analyzes and lays out 1,000 controls under a
two-second regression threshold; the product's full ten-second target still
requires measurement inside Figma because cloning and rendering costs belong to
the host application.

## External acceptance dependencies

- Exact Greenlines visual fidelity requires the approved component assets or a
  measurable style specification. The repository currently generates a local,
  reusable Greenlines-style component rail.
- Figma desktop must be used to validate plugin import, font loading, cloning,
  instance overrides, regeneration, removal, and end-to-end timing.
- The greater-than-90% detection metric requires a product-approved fixture set
  and expected labels for the supported iOS taxonomy.
