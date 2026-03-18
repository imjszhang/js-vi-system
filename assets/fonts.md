# Font References

## Primary Fonts

### Space Grotesk (Sans-serif)

**Role**: Headlines, body text, UI labels — geometric modern aesthetic.

**Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

**Google Fonts CDN**:

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

**CSS `@import`**:

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
```

### JetBrains Mono (Monospace)

**Role**: Code blocks, terminal output, tags, technical labels — engineering precision.

**Weights**: 400 (Regular), 700 (Bold), 800 (ExtraBold)

**Google Fonts CDN**:

```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap" rel="stylesheet">
```

**CSS `@import`**:

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');
```

## Combined Import (Recommended)

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700;800&display=swap" rel="stylesheet">
```

## CSS Usage

```css
font-family: 'Space Grotesk', sans-serif;  /* headings, body */
font-family: 'JetBrains Mono', monospace;  /* code, tags, terminal */
```

## Tailwind Config

Already included in `css/tailwind-preset.js`:

```js
fontFamily: {
  sans: ['Space Grotesk', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}
```

## Self-hosting

For production, consider downloading from [Google Fonts](https://fonts.google.com/) and self-hosting via `@font-face` declarations to eliminate third-party requests.
