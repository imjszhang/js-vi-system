# JS Visual Identity System

The single source of truth for the **JS** brand — design tokens, component styles, and brand guidelines built on **Neo-Brutalism + Cyberpunk** aesthetics.

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

## Structure

```
tokens/          Design tokens (JSON) — the single source of truth
css/             Generated outputs: tokens.css, brutal.css, tailwind-preset.js
assets/          Logo SVG, font references
brand/           Brand philosophy, identity, design principles
character/       Cyber-Taoist character specification
voice/           Tone, style, and language guidelines
preview/         Interactive brand manual (open index.html)
build/           Token → CSS/JS generation script
```

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
