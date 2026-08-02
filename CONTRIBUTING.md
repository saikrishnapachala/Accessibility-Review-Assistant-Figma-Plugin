# Contributing

Thank you for helping make accessibility review work faster and more reliable.
UX designers, accessibility practitioners, design-system contributors, and
engineers are all welcome.

## Before contributing

- Read [docs/PRD.md](docs/PRD.md) for product scope.
- Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before changing code.
- Check [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) for current work and open
  decisions.
- Never contribute confidential screens, proprietary Greenlines assets, user
  data, credentials, or material you do not have permission to share.

## Designer and accessibility contributions

You do not need to write code to contribute. Helpful issues include:

- a control the plugin missed or classified incorrectly;
- an annotation that should have been marked `Needs Review`;
- a tab-order or grouping case with a clearly explained expected result;
- an anonymized fixture showing a repeatable problem;
- feedback on labels, spacing, connectors, and review usability.

When sharing a fixture, remove brand names, personal information, customer data,
and private design-system content. Include the expected result and explain why it
is correct.

## Engineering contributions

1. Fork and clone the repository.
2. Install dependencies with `npm ci`.
3. Create a focused branch.
4. Add or update tests alongside the change.
5. Run `npm run check`.
6. Update `docs/PROJECT_STATUS.md` when delivery state changes.
7. Open a pull request describing the behavior, evidence, and any uncertainty.

Keep the dependency direction intact:

```text
Plugin → Parser → Accessibility Model → Accessibility Engines
       → Render Plan → Layout → Renderer → Figma
```

Business logic must stay independent of Figma APIs. Accessibility rules must be
deterministic, explainable, and conservative: uncertain intent becomes `Needs
Review`, never a guess.

## Pull-request checklist

- [ ] The change is within the PRD or clearly proposes a scope update.
- [ ] Happy path, edge cases, invalid input, and regression behavior are covered.
- [ ] The source design remains immutable.
- [ ] Generated output remains tagged, removable, and idempotent.
- [ ] User-facing behavior and project status documentation are synchronized.
- [ ] `npm run check` passes.

## Reporting security or privacy issues

Do not publish secrets, private Figma files, or sensitive design content in a
public issue. Open a minimal issue without sensitive details and ask the
maintainers for a private reporting channel.
