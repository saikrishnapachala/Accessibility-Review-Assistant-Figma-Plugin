# Project Status and Feature Tracker

| Field | Value |
| --- | --- |
| Current milestone | MVP v1.0 |
| Overall status | In progress |
| Last updated | 2026-08-02 |
| Product source of truth | [PRD.md](PRD.md) |

## Status legend

- `Pending`: approved scope, not started.
- `In progress`: active implementation exists but acceptance criteria are not met.
- `Blocked`: progress requires a recorded decision or external dependency.
- `Complete`: implementation, tests, and required documentation are finished.
- `Deferred`: intentionally outside the current milestone.

## MVP feature ledger

| ID | Feature | Status | Acceptance summary |
| --- | --- | --- | --- |
| MVP-01 | Plugin foundation | In progress | Plugin builds and loads in Figma with strict TypeScript and test tooling. Automated checks pass; Figma desktop smoke test remains. |
| MVP-02 | Single-frame selection validation | Complete | Exactly one frame is accepted; other states return clear typed errors. |
| MVP-03 | Figma node parser | In progress | One traversal captures supported node, geometry, text, component, variant, and Auto Layout data. Implementation and boundary tests pass; product taxonomy fixtures remain. |
| MVP-04 | Accessibility Model | Complete | Immutable Figma-independent typed model can be inspected as JSON. |
| MVP-05 | Review workspace generator | In progress | Four review sections are planned and rendered from source clones. Figma-hosted verification remains. |
| MVP-06 | Reusable Greenlines renderer | In progress | Render plans create reusable, tagged local components. Exact approved Greenlines asset matching remains. |
| MVP-07 | Tab Order engine | Complete | Deterministic navigation order produces numbered badges and uncertain cases are flagged. |
| MVP-08 | Content Hierarchy engine | Complete | Screen title and heading candidates produce appropriate stickers. |
| MVP-09 | Focus Grouping engine | Complete | Controls and supported composites produce reviewable focus rectangles. |
| MVP-10 | Text Alternatives engine | Complete | Relevant visual elements produce reviewer-editable placeholders. |
| MVP-11 | Layout and collision handling | Complete | Annotations respect spacing and margins without common overlaps. |
| MVP-12 | Idempotent regeneration/removal | In progress | Generate uses source/version tags and replacement-after-success semantics; Figma-hosted regeneration/removal verification remains. |
| MVP-13 | Plugin UI | In progress | Selected frame, category toggles, progress/errors, Generate, Remove, and Close are implemented; Figma-hosted verification remains. |
| MVP-14 | Performance and release validation | In progress | Regression suite and 1,000-control analysis fixture pass; Figma timing and approved accuracy fixtures remain. |

## Completed

Completed product features on 2026-08-02:

- `MVP-02 Single-frame selection validation`
- `MVP-04 Accessibility Model`
- `MVP-07 Tab Order engine`
- `MVP-08 Content Hierarchy engine`
- `MVP-09 Focus Grouping engine`
- `MVP-10 Text Alternatives engine`
- `MVP-11 Layout and collision handling`

Project record foundations completed on 2026-08-02:

- Added the MVP PRD.
- Added repository-level engineering instructions.
- Added this persistent feature and pending-work tracker.

## In progress

- `MVP-01 Plugin foundation`
  - Added the local-only Figma manifest and build pipeline.
  - Added strict TypeScript boundaries for the plugin, UI, and tests.
  - Added a minimal plugin controller and inline UI shell with typed messaging.
  - Added unit, invalid-input, manifest, and build-artifact coverage.
  - Remaining acceptance check: import `manifest.json` into Figma desktop and
    confirm the UI opens and closes successfully.
- `MVP-03 Figma node parser`
  - One traversal captures bounds, hierarchy, visibility, text typography,
    component names, variants, image fills, and Auto Layout metadata.
  - Remaining acceptance dependency: approve taxonomy fixtures for accuracy
    measurement.
- `MVP-05/MVP-06 Review workspace and renderer`
  - Four category sections use source clones, reusable component instances,
    connectors, reviewer uncertainty, and generation tags.
  - Remaining acceptance dependencies: verify inside Figma and map to the exact
    approved Greenlines assets/style.
- `MVP-12 Idempotent regeneration/removal`
  - Replacement is created before prior output is removed; failures clean up the
    incomplete replacement; removal is scoped by source ID.
  - Remaining acceptance check: exercise repeated Generate and Remove in Figma.
- `MVP-13 Plugin UI`
  - Selection state, four toggles, progress, actionable errors, generation,
    removal, and close behavior are implemented.
  - Remaining acceptance check: exercise UI-to-plugin messaging in Figma.
- `MVP-14 Performance and release validation`
  - Automated regression, architecture-boundary enforcement, a 1,000-control
    analysis/layout fixture, dependency audit, and GitHub CI pass locally.
  - Remaining acceptance dependencies: measure full rendering in Figma and run
    approved labeled accuracy fixtures.

## Pending next

Run the Figma desktop acceptance matrix for loading, generation, source
immutability, regeneration, removal, UI behavior, and end-to-end timing. In
parallel, obtain the approved Greenlines assets/style specification and labeled
iOS taxonomy fixtures required to close `MVP-03`, `MVP-06`, and `MVP-14`.

## Blockers and open decisions

These do not block initial plugin scaffolding but must be resolved before their
dependent feature is considered complete.

| ID | Decision needed | Needed by | Status |
| --- | --- | --- | --- |
| DEC-01 | Identify the exact Greenlines component library/assets and current ADA output format. | MVP-05/MVP-06 | Open |
| DEC-02 | Confirm supported Figma node and iOS control taxonomy for MVP accuracy measurement. | MVP-03/MVP-14 | Open |
| DEC-03 | Define how local component mappings are configured and versioned. | MVP-03/MVP-06 | Resolved: versioned local ruleset in `src/config/accessibility-rules.ts`; renderer generation schema is independently versioned. |
| DEC-04 | Define measurable fixtures for the greater-than-90% detection target. | MVP-14 | Open |

## Deferred roadmap

- v1.1: multi-screen batches, saved project settings, review-summary export.
- v1.2: smart focus grouping, enhanced collision avoidance, design-system mapping.
- v2.0: AI suggestions, scoring, WCAG validation, and revision change detection.

## Change log

| Date | Change | Features affected |
| --- | --- | --- |
| 2026-08-02 | Prepared the project for public open-source collaboration with a designer-focused README, MIT license, contribution guide, issue templates, and public repository metadata. | Project records |
| 2026-08-02 | Implemented the complete local MVP pipeline: typed selection, one-pass parser, immutable model, four engines, render plans, collision-aware layout, reusable tagged renderer, safe regeneration/removal, full UI, versioned rules, and regression/performance coverage. External Figma, Greenlines-asset, and accuracy-fixture validation remain tracked. | MVP-02–MVP-14, DEC-03 |
| 2026-08-02 | Added the strict TypeScript Figma plugin foundation, local-only manifest, build pipeline, minimal UI/controller, and automated tests. | MVP-01 |
| 2026-08-02 | Initialized the PRD, repo instructions, and project tracker. | Project records |

## Maintenance contract

Every implementation change must update this file in the same change set:

1. Move affected feature rows to their actual status.
2. Record newly completed behavior under **Completed**.
3. Keep **In progress** and **Pending next** accurate.
4. Add or resolve blockers and decisions.
5. Append a concise dated change-log entry.
6. Update `Last updated` whenever delivery state changes.

A feature is not `Complete` until its implementation, happy-path and edge-case
tests, invalid-input coverage, regression coverage, and relevant documentation are
all complete.
