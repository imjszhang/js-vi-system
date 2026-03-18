import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { SIZES } from './sizes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function readCSS(relativePath) {
  return readFileSync(join(__dirname, relativePath), 'utf-8');
}

export function wrapHTML(fragment, { scheme = 'dark', size = 'a4', templateName = '' } = {}) {
  const dim = SIZES[size] || SIZES.a4;

  const schemesCSS = readCSS('schemes.css');
  const baseCSS = readCSS('base.css');

  let templateCSS = '';
  if (templateName) {
    try {
      templateCSS = readCSS(join('..', templateName, 'styles.css'));
    } catch (_) { /* template may not have styles */ }
  }

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
  <div class="scheme-${scheme}" style="width:${dim.w}px;height:${dim.h}px">
    ${fragment}
  </div>
</body>
</html>`;
}
