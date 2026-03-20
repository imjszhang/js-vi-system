# Changelog

All notable changes to this project are documented in this file. Version numbers follow the package `version` field in `package.json`.

## [1.1.1] - 2026-03-20

### Added

- **`wechat-cover` template** — WeChat Official Account headline cover and square thumb layouts; sizes `wechat-cover` (900×383) and `wechat-thumb` (500×500).
- **npm export** `js-vi-system/templates/_shared/*` — allows consumers to resolve shared template assets via package subpaths.

### Fixed

- **Poster HTML CSS** — `wrapHTML` loads each template’s `styles.css` from the template’s absolute directory (`templateDir`). Templates loaded from `extraTemplatesDirs` now inline styles correctly (previously only worked when paths matched the built-in `templates/<name>/` layout).

## [1.1.0] - 2026-03-19

### Added

- **`js-vi` CLI** (`bin/js-vi.js`) — `poster`, `templates`, and `build` commands; `npm run poster` script alias.
- **Poster pipeline** — template engine, multi-format output (HTML, PNG, JPEG, SVG, PDF, GIF) via Puppeteer where required; dependencies: `commander`, `puppeteer-core`, `gifenc`, `picocolors`.
- **Preview** — poster gallery and template-driven `preview/posters.html` generation with inlined CSS/JS.
