# Changelog

All notable changes to this project are documented in this file. Version numbers follow the package `version` field in `package.json`.

## [1.4.0] - 2026-04-03

### Added

- **`spatialLayout` engine** — generic, data-driven zone-based layout system in `template-engine.js`. Templates declare an ordered `zones` array in `meta.json`; the engine measures text heights via Pretext, computes zone positions, and outputs CSS variables through a `vars` mapping. No template-specific names or CSS variables are hardcoded in the engine.
- **`textLayout.autoSizeVar`** — optional property on `textLayout` field constraints. When present, `measureFieldHeight` uses the auto-fitted font size (from the named CSS variable) instead of the base font size, ensuring spatial layout measurements match the rendered output.
- **`computeSpatialVars()`** — new internal function that processes `spatialLayout.zones`, supports `fill` (remaining space), `extendBehind` (overlap zones), `margin`, and per-size overrides via `sizeOverrides`.

## [1.3.0] - 2026-03-30

### Added

- **Pretext text engine integration** — `@chenglou/pretext` + `@napi-rs/canvas` for accurate server-side text measurement without DOM.
- **`core/text-measure.js`** — new module exporting `measureText`, `fitFontSize`, `balanceText`, `checkOverflow`, `measureField`, `shrinkWrapWidth`, `fitToLines`.
- **`js-vi measure` command** — measure text layout for a template without rendering; shows line count, height, fill ratio, and overflow status per field.
- **`js-vi typeset` command** — scan text layout across all supported sizes for a template; suggests `--auto-fit` font sizes.
- **`js-vi best-size` command** — recommend the best poster size for given content based on fill ratio.
- **`js-vi lint` command** — batch-validate text overflow for all posters in a config JSON; supports `--strict` (exit 1 on warnings) and `--json` output for CI integration.
- **`poster --auto-fit`** — auto-fit title font size to available space via binary-search.
- **`poster --balanced`** — balance title line widths for even wrapping.
- **`poster --shrink-wrap`** — shrink canvas width to fit actual title content width.
- **`poster --strict`** — abort on text overflow instead of warning.
- **Config `layout.targetLines`** — in batch config JSON, set a target line count to find the exact font size that produces N lines.
- **`init` enhancement** — scaffolded templates now include `textLayout` constraints in `meta.json` and CSS variable hooks (`--auto-title-size`, `--balanced-title-width`) in `styles.css`.
- **`preview/typeset.html`** — interactive browser-side typeset preview with real-time line count, height, fill ratio, and per-line width bar chart; linked from brand manual navigation.
- **Template `textLayout` metadata** — all 4 built-in templates (`terminal`, `cybertaoist`, `card`, `wechat-cover`) now define `textLayout` constraints with `sizeOverrides`.

## [1.2.0] - 2026-03-25

### Added

- **`js-vi init` command** — scaffolds an external template plugin repository with `package.json` (auto-resolved `js-vi-system` dependency path), `.gitignore`, sample batch config, and optional template skeleton (`meta.json` + `render.js` + `styles.css`). Usage: `js-vi init <dir> --template <name>`.

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
