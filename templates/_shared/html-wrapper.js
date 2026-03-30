import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { SIZES } from './sizes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function readCSS(relativePath) {
  return readFileSync(join(__dirname, relativePath), 'utf-8');
}

export function wrapHTML(fragment, { scheme = 'dark', size = 'a4', templateName = '', templateDir = '', cssVars = {}, overrideWidth } = {}) {
  const dim = SIZES[size] || SIZES.a4;
  const width = overrideWidth || dim.w;

  const schemesCSS = readCSS('schemes.css');
  const baseCSS = readCSS('base.css');

  let templateCSS = '';
  if (templateDir) {
    try {
      templateCSS = readFileSync(join(templateDir, 'styles.css'), 'utf-8');
    } catch (_) { /* template may not have styles */ }
  } else if (templateName) {
    try {
      templateCSS = readCSS(join('..', templateName, 'styles.css'));
    } catch (_) { /* template may not have styles */ }
  }

  const varEntries = Object.entries(cssVars)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
  const varStyle = varEntries ? `;${varEntries}` : '';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JS Poster — ${templateName || 'untitled'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700;800&display=swap" rel="stylesheet">
  <style>
* { margin: 0; padding: 0; box-sizing: border-box; }
${schemesCSS}
${baseCSS}
${templateCSS}
  </style>
</head>
<body style="margin:0;padding:0">
  <div class="scheme-${scheme}" style="width:${width}px;height:${dim.h}px${varStyle}">
    ${fragment}
  </div>
</body>
</html>`;
}
