/**
 * Reads tokens/*.json and generates:
 *   - css/tokens.css   (CSS custom properties)
 *   - css/tailwind-preset.js (Tailwind CSS preset)
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const load = (name) => JSON.parse(readFileSync(join(root, 'tokens', name), 'utf-8'));

const colors = load('colors.json');
const typography = load('typography.json');
const shadows = load('shadows.json');
const borders = load('borders.json');
const spacing = load('spacing.json');
const animation = load('animation.json');
const grid = load('grid.json');

// ─── Generate css/tokens.css ────────────────────────────────────────

function generateTokensCSS() {
  const lines = [
    '/* Auto-generated from tokens/*.json — do not edit manually */',
    '/* Run `npm run build` to regenerate */',
    '',
    ':root {',
    '  /* Colors — Brand */',
    `  --js-color-brand-yellow: ${colors.brand.yellow.value};`,
    `  --js-color-brand-black: ${colors.brand.black.value};`,
    `  --js-color-brand-white: ${colors.brand.white.value};`,
    '',
    '  /* Colors — Logo */',
    `  --js-color-logo-fill: ${colors.logo.fill.value};`,
    '',
    '  /* Colors — UI (dark contexts) */',
    `  --js-color-dark-surface: ${colors.ui['dark-surface']};`,
    `  --js-color-dark-surface-alt: ${colors.ui['dark-surface-alt']};`,
    `  --js-color-muted: ${colors.ui.muted};`,
    '',
    '  /* Typography */',
    `  --js-font-sans: ${typography.fontFamily.sans.value.map(f => f.includes(' ') ? `'${f}'` : f).join(', ')};`,
    `  --js-font-mono: ${typography.fontFamily.mono.value.map(f => f.includes(' ') ? `'${f}'` : f).join(', ')};`,
    '',
    '  /* Shadows */',
    `  --js-shadow-brutal: ${shadows.brutal.value};`,
    `  --js-shadow-brutal-lg: ${shadows['brutal-lg'].value};`,
    `  --js-shadow-brutal-hover: ${shadows['brutal-hover'].value};`,
    `  --js-shadow-brutal-card: ${shadows['brutal-card'].value};`,
    `  --js-shadow-brutal-card-hover: ${shadows['brutal-card-hover'].value};`,
    `  --js-shadow-brutal-white: ${shadows['brutal-white'].value};`,
    '',
    '  /* Borders */',
    `  --js-border-width: ${borders.width.default.value};`,
    `  --js-border-width-thin: ${borders.width.thin.value};`,
    `  --js-border-width-thick: ${borders.width.thick.value};`,
    `  --js-border-width-hero: ${borders.width.hero.value};`,
    `  --js-border-color: ${borders.color.default};`,
    '',
    '  /* Spacing */',
    `  --js-spacing-base: ${spacing.base};`,
    `  --js-layout-max-width: ${spacing.layout['page-max-width']};`,
    `  --js-layout-section-gap: ${spacing.layout['section-gap']};`,
    '',
    '  /* Grid */',
    `  --js-grid-size: ${grid.grid.size};`,
    `  --js-grid-line-color: ${grid.grid.lineColor};`,
    '',
    '  /* Animation */',
    `  --js-transition-fast: ${animation.transition.fast};`,
    `  --js-transition-default: ${animation.transition.default};`,
    '}',
    '',
  ];

  return lines.join('\n');
}

// ─── Generate css/tailwind-preset.js ────────────────────────────────

function generateTailwindPreset() {
  const keyframesObj = {};
  for (const [name, frames] of Object.entries(animation.keyframes)) {
    keyframesObj[name] = frames;
  }

  const animationObj = {};
  for (const [name, def] of Object.entries(animation.animation)) {
    animationObj[name] = def.value;
  }

  const preset = {
    theme: {
      extend: {
        fontFamily: {
          sans: typography.fontFamily.sans.value,
          mono: typography.fontFamily.mono.value,
        },
        colors: {
          brand: {
            yellow: colors.brand.yellow.value,
            black: colors.brand.black.value,
            white: colors.brand.white.value,
          },
        },
        boxShadow: {
          brutal: shadows.brutal.value,
          'brutal-lg': shadows['brutal-lg'].value,
          'brutal-hover': shadows['brutal-hover'].value,
          'brutal-white': shadows['brutal-white'].value,
        },
        borderWidth: {
          3: borders.width.default.value,
        },
        animation: animationObj,
        keyframes: keyframesObj,
      },
    },
  };

  const code = [
    '// Auto-generated from tokens/*.json — do not edit manually',
    '// Run `npm run build` to regenerate',
    '',
    `export default ${JSON.stringify(preset, null, 2)};`,
    '',
  ];

  return code.join('\n');
}

// ─── Write files ────────────────────────────────────────────────────

writeFileSync(join(root, 'css', 'tokens.css'), generateTokensCSS(), 'utf-8');
console.log('✓ css/tokens.css');

writeFileSync(join(root, 'css', 'tailwind-preset.js'), generateTailwindPreset(), 'utf-8');
console.log('✓ css/tailwind-preset.js');

console.log('\nBuild complete.');
