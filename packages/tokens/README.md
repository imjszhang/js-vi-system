# @js-vi/tokens

**JS Visual Identity System** — Neo-Brutalism design tokens, CSS custom properties, and Tailwind CSS preset.

Zero dependencies. Framework-agnostic.

## Install

```bash
npm install @js-vi/tokens
```

## Usage

### Tailwind CSS Preset

```js
// tailwind.config.js
import jsViPreset from '@js-vi/tokens'

export default {
  presets: [jsViPreset],
  content: ['./src/**/*.{html,js,tsx}'],
}
```

### CSS Custom Properties

```css
@import '@js-vi/tokens/css/tokens.css';
@import '@js-vi/tokens/css/brutal.css';
```

```html
<div class="brutal-card">
  <h1 style="color: var(--js-color-brand-yellow)">Hello</h1>
</div>
```

### Programmatic Access (JS)

```js
import { colors, typography, spacing } from '@js-vi/tokens/tokens'

console.log(colors.brand.yellow.value)  // "#FCD228"
console.log(typography.fontFamily.sans)  // { value: ["Space Grotesk", "sans-serif"] }
```

## Design Tokens

| Token | Value |
|-------|-------|
| Brand Yellow | `#FCD228` |
| Brand Black | `#000000` |
| Brand White | `#FFFFFF` |
| Font Sans | Space Grotesk |
| Font Mono | JetBrains Mono |
| Shadow Brutal | `4px 4px 0px 0px #000000` |
| Border Width | `3px` |

## Exports

| Subpath | Description |
|---------|-------------|
| `@js-vi/tokens` | Tailwind CSS preset (default) |
| `@js-vi/tokens/tokens` | Raw design tokens as JS objects |
| `@js-vi/tokens/css/tokens.css` | CSS custom properties |
| `@js-vi/tokens/css/brutal.css` | Brutal component styles |
| `@js-vi/tokens/tailwind-preset` | Tailwind CSS preset (explicit) |

## License

MIT
