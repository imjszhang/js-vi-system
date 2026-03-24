# JS Visual Identity System

The single source of truth for the **JS** brand — design tokens, component styles, and brand guidelines built on **Neo-Brutalism + Cyberpunk** aesthetics. It also ships a **CLI poster generator** (templates → HTML/PNG/PDF/GIF, etc.).

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## Quick Start

```bash
# Use the Tailwind preset in your project
npm install js-vi-system
```

```js
// tailwind.config.js
import jsViSystem from 'js-vi-system'

export default {
  presets: [jsViSystem],
  // your overrides...
}
```

Or use the standalone CSS:

```html
<link rel="stylesheet" href="js-vi-system/css/tokens.css">
<link rel="stylesheet" href="js-vi-system/css/brutal.css">
```

After `npm install` in a clone of this repo, you can run:

```bash
npm run poster -- --help          # or: npx js-vi poster --help
node bin/js-vi.js templates       # list poster templates
```

The package exports `js-vi-system/templates` (template engine) and `js-vi-system/templates/_shared/*` for shared template assets.

## Structure

```
tokens/          Design tokens (JSON) — the single source of truth
css/             Generated outputs: tokens.css, brutal.css, tailwind-preset.js
assets/          Logo SVG, font references
brand/           Brand philosophy, identity, design principles
character/       Cyber-Taoist character specification
voice/           Tone, style, and language guidelines
preview/         Interactive brand manual (index.html) and poster gallery (posters.html)
build/           Token → CSS/JS generation script
bin/             CLI entry (js-vi)
cli/             Commander commands (poster, templates, build, init)
core/            Template engine, renderer wiring, config
templates/       Poster templates (e.g. terminal, card, cybertaoist, wechat-cover)
renderers/       HTML, image, PDF, SVG, GIF output adapters
```

## Create a Template Plugin

Use `js-vi init` to scaffold an external template plugin repository:

```bash
npx js-vi init my-posters --template event-poster
cd my-posters
npm install
npm run poster -- --template event-poster -f html -o output/test.html
```

This generates a ready-to-use repo with `package.json` (auto-linked to js-vi-system), `.gitignore`, a sample batch config, and a working template skeleton. See [templates/CREATING_TEMPLATES.md](templates/CREATING_TEMPLATES.md) for the full template authoring guide.

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

### Prohibited

Gradients, rounded corners, soft shadows, pastel colors, decorative elements.

## Build

```bash
# Regenerate CSS and Tailwind preset from token JSON files
npm run build

# Preview the brand manual
npm run preview
```

## License

MIT
