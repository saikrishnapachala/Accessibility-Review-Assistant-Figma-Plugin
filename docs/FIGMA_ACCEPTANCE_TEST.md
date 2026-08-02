# Figma Desktop Acceptance Test

Run this matrix against a production-representative iOS screen before marking the
remaining MVP features complete.

## Setup

1. Run `npm ci` and `npm run check`.
2. In Figma desktop, import `manifest.json` as a development plugin.
3. Open a disposable copy of a file containing representative iOS screens and
   the approved Greenlines reference components.

## Test matrix

| Area | Test | Expected result |
| --- | --- | --- |
| Loading | Run the imported plugin. | UI opens without console errors or network requests. |
| No selection | Run Generate with nothing selected. | Actionable single-frame selection error appears; canvas is unchanged. |
| Multiple selection | Select two objects. | Multiple-selection error appears; canvas is unchanged. |
| Wrong type | Select one non-frame object. | Frame-required error appears and identifies the selected object context. |
| Valid selection | Select one iOS frame. | Frame name and ready state appear in the UI. |
| Category toggles | Disable two categories and generate. | Only the two enabled review sections are created. |
| Full generation | Enable all categories and generate. | Content Hierarchy, Focus Grouping, Text Alternatives, and Tab Order and Touch Areas appear. |
| Source integrity | Compare the original frame before and after generation. | Original node, children, properties, and position are unchanged. |
| Uncertainty | Use ambiguous headings, icons, or overlapping controls. | Corresponding annotations display `Needs Review` styling rather than invented intent. |
| Reusable output | Inspect generated annotations. | Stickers/outlines are instances of generated reusable components and all generated layers are tagged. |
| Regeneration | Generate twice for the same source frame. | One current workspace remains; the second run replaces the prior generated output. |
| Failure safety | Trigger a controlled rendering failure if a disposable fixture permits it. | Incomplete replacement is removed and prior valid output remains. |
| Removal | Select the source and choose Remove generated. | Only workspaces tagged for that source are removed. |
| Other sources | Generate reviews for two source frames, then remove one. | The other source's workspace remains. |
| Greenlines fidelity | Compare components, color, spacing, labels, and connectors to the approved reference. | Output matches the approved measurable specification. Record every mismatch. |
| Performance | Generate from representative small, medium, and dense screens. | Every complete run takes less than 10 seconds. |

## Accuracy fixture report

For each approved fixture, record expected and actual detections for buttons, text
fields, switches, segmented controls, icons, headings, groups, and tab order.
Calculate precision and recall per role and aggregate accuracy. The MVP target is
greater than 90% for the agreed common-control dataset; do not calculate against
an ad hoc or unlabeled screen collection.

## Completion evidence

Record the Figma version, operating system, fixture revision, Greenlines asset
revision, ruleset version, run durations, accuracy results, console output, and
screenshots. Link that evidence from `docs/PROJECT_STATUS.md` when closing the
remaining features.
