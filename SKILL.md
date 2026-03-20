---
name: js-vi-system
description: JS Brand Visual Identity System — Neo-Brutalism + Cyberpunk design tokens, poster generator, and brand guidelines.
version: 1.1.1
metadata:
  openclaw:
    emoji: "\U0001F3A8"
    homepage: https://github.com/imjszhang/js-vi-system
    os:
      - windows
      - macos
      - linux
    requires:
      bins:
        - node
---

# JS VI System

The single source of truth for the **JS** brand — design tokens, component styles, poster generator, and brand guidelines built on **Neo-Brutalism + Cyberpunk** aesthetics.

## First Step: Detect Runtime Mode

Before performing any operation, detect whether this project is running as an **OpenClaw plugin** or in **standalone CLI mode**. The result determines command prefixes, configuration paths, and available features.

### Detection Steps

#### Step 0 — OS & Environment Variable Probe

Detect the current OS to choose correct shell commands, then check OpenClaw-related environment variables:

**OS Detection:**

| Check | Windows | macOS / Linux |
|-------|---------|---------------|
| OS identification | `echo %OS%` or `$env:OS` (PowerShell) | `uname -s` |
| Home directory | `%USERPROFILE%` | `$HOME` |
| Default OpenClaw state dir | `%USERPROFILE%\.openclaw\` | `~/.openclaw/` |
| Default config path | `%USERPROFILE%\.openclaw\openclaw.json` | `~/.openclaw/openclaw.json` |

**Environment Variable Check:**

```bash
# Windows (PowerShell)
Get-ChildItem Env: | Where-Object { $_.Name -match '^OPENCLAW_' }

# Windows (CMD / Git Bash)
set | grep -iE "^OPENCLAW_"

# macOS / Linux
env | grep -iE "^OPENCLAW_"
```

| Variable | Meaning if set |
|----------|---------------|
| `OPENCLAW_CONFIG_PATH` | Direct path to config file — **highest priority**, use as-is |
| `OPENCLAW_STATE_DIR` | OpenClaw state directory — config file at `$OPENCLAW_STATE_DIR/openclaw.json` |
| `OPENCLAW_HOME` | Custom home directory — state dir resolves to `$OPENCLAW_HOME/.openclaw/` |

**OpenClaw config file resolution order** (first match wins):

1. `OPENCLAW_CONFIG_PATH` is set → use that file directly
2. `OPENCLAW_STATE_DIR` is set → `$OPENCLAW_STATE_DIR/openclaw.json`
3. `OPENCLAW_HOME` is set → `$OPENCLAW_HOME/.openclaw/openclaw.json`
4. None set → default `~/.openclaw/openclaw.json` (Windows: `%USERPROFILE%\.openclaw\openclaw.json`)

#### Step 1 — OpenClaw Binary Detection

1. Check if `openclaw` command exists on PATH (Windows: `where openclaw`, macOS/Linux: `which openclaw`)
2. If exists, read the OpenClaw config file (path resolved by Step 0) and look for `js-vi-system` in `plugins.entries` with `enabled: true`
3. Verify that `plugins.load.paths` contains a path pointing to this project's `openclaw-plugin/` directory

If **all three checks pass** → use **OpenClaw Plugin Mode**. Otherwise → use **Standalone CLI Mode**.

### Mode Comparison

| Aspect | OpenClaw Plugin Mode | Standalone CLI Mode |
|--------|---------------------|-------------------|
| Configuration | `~/.openclaw/openclaw.json` → `plugins.entries.js-vi-system.config` | Command-line flags |
| Command prefix | `openclaw vi <cmd>` | `node bin/js-vi.js <cmd>` |
| AI tools | `vi_*` (4 tools via OpenClaw Agent) | Not available (use CLI) |
| Brand manual | `http://<host>/plugins/js-vi/` | `npm run preview` (localhost) |
| Poster generation | `vi_poster_generate` tool or `openclaw vi poster` | `node bin/js-vi.js poster` |

### OpenClaw Plugin Mode

When the plugin is deployed:

- **CLI**: always use `openclaw vi ...` instead of `node bin/js-vi.js ...`
- **AI tools**: prefer `vi_*` tools when invoked from an OpenClaw Agent session
- **Config**: modify `~/.openclaw/openclaw.json` for browser path, default scheme/size, output directory; command-line flags are not needed
- **Brand manual**: access via `http://<openclaw-host>/plugins/js-vi/`

### Standalone CLI Mode

When running without OpenClaw:

- **CLI**: use `node bin/js-vi.js <cmd>`
- **Config**: pass options via command-line flags (e.g. `--scheme dark --size a4`)
- **No AI tools** — all interaction through CLI commands
- **Brand manual**: run `npm run preview` to serve locally on port 3000

---

## Deployment Probe

After detecting the runtime mode, run the following diagnostic steps to verify the local deployment:

### Step 1 — OpenClaw Availability

- Windows: `where openclaw` / macOS & Linux: `which openclaw`
- If found: `openclaw --version` to confirm the installed version

### Step 2 — Plugin Load Status

Read the OpenClaw config file and check:

- `plugins.load.paths` — does it include a path pointing to this project's `openclaw-plugin/` directory?
- `plugins.entries["js-vi-system"].enabled` — is the plugin enabled?
- `plugins.entries["js-vi-system"].config` — extract `browserPath`, `defaultScheme`, `defaultSize` for a quick config snapshot

### Step 3 — Browser Availability (for image/PDF rendering)

Check if a Chrome or Edge browser is available:

- Plugin mode: `browserPath` from plugin config
- If empty: check common paths (`C:\Program Files\Google\Chrome\Application\chrome.exe`, `/usr/bin/google-chrome`, `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`)
- Note: browser is only needed for PNG/JPEG/PDF/GIF output; HTML and SVG work without it

---

## Config Files Map

| File | Typical Path | Purpose | How to Modify |
|------|-------------|---------|--------------|
| `openclaw.json` | `~/.openclaw/openclaw.json` | Main config: browser path, default scheme/size, output dir, extra templates | Edit JSON directly |
| `openclaw.plugin.json` | `{projectRoot}/openclaw-plugin/` | Plugin manifest: config schema, UI hints | Generally not edited by users |

`{projectRoot}` is the directory where this project is cloned / installed.

---

## Action Priority

When performing an operation, always prefer the highest-priority method available:

> **OpenClaw AI Tool → OpenClaw CLI (`openclaw vi ...`) → Standalone CLI (`node bin/js-vi.js ...`)**

| Scenario | Preferred | Fallback | Last Resort |
|----------|-----------|----------|-------------|
| Generate a poster | `vi_poster_generate` | `openclaw vi poster -t <name>` | `node bin/js-vi.js poster -t <name>` |
| List templates | `vi_templates_list` | `openclaw vi templates` | `node bin/js-vi.js templates` |
| Get design tokens | `vi_tokens_get` | — | Read `tokens/*.json` directly |
| Get brand info | `vi_brand_info` | — | Read `brand/*.md` / `voice/*.md` directly |
| Build CSS/Tailwind | — | `openclaw vi build` | `node bin/js-vi.js build` or `npm run build` |
| Preview brand manual | Browse `http://<host>/plugins/js-vi/` | `npm run preview` | Open `preview/index.html` directly |
| Change defaults | Edit `~/.openclaw/openclaw.json` plugin config | Pass CLI flags | N/A |

---

## What it does

JS VI System provides a complete brand Visual Identity toolkit:

1. **Design Tokens** — colors, typography, shadows, borders, spacing, animation, and grid definitions in JSON
2. **CSS Generation** — tokens compiled to CSS custom properties (`tokens.css`) and Neo-Brutalism component styles (`brutal.css`)
3. **Tailwind Preset** — tokens mapped to a Tailwind CSS theme preset for seamless integration
4. **Poster Generator** — template-based poster creation with multiple output formats (HTML/PNG/JPEG/SVG/PDF/GIF); HTML wrapping inlines shared and per-template CSS, resolving `styles.css` from each template’s directory (including `extraTemplatesDirs`)
5. **Brand Documentation** — philosophy, identity, design principles, and tone-of-voice guidelines

The visual style is **Neo-Brutalism + Cyberpunk**: hard borders, hard shadows, no rounded corners, high-contrast black/yellow/white palette, infused with Cyber-Taoist philosophy.

## Architecture

```
Design Tokens (JSON)
       ↓
  Build Script
       ↓
┌──────────────────────────────┐
│  tokens.css (CSS variables)  │
│  tailwind-preset.js          │
│  brutal.css (components)     │
└──────────────────────────────┘

Templates (render.js + meta.json + styles.css)
       ↓
  Template Engine → renderToHTML()
       ↓
  Renderer Factory → renderOutput()
       ↓
┌──────────────────────────────┐
│  HTML / PNG / JPEG / SVG     │
│  PDF / GIF                   │
└──────────────────────────────┘
```

The OpenClaw plugin wraps the template engine, renderer factory, token loader, and brand docs as AI tools, CLI commands, and HTTP routes.

## Provided AI Tools

| Tool | Description |
|------|-------------|
| `vi_templates_list` | List all available poster templates with their sizes, schemes, fields, and animation info |
| `vi_poster_generate` | Generate a brand poster from a template. Supports html/png/jpeg/svg/gif/pdf output |
| `vi_tokens_get` | Get design tokens by category (colors, typography, shadows, borders, spacing, animation, grid) |
| `vi_brand_info` | Get brand documentation (identity, philosophy, principles, tone-of-voice) |

## CLI Commands

### OpenClaw Plugin Mode

```
openclaw vi templates                          List available poster templates
openclaw vi poster -t <name> [options]         Generate a poster
  -s, --scheme <scheme>                          Color scheme (daylight/dark/minimal)
  --size <size>                                  Poster size (a4/square/banner/story/wechat-cover/wechat-thumb)
  -f, --format <format>                          Output format (html/png/jpeg/svg/gif/pdf)
  -o, --output <path>                            Output file path
  --title <text>                                 Poster title (supports \n)
  --subtitle <text>                              Subtitle
  --date <text>                                  Date text
  --location <text>                              Location text
  --info <text>                                  Info text
  --tag <text>                                   Tag text
  --config <path>                                Batch config JSON file
  --browser-path <path>                          Chrome/Edge executable path
openclaw vi build                              Regenerate CSS and Tailwind preset from tokens
```

### Standalone CLI Mode

```
node bin/js-vi.js poster -t <name> [options]   Generate a poster (same options as above)
node bin/js-vi.js templates                    List available templates
node bin/js-vi.js build                        Regenerate CSS and Tailwind preset
```

## Web UI

The plugin registers HTTP routes on the OpenClaw gateway:

| Route | Description |
|-------|-------------|
| `/plugins/js-vi/` | Brand manual — interactive preview of design tokens, components, and brand guidelines |
| `/plugins/js-vi/posters` | Poster gallery — preview of all generated posters |
| `/plugins/js-vi/{filePath}` | Static assets (preview/, assets/, css/ directories) |

Access the brand manual at `http://<openclaw-host>/plugins/js-vi/` after the plugin is loaded.

In standalone mode, run `npm run preview` to serve the same content on `http://localhost:3000`.

## Available Templates

| Template | Style | Best For |
|----------|-------|----------|
| `terminal` | Terminal / command-line aesthetic with typing animation | Tech talks, product launches, developer events |
| `card` | Card layout with slide-up entrance animation | General events, social media cards |
| `cybertaoist` | Cyber-Taoist style with logo ring pulse animation | Brand campaigns, philosophy themes, premium events |
| `wechat-cover` | WeChat headline–style cover layout | Official Account cover (900×383), square thumb (500×500) |

All templates support:
- **Schemes**: `daylight` (light), `dark` (default, most on-brand), `minimal` (black & white)
- **Sizes**: `a4` (595×842), `square` (640×640), `banner` (640×360, 16:9), `story` (420×748, 9:16), `wechat-cover` (900×383), `wechat-thumb` (500×500)
- **Formats**: `html` (fastest, no deps), `png`/`jpeg`/`pdf`/`gif` (require Chrome/Edge), `svg`

The `wechat-cover` template does not declare motion/animation (static layout); other templates may include CSS animations for GIF capture.

## Skill Bundle Structure

```
js-vi-system/
├── SKILL.md                              ← Skill entry point (this file)
├── package.json                          ← Root package (ESM, Node ≥ 18)
├── README.md                             ← Quick-start guide
├── bin/
│   └── js-vi.js                          ← CLI entry point
├── build/
│   └── generate.js                       ← Token → CSS/JS generation script
├── cli/
│   ├── index.js                          ← Commander program setup
│   ├── commands/
│   │   ├── poster.js                     ← Poster generation command
│   │   ├── templates.js                  ← Template listing command
│   │   └── build.js                      ← Build command
│   └── utils/
│       └── browser.js                    ← Puppeteer browser utilities
├── core/
│   ├── config.js                         ← Option validation, content merging
│   ├── renderer-factory.js               ← Multi-format render dispatch
│   └── template-engine.js                ← Template discovery, loading, HTML rendering
├── css/
│   ├── tokens.css                        ← Generated CSS custom properties
│   ├── brutal.css                        ← Neo-Brutalism component styles
│   └── tailwind-preset.js               ← Generated Tailwind theme preset
├── tokens/
│   ├── index.js                          ← Token loader entry
│   ├── colors.json                       ← Color palette
│   ├── typography.json                   ← Font stack and sizes
│   ├── shadows.json                      ← Hard shadow definitions
│   ├── borders.json                      ← Border styles (thick, no-radius)
│   ├── spacing.json                      ← Spacing scale
│   ├── animation.json                    ← Motion tokens
│   └── grid.json                         ← Grid and layout tokens
├── templates/
│   ├── _shared/                          ← Shared assets (base CSS, logo, utils)
│   ├── terminal/                         ← Terminal-style template
│   ├── card/                             ← Card-style template
│   ├── cybertaoist/                      ← Cyber-Taoist template
│   └── wechat-cover/                     ← WeChat cover / thumb template
├── renderers/
│   ├── html.js                           ← HTML file output
│   ├── image.js                          ← PNG/JPEG via Puppeteer screenshot
│   ├── pdf.js                            ← PDF via Puppeteer
│   ├── svg.js                            ← SVG output
│   └── gif.js                            ← Animated GIF via Puppeteer + gifenc
├── brand/
│   ├── identity.md                       ← Brand identity definition
│   ├── philosophy.md                     ← Brand philosophy (Cyber-Taoist)
│   └── principles.md                     ← Design principles
├── character/
│   └── spec.md                           ← Cyber-Taoist character specification
├── voice/
│   └── tone-and-style.md                 ← Tone and style guidelines
├── preview/
│   ├── index.html                        ← Interactive brand manual
│   └── posters.html                      ← Poster gallery (generated)
├── assets/
│   └── logo/                             ← Brand logo files
└── openclaw-plugin/
    ├── package.json                      ← ESM module descriptor
    ├── openclaw.plugin.json              ← Plugin manifest (config schema, UI hints)
    ├── index.mjs                         ← Plugin logic — 4 AI tools + CLI + HTTP routes
    └── skills/
        └── poster-generator/
            └── SKILL.md                  ← Poster generation skill
```

> `openclaw-plugin/index.mjs` imports from `../core/`, `../tokens/`, `../brand/`, `../voice/` via relative paths, so the directory layout must be preserved.

## Brand Colors

| Color | Hex | Symbol |
|-------|-----|--------|
| JS Yellow | `#FCD228` | Momentum, Energy, Attention |
| Black | `#000000` | Clarity, Structure, Dao |
| White | `#FFFFFF` | Purity, Space, Wu-Wei |

## Design Principles

- **Neo-Brutalism**: Hard borders, hard shadows, no rounded corners
- **High Contrast**: Black/Yellow/White — maximum visibility
- **Functional**: Every element serves a purpose, no decoration
- **Prohibited**: Gradients, rounded corners, soft shadows, pastel colors, decorative elements

## Prerequisites

- **Node.js** >= 18
- **Chrome or Edge** (optional, required for PNG/JPEG/PDF/GIF output)

## Install

### Option A — As OpenClaw Plugin (recommended)

1. Clone or download the project
2. Run `npm install` in the project directory
3. Register the plugin (see below)

### Option B — Standalone CLI

1. Clone or download the project
2. Run `npm install`
3. Run `node bin/js-vi.js --help` to see available commands

### Register the Plugin

Add to `~/.openclaw/openclaw.json`:

```json
{
  "plugins": {
    "load": {
      "paths": ["/path/to/js-vi-system/openclaw-plugin"]
    },
    "entries": {
      "js-vi-system": {
        "enabled": true,
        "config": {
          "browserPath": "",
          "defaultScheme": "dark",
          "defaultSize": "a4"
        }
      }
    }
  }
}
```

Restart OpenClaw to load the plugin.

## Plugin Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `browserPath` | string | `""` | Chrome/Edge executable path (required for PNG/PDF/GIF; auto-detect if empty) |
| `defaultScheme` | string | `"dark"` | Default color scheme (daylight/dark/minimal) |
| `defaultSize` | string | `"a4"` | Default poster size (a4/square/banner/story/wechat-cover/wechat-thumb) |
| `outputDir` | string | `""` | Poster output directory (empty = project root `poster/`) |
| `extraTemplatesDirs` | string | `""` | Additional template directories (comma-separated paths) |

## Verify

```bash
# Plugin mode
openclaw vi templates

# Standalone mode
node bin/js-vi.js templates
```

Expected output:

```
  Available Templates

  terminal — Terminal
    Sizes:   a4, square, banner, story
    Schemes: daylight, dark, minimal
    Fields:
      * title (text)
        subtitle (string)
        date (string)
        location (string)
        info (string)

  card — Card
    ...

  cybertaoist — Cyber-Taoist
    ...
```

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Template not found: <name>` | Typo in template name | Run `vi_templates_list` or `openclaw vi templates` to see available names |
| `Unsupported format: <fmt>` | Invalid output format | Use one of: html, png, jpeg, svg, gif, pdf |
| PNG/PDF/GIF generation fails | Chrome/Edge not found | Set `browserPath` in plugin config or pass `--browser-path` flag |
| `Invalid scheme: <name>` | Wrong color scheme name | Use one of: daylight, dark, minimal |
| `Invalid size: <name>` | Wrong size name | Use one of: a4, square, banner, story, wechat-cover, wechat-thumb |
| Tools not appearing in OpenClaw | Plugin path wrong | Ensure path in `plugins.load.paths` points to `openclaw-plugin/` subdirectory |
| Brand manual not loading | HTTP routes not registered | Check plugin is enabled in `openclaw.json`; access via `/plugins/js-vi/` |

## Security

This skill operates entirely locally. It reads design tokens, templates, and brand documentation from the project directory. The optional Puppeteer integration launches a local Chrome/Edge instance for screenshot-based rendering. No external APIs are called, no telemetry is collected, and no user data is transmitted.

## Extension Skills

JS VI System includes bundled skills in `openclaw-plugin/skills/`:

| Skill | Description |
|-------|-------------|
| **poster-generator** | Generate brand posters using templates with customizable content, scheme, size, and output format |

## Links

- Source: https://github.com/imjszhang/js-vi-system
- License: MIT
