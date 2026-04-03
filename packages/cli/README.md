# @js-vi/cli

**JS-VI Poster Generator** — render branded posters in PNG, SVG, PDF, GIF from Neo-Brutalism templates via CLI or programmatic API.

## Install

```bash
# Global install (use as CLI tool)
npm install -g @js-vi/cli

# Or project-local
npm install @js-vi/cli
```

## CLI Usage

```bash
# Generate a poster
js-vi poster --template terminal --title "Hello World" -s dark -f png -o poster.png

# List available templates
js-vi templates

# Auto-fit title font size
js-vi poster --template card --title "Long Title Text" --auto-fit -f png -o out.png

# Balanced line wrapping + shrink-wrap width
js-vi poster --template cybertaoist --title "My Title" --balanced --shrink-wrap -f html -o out.html

# Batch generation from config
js-vi poster --config posters.json

# Measure text layout
js-vi measure --template terminal --title "My Title"

# Typeset analysis across sizes
js-vi typeset --template terminal --title "My Title"

# Find best poster size
js-vi best-size --template terminal --title "My Title"

# Lint text overflow in batch config
js-vi lint --config posters.json

# Scaffold a template plugin project
js-vi init my-project --template my-template

# Build design tokens (CSS + Tailwind preset)
js-vi build

# Start poster gallery with live reload
js-vi gallery
```

## Programmatic API

```js
import { renderToHTML, listTemplates } from '@js-vi/cli/templates'

// List all available templates
const templates = listTemplates()
console.log(templates.map(t => t.name))

// Render a poster to HTML
const html = await renderToHTML('terminal', {
  title: 'HELLO\\nWORLD',
  subtitle: '// subtitle',
}, { scheme: 'dark', size: 'a4', autoFit: true })
```

## Built-in Templates

| Template | Style | Best For |
|----------|-------|----------|
| `terminal` | Terminal/hacker aesthetic | Tech talks, dev events |
| `cybertaoist` | Cyberpunk + Eastern philosophy | Brand campaigns |
| `card` | Clean card layout | Social media sharing |
| `wechat-cover` | WeChat article cover | WeChat Official Accounts |

## Output Formats

| Format | Extension | Requires |
|--------|-----------|----------|
| HTML | `.html` | — |
| PNG | `.png` | Playwright |
| JPEG | `.jpg` | Playwright |
| SVG | `.svg` | Playwright |
| PDF | `.pdf` | Playwright |
| GIF | `.gif` | Playwright |

## License

MIT
