# Accessibility Review Assistant for Figma

[![CI](https://github.com/saikrishnapachala/Accessibility-Review-Assistant-Figma-Plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/saikrishnapachala/Accessibility-Review-Assistant-Figma-Plugin/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Figma Plugin](https://img.shields.io/badge/Figma-Local%20Plugin-a259ff.svg)](manifest.json)

Turn one iOS screen into a structured accessibility review workspace—directly in
Figma, without uploading your designs or relying on external AI.

> **Project status:** the complete local MVP workflow is implemented and covered
> by automated tests. It still needs final validation in Figma desktop, approved
> Greenlines visual assets, and labeled design fixtures before a production
> release. See the [project tracker](docs/PROJECT_STATUS.md) for exact status.

## Why this project exists

Preparing accessibility Greenlines by hand is valuable but repetitive. Designers
duplicate screens, place stickers, draw focus regions, number controls, and make
room for alternative-text notes—often repeating the same mechanical work across
every review.

Accessibility Review Assistant automates that setup so designers can spend more
time making thoughtful accessibility decisions.

```text
Select one iOS screen
        ↓
Choose review categories
        ↓
Generate a review workspace
        ↓
Review every “Needs Review” annotation
        ↓
Share with your accessibility partners
```

The plugin accelerates review; it does not replace an accessibility designer or
make final accessibility decisions on their behalf.

## What it creates

For one selected screen, the plugin can generate four side-by-side review
sections:

| Review section | What designers receive |
| --- | --- |
| **Content Hierarchy** | Screen-title and heading-candidate stickers. |
| **Focus Grouping** | Reviewable focus rectangles for controls and supported groups. |
| **Text Alternatives** | Editable prompts for images, icons, avatars, and illustrations. |
| **Tab Order and Touch Areas** | Numbered navigation badges and findings for controls smaller than 44 × 44 points. |

Each section contains a duplicate of the selected screen. The original design is
never edited.

## Designer workflow

1. Select exactly one frame containing an iOS screen.
2. Open **Accessibility Review Assistant**.
3. Keep all four review categories enabled, or turn off the ones you do not need.
4. Choose **Generate review**.
5. Inspect every annotation marked with `?` or **Needs Review**.
6. Refine the generated notes with product and accessibility context.
7. Run **Generate review** again whenever the source changes—the prior generated
   workspace is replaced instead of duplicated.
8. Use **Remove generated** to delete generated output for the selected source.

## How decisions are handled

The plugin uses local, deterministic rules based on layer structure, component
metadata, names, variants, typography, geometry, and Auto Layout information.

- Strong component evidence can produce a confirmed annotation.
- Naming or visual heuristics produce **Needs Review**.
- Missing context never produces invented descriptions or accessibility intent.
- Designers and accessibility reviewers always retain final authority.

The current role vocabulary includes buttons, inputs, switches, segmented
controls, groups, lists, cards, images, icons, avatars, headings, and text.

## Privacy and safety

- Runs locally inside Figma.
- Makes no network requests; the manifest explicitly denies network access.
- Uses no external AI, cloud API, or MCP service.
- Clones the selected source frame rather than modifying it.
- Tags every generated workspace so regeneration and removal stay scoped to the
  correct source screen.

## Install as a local Figma plugin

### Requirements

- [Node.js](https://nodejs.org/) 22 or newer.
- Figma desktop.

### Setup

```sh
git clone https://github.com/saikrishnapachala/Accessibility-Review-Assistant-Figma-Plugin.git
cd Accessibility-Review-Assistant-Figma-Plugin
npm ci
npm run build
```

Then in Figma desktop:

1. Open **Plugins → Development → Import plugin from manifest**.
2. Choose this repository's `manifest.json`.
3. Select an iOS screen frame.
4. Run **Accessibility Review Assistant** from your development plugins.

The manifest contains a local development ID. Replace it with the ID assigned by
Figma only when preparing an official plugin release.

## Development

Run the complete local quality gate:

```sh
npm ci
npm run check
```

`npm run check` performs strict TypeScript validation, builds the controller and
inline UI into `dist/`, and runs unit, integration, architecture, artifact, and
performance regression tests.

The architecture deliberately keeps product rules independent of Figma:

```text
Plugin → Parser → Accessibility Model → Accessibility Engines
       → Render Plan → Layout → Renderer → Figma
```

Start with the [architecture guide](docs/ARCHITECTURE.md), then read the
[product requirements](docs/PRD.md) and [project tracker](docs/PROJECT_STATUS.md).

## Help improve it

Contributions from UX designers, accessibility practitioners, design-system
teams, and engineers are welcome. Useful contributions include:

- anonymized iOS screen fixtures with expected accessibility annotations;
- examples of false positives or missed controls;
- Greenlines spacing, labeling, and component specifications that can be shared;
- accessibility-rule proposals with clear evidence and review expectations;
- parser, layout, renderer, documentation, and test improvements.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Do
not submit confidential product screens, private design-system assets, or user
data.

## Release acceptance

The remaining production checks are documented in the
[Figma desktop acceptance test](docs/FIGMA_ACCEPTANCE_TEST.md). They include
source-integrity checks, regeneration, removal, Greenlines fidelity, full Figma
rendering under ten seconds, and greater-than-90% accuracy against an approved
labeled fixture set.

## License

Released under the [MIT License](LICENSE).
