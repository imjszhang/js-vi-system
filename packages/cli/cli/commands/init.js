import { resolve, relative, basename, join, dirname } from 'path';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import pc from 'picocolors';

const __dirname = dirname(fileURLToPath(import.meta.url));
const viSystemRoot = resolve(__dirname, '..', '..');

function toLabel(name) {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function toPrefix(name) {
  return name.split('-').map(w => w[0]).join('');
}

function writeFile(filePath, content) {
  const dir = dirname(filePath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, content, 'utf-8');
  console.log(pc.green(`✓ Created ${relative(process.cwd(), filePath)}`));
}

// ── Generators ────────────────────────────────────────────────────────

function generatePackageJSON(dir) {
  const name = basename(resolve(dir));
  const relPath = relative(resolve(dir), viSystemRoot).replace(/\\/g, '/');

  return JSON.stringify({
    name,
    version: '1.0.0',
    private: true,
    type: 'module',
    description: `Template extension for js-vi-system`,
    dependencies: {
      'js-vi-system': `file:${relPath}`,
    },
    scripts: {
      poster: 'js-vi poster --templates-dir templates',
      build: 'js-vi build',
      gallery: 'js-vi gallery',
    },
  }, null, 2) + '\n';
}

function generateGitignore() {
  return `node_modules/\noutput/\nposter/\nwork_dir/\n.env\n`;
}

function generateSharedLogoJS() {
  return `// Replace with your project's logo SVG
// Example: js-vi-templates-cybertaoist/templates/_shared/ct-logo.js
export { LOGO_SVG as PROJECT_LOGO_SVG } from 'js-vi-system/templates/_shared/logo.js';
`;
}

function generateMetaJSON(name) {
  return JSON.stringify({
    name,
    label: toLabel(name),
    fields: [
      { key: 'title', type: 'text', required: true, default: 'HELLO\nWORLD' },
      { key: 'subtitle', type: 'string', default: '// subtitle' },
      { key: 'tag', type: 'string', default: 'TAG' },
      { key: 'date', type: 'string', default: '2026.01.01' },
    ],
    sizes: ['a4', 'square', 'banner', 'story', 'wechat-cover', 'wechat-thumb'],
    schemes: ['daylight', 'dark', 'minimal'],
    animation: { supported: false },
    textLayout: {
      title: {
        font: '700 48px Space Grotesk',
        lineHeight: 52.8,
        maxWidth: 515,
        maxHeight: 400,
        transform: 'uppercase',
      },
    },
  }, null, 2) + '\n';
}

function generateRenderJS(name) {
  const p = toPrefix(name);
  return `import { PROJECT_LOGO_SVG } from '../_shared/logo.js';
import { esc } from 'js-vi-system/templates/_shared/utils.js';

export function render(content, options = {}) {
  const c = content;

  return \`
    <div class="poster poster-${name} poster-grid-bg" style="width:100%;height:100%">
      <div class="${p}-body">
        <div class="${p}-tag">\${esc(c.tag)}</div>
        <div class="${p}-title">\${esc(c.title).replace(/\\n/g, '<br>')}</div>
        <div class="${p}-subtitle">\${esc(c.subtitle)}</div>
        <div class="${p}-date">\${esc(c.date)}</div>
      </div>
      <div class="${p}-footer">
        <div class="${p}-logo">\${PROJECT_LOGO_SVG}</div>
        <span class="${p}-brand">JS_VI_SYSTEM</span>
      </div>
    </div>\`;
}
`;
}

function generateStylesCSS(name) {
  const p = toPrefix(name);
  return `/*
 * ${toLabel(name)} — Template Styles
 * CSS class prefix: ${p}-
 *
 * Design rules:
 *   - NO gradients, rounded corners, soft shadows, or pastel colors
 *   - USE hard borders, hard shadows (offset box-shadow), high contrast
 *   - Fonts: Space Grotesk (body) + JetBrains Mono (code/tags)
 *   - Colors: only brand yellow #FCD228, black #000, white #FFF via CSS vars
 *
 * Available scheme variables:
 *   --p-bg, --p-text, --p-accent, --p-surface, --p-border,
 *   --p-shadow, --p-muted, --p-grid-line, --p-tag-bg, --p-tag-text
 */

.poster-${name} {
  display: flex;
  flex-direction: column;
  background-color: var(--p-bg);
  color: var(--p-text);
  font-family: 'Space Grotesk', sans-serif;
  padding: 40px;
}

.${p}-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

.${p}-tag {
  display: inline-block;
  align-self: flex-start;
  padding: 4px 12px;
  background: var(--p-tag-bg);
  color: var(--p-tag-text);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.${p}-title {
  font-size: var(--auto-title-size, 48px);
  font-weight: 700;
  line-height: 1.1;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  max-width: var(--balanced-title-width, none);
}

.${p}-subtitle {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: var(--p-muted);
}

.${p}-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--p-muted);
}

.${p}-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 16px;
  border-top: 3px solid var(--p-border);
}

.${p}-logo {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.${p}-brand {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* ── Scheme overrides ── */

/*
.scheme-dark .poster-${name} .${p}-logo svg ... { fill: #FCD228; }
.scheme-minimal .poster-${name} .${p}-tag { border: 2px solid var(--p-border); }
*/
`;
}

function generateExampleConfig(templateName) {
  return JSON.stringify({
    posters: [
      {
        template: templateName,
        scheme: 'dark',
        size: 'a4',
        content: { title: 'HELLO\nWORLD', subtitle: '// subtitle' },
        outputs: [
          { format: 'html', path: 'output/example.html' },
          { format: 'png', path: 'output/example.png' },
        ],
      },
    ],
  }, null, 2) + '\n';
}

function generateReadme(projectName, templateName) {
  const tplRow = templateName
    ? `| \`${templateName}\` | Starter template | Brand campaigns, social sharing |`
    : `| \`my-template\` | — | — |`;

  return `# ${projectName}

Poster templates powered by [js-vi-system](https://github.com/imjszhang/js-vi-system).

## Quick Start

\`\`\`bash
npm install

# Single poster
npm run poster -- --template ${templateName || 'my-template'} -s dark -f html -o output/test.html

# Auto-fit title font size + balanced line wrapping
npm run poster -- --template ${templateName || 'my-template'} --auto-fit --balanced -f png -o output/poster.png

# Batch generation
npm run poster -- --config configs/example.json

# Poster gallery (live preview)
npm run gallery
\`\`\`

## Templates

| Template | Style | Best For |
|----------|-------|----------|
${tplRow}

## Adding a New Template

\`\`\`bash
js-vi init --template new-template-name
\`\`\`

Or manually create \`templates/<name>/\` with three files: \`meta.json\`, \`render.js\`, \`styles.css\`.

See [specs/template-authoring.md](specs/template-authoring.md) for the full authoring specification.

## Design System

- **Colors**: Yellow \`#FCD228\` / Black \`#000000\` / White \`#FFFFFF\`
- **Fonts**: Space Grotesk (body) + JetBrains Mono (code/tags)
- **Style**: Neo-Brutalism — hard borders, hard shadows, no rounded corners, 50px grid

## License

MIT
`;
}

function generateTemplateAuthoringSpec() {
  return `# Template Authoring Specification

Rules for creating poster templates in this project. Every template **must** follow these conventions.

## File Structure

Each template is a directory under \`templates/\` containing exactly 3 files:

\`\`\`
templates/
├── _shared/
│   └── logo.js          # Project logo (replace with your own)
└── <template-name>/
    ├── meta.json         # Field schema, sizes, schemes, animation config
    ├── render.js         # ESM module exporting render(content, options)
    └── styles.css        # All CSS for this template + scheme overrides
\`\`\`

Naming: directory name = template name, lowercase with hyphens (e.g. \`term-define\`).

Directories starting with \`_\` (like \`_shared/\`) are ignored by the template scanner.

## CSS Class Prefix

Every template must use a **2-3 letter prefix** derived from its name to avoid CSS collisions:

| Template | Prefix |
|----------|--------|
| \`evolution-hero\` | \`eh-\` |
| \`dao-verse\` | \`dv-\` |
| \`my-template\` | \`mt-\` |

The root element class stays \`.poster-<template-name>\` (required by the engine). All internal elements use the short prefix.

## meta.json

\`\`\`json
{
  "name": "<template-name>",
  "label": "Human Readable Label",
  "fields": [
    { "key": "title", "type": "text", "required": true, "default": "HELLO\\nWORLD" },
    { "key": "subtitle", "type": "string", "default": "// subtitle" }
  ],
  "sizes": ["a4", "square", "banner", "story", "wechat-cover", "wechat-thumb"],
  "schemes": ["daylight", "dark", "minimal"],
  "animation": {
    "supported": true,
    "duration": 3000,
    "defaultFps": 10,
    "description": "Brief description of animation behavior"
  },
  "textLayout": {
    "title": {
      "font": "700 48px Space Grotesk",
      "lineHeight": 52.8,
      "maxWidth": 515,
      "maxHeight": 400,
      "transform": "uppercase",
      "sizeOverrides": {
        "banner": { "font": "700 32px Space Grotesk", "lineHeight": 35.2, "maxWidth": 592, "maxHeight": 180 }
      }
    }
  }
}
\`\`\`

### Fields

| Field | Type | Description |
|-------|------|-------------|
| \`name\` | string | Must exactly match directory name |
| \`label\` | string | Display name |
| \`fields\` | array | Editable field definitions |
| \`fields[].key\` | string | Field key, maps to \`content\` object property |
| \`fields[].type\` | string | \`"text"\` (multiline) or \`"string"\` (single line) |
| \`fields[].required\` | boolean | Whether the field is required |
| \`fields[].default\` | string | Default value; use \`\\n\` for line breaks in \`text\` fields |
| \`sizes\` | array | Supported sizes: \`a4\` / \`square\` / \`banner\` / \`story\` / \`wechat-cover\` / \`wechat-thumb\` |
| \`schemes\` | array | Color schemes: \`daylight\` / \`dark\` / \`minimal\` |
| \`animation\` | object | Optional GIF animation config |
| \`textLayout\` | object | Optional text layout constraints for \`measure\`/\`typeset\`/\`lint\`/\`--auto-fit\`/\`--balanced\` |

### textLayout

Keys must match \`fields[].key\`. Provides constraints for the Pretext text engine.

| Property | Type | Description |
|----------|------|-------------|
| \`font\` | string | CSS font shorthand, e.g. \`"700 48px Space Grotesk"\` |
| \`lineHeight\` | number | Line height in px (fontSize × ratio, e.g. 48 × 1.1 = 52.8) |
| \`maxWidth\` | number | Max text width in px (canvas width − padding×2) |
| \`maxHeight\` | number | Max text height in px |
| \`transform\` | string | Optional: \`"uppercase"\` or \`"lowercase"\` |
| \`sizeOverrides\` | object | Per-size constraint overrides |

## render.js

### Boilerplate

\`\`\`javascript
import { PROJECT_LOGO_SVG } from '../_shared/logo.js';
import { esc } from 'js-vi-system/templates/_shared/utils.js';

const ANIM_STYLES = \\\`
@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.anim-title  { animation: slideUp 0.8s ease-out both; animation-delay: 0.2s; }
.anim-footer { animation: fadeIn 0.4s ease-out both; animation-delay: 1.0s; }
\\\`;

export function render(content, options = {}) {
  const c = content;
  const animated = options.animated || false;
  const a = (cls) => animated ? \\\` \\\${cls}\\\` : '';

  return \\\`
    \\\${animated ? \\\`<style>\\\${ANIM_STYLES}</style>\\\` : ''}
    <div class="poster poster-<name>" style="width:100%;height:100%">
      <!-- body content -->
      <!-- footer -->
    </div>\\\`;
}
\`\`\`

### Rules

1. **Pure function** — no Node APIs (\`fs\`, \`path\`), must run in both browser and Node
2. **HTML fragment** — return a fragment, not a full document; the wrapper adds \`<html>\`/\`<head>\`
3. **Escape** — always \`esc()\` user input to prevent XSS
4. **CSS variables** — use scheme variables, never hardcode colors
5. **Root element** — must have \`class="poster poster-<name>"\` and \`style="width:100%;height:100%"\`
6. **Animation** — inject \`ANIM_STYLES\` only when \`options.animated\` is true

### Animation Conventions

- \`slideUp\` (translateY + opacity) for primary content entrance
- \`fadeIn\` (opacity only) for secondary elements and footer
- Timing: \`ease-out\`, duration 0.4–0.9s
- Stagger delays starting at 0.2s, incrementing by 0.2–0.3s
- Footer always animates last
- Total duration should match \`meta.json\` \`animation.duration\`

## styles.css

### Root Selector

\`\`\`css
.poster-<template-name> {
  display: flex;
  flex-direction: column;
  background-color: var(--p-bg);
  color: var(--p-text);
  font-family: 'Space Grotesk', sans-serif;
  padding: 40px;
}
\`\`\`

### Available CSS Variables (consumed, never defined)

| Variable | Purpose |
|----------|---------|
| \`--p-bg\` | Background color |
| \`--p-text\` | Primary text color |
| \`--p-accent\` | Accent color |
| \`--p-surface\` | Elevated surface background |
| \`--p-border\` | Border / divider color |
| \`--p-shadow\` | Hard shadow color |
| \`--p-muted\` | Secondary text |
| \`--p-grid-line\` | Background grid line color |
| \`--p-tag-bg\` | Tag/badge background |
| \`--p-tag-text\` | Tag/badge text |

### Text Layout CSS Variables

| Variable | Source | Description |
|----------|--------|-------------|
| \`--auto-title-size\` | \`--auto-fit\` / \`--target-lines\` | Auto-computed font size |
| \`--balanced-title-width\` | \`--balanced\` | Balanced line max-width |

\`\`\`css
.xx-title {
  font-size: var(--auto-title-size, 48px);
  max-width: var(--balanced-title-width, none);
}
\`\`\`

### Design Tokens

**Fonts:**
- \`'Space Grotesk', sans-serif\` — titles, body, descriptions
- \`'JetBrains Mono', monospace\` — tags, badges, code text, footer brand

**Shadows (hard, no blur):**
- Small: \`4px 4px 0px 0px var(--p-shadow)\`
- Large: \`6px 6px 0px 0px var(--p-shadow)\`

**Borders:**
- Content accent: \`border-left: 4px solid var(--p-border)\`
- Cards: \`border: 3px solid var(--p-border)\`
- Footer divider: \`border-top: 8px solid var(--p-border)\` (standard) or \`3px\` (compact)

**Corners:** No \`border-radius\` except logo container (\`border-radius: 50%\`).

### Footer Pattern

\`\`\`css
.xx-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 8px solid var(--p-border);
  padding-top: 16px;
}

.xx-logo {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.xx-brand {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
\`\`\`

### Scheme Overrides

Place at the bottom of \`styles.css\` under \`/* ── Scheme overrides ── */\`.

Selector pattern: \`.scheme-<scheme> .poster-<template-name> .xx-element\`

**dark scheme** — typical overrides:
- Logo SVG class fills/strokes
- Accent elements → \`#FCD228\`
- Surface backgrounds → \`#111\`
- Shadows → \`#FCD228\`

**minimal scheme** — lighter touch:
- Black borders on white, gray shadows (\`#ccc\`)

**daylight scheme** — relies on \`--p-*\` variables, rarely needs overrides.

## \`_shared/logo.js\`

The generated \`templates/_shared/logo.js\` re-exports the default JS VI logo. Replace it with your project's own SVG:

\`\`\`javascript
export const PROJECT_LOGO_SVG = \\\`<svg ...>...</svg>\\\`;
\`\`\`

All templates import \`PROJECT_LOGO_SVG\` from this file, so changing it updates every template at once.

## Available Sizes

| Key | Width | Height | Description |
|-----|-------|--------|-------------|
| \`a4\` | 595px | 842px | A4 portrait |
| \`square\` | 640px | 640px | Square |
| \`banner\` | 640px | 360px | 16:9 landscape |
| \`story\` | 420px | 748px | 9:16 portrait |
| \`wechat-cover\` | 900px | 383px | WeChat article cover (2.35:1) |
| \`wechat-thumb\` | 500px | 500px | WeChat secondary cover |

## Checklist

After creating a template:

1. **Test render** — \`npm run poster -- --template <name> -s dark -f html -o output/test.html\`
2. **Add to configs** — create or update a config JSON in \`configs/\`
3. **Update README.md** — add a row to the Templates table
4. **Batch test** — \`npm run poster -- --config configs/example.json\`
`;
}

// ── Command Registration ──────────────────────────────────────────────

function scaffoldTemplate(targetDir, templateName) {
  const tplDir = join(targetDir, 'templates', templateName);

  if (existsSync(join(tplDir, 'meta.json'))) {
    console.error(pc.red(`Error: templates/${templateName}/meta.json already exists. Aborting.`));
    process.exit(1);
  }

  writeFile(join(tplDir, 'meta.json'), generateMetaJSON(templateName));
  writeFile(join(tplDir, 'render.js'), generateRenderJS(templateName));
  writeFile(join(tplDir, 'styles.css'), generateStylesCSS(templateName));

  const sharedLogo = join(targetDir, 'templates', '_shared', 'logo.js');
  if (!existsSync(sharedLogo)) {
    writeFile(sharedLogo, generateSharedLogoJS());
  }
}

export function registerInitCommand(program) {
  program
    .command('init [directory]')
    .description('Scaffold a new template plugin repository, or add a template to an existing one')
    .option('-t, --template <name>', 'Create a template skeleton')
    .option('--vi-system-path <path>', 'Path to js-vi-system (auto-detected by default)')
    .action((directory, opts) => {
      const targetDir = resolve(directory || '.');
      const pkgPath = join(targetDir, 'package.json');
      const isExisting = existsSync(pkgPath);

      if (isExisting && opts.template) {
        scaffoldTemplate(targetDir, opts.template);

        console.log('');
        console.log(pc.bold('Template added! Next steps:'));
        console.log('');
        console.log(`  npm run poster -- --template ${opts.template} -f html -o output/test.html`);
        console.log('');
        return;
      }

      if (isExisting) {
        console.error(pc.red(`Error: ${relative(process.cwd(), pkgPath)} already exists.`));
        console.error(pc.dim('  Tip: use -t <name> to add a template to an existing project.'));
        process.exit(1);
      }

      // Full project scaffold
      writeFile(pkgPath, generatePackageJSON(targetDir));
      writeFile(join(targetDir, '.gitignore'), generateGitignore());

      const projectName = basename(resolve(targetDir));
      const templateName = opts.template || 'my-template';

      writeFile(join(targetDir, 'README.md'), generateReadme(projectName, opts.template || null));
      writeFile(join(targetDir, 'configs', 'example.json'), generateExampleConfig(templateName));
      writeFile(join(targetDir, 'specs', 'template-authoring.md'), generateTemplateAuthoringSpec());
      writeFile(join(targetDir, 'templates', '_shared', 'logo.js'), generateSharedLogoJS());

      if (opts.template) {
        scaffoldTemplate(targetDir, opts.template);
      }

      console.log('');
      console.log(pc.bold('Done! Next steps:'));
      console.log('');
      if (directory) {
        console.log(`  cd ${directory}`);
      }
      console.log('  npm install');
      if (opts.template) {
        console.log(`  npm run poster -- --template ${opts.template} -f html -o output/test.html`);
      } else {
        console.log('  js-vi init --template <name>   # create your first template');
      }
      console.log('');
    });
}
