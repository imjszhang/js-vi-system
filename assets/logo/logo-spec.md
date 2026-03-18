# JS Logo Specification

## Structure

- **Shape**: Circle
- **ViewBox**: `0 0 108 108`
- **Background**: `#FCD228` (JS Yellow) filled circle, `r=51.84`
- **Stroke**: `#000000`, width `3.24px`
- **Inner glyph**: `#37342F` — hand-traced JS letterform path, `fill-rule: evenodd`

## Visual Description

Yellow circle with black stroke, containing a stylized "JS" character in dark brown-black. The glyph includes the J descender curving left and the S flowing through the right half, with a smile-like arc at the bottom connecting both.

## Sizes

| Context | Minimum Size | Recommended |
|---------|-------------|-------------|
| Favicon | 16x16 | 32x32 |
| Navigation | 36x36 | 48x48 |
| Card icon | 48x48 | 64x64 |
| Hero / standalone | 96x96 | 108x108+ |

## Safe Zone

Maintain a clear space of at least **12px** (≈11% of viewBox) on all sides. No text, borders, or other elements should intrude into this zone.

```
    ┌──────────────────────┐
    │     safe zone        │
    │   ┌──────────────┐   │
    │   │              │   │
    │   │   JS LOGO    │   │
    │   │              │   │
    │   └──────────────┘   │
    │                      │
    └──────────────────────┘
```

## Shadow (when applied)

- **Default**: `3px 3px 0px 0px #000000` — used on nav/cards
- **Hover**: `shadow: none` + `translate(1px, 1px)` — pressed-in effect

## Prohibited Usage

- Do NOT add rounded corners (the circle IS the shape)
- Do NOT apply gradients to the background or glyph
- Do NOT change the yellow (`#FCD228`) or glyph color (`#37342F`)
- Do NOT add soft/blur shadows — only hard offset shadows
- Do NOT stretch or skew — always use `preserveAspectRatio="xMidYMid meet"`
- Do NOT place the logo on a yellow background without the black stroke border

## File Variants

| File | Description |
|------|-------------|
| `logo.svg` | Primary full-color logo |
