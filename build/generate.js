/**
 * Reads tokens/*.json and generates:
 *   - css/tokens.css   (CSS custom properties)
 *   - css/tailwind-preset.js (Tailwind CSS preset)
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
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

// ─── Generate preview/posters.html ───────────────────────────────────

function generatePostersHTML() {
  const templatesDir = join(root, 'templates');
  const sharedDir = join(templatesDir, '_shared');

  // --- Read and inline CSS from template source files ---
  const schemesCSS = readFileSync(join(sharedDir, 'schemes.css'), 'utf-8');
  const baseCSS = readFileSync(join(sharedDir, 'base.css'), 'utf-8');

  // --- Read and transform shared JS (strip `export` keyword) ---
  function stripExports(code) {
    return code.replace(/^export\s+/gm, '');
  }

  const logoJS = stripExports(readFileSync(join(sharedDir, 'logo.js'), 'utf-8')).trim();
  const sizesJS = stripExports(readFileSync(join(sharedDir, 'sizes.js'), 'utf-8')).trim();
  const utilsJS = stripExports(readFileSync(join(sharedDir, 'utils.js'), 'utf-8')).trim();

  // --- Auto-discover templates ---
  const templateNames = readdirSync(templatesDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('_'))
    .map(d => d.name)
    .filter(name => existsSync(join(templatesDir, name, 'meta.json')));

  // --- Read template CSS ---
  const templateCSSParts = [];
  for (const name of templateNames) {
    const cssPath = join(templatesDir, name, 'styles.css');
    if (existsSync(cssPath)) {
      templateCSSParts.push(readFileSync(cssPath, 'utf-8'));
    }
  }

  // --- Read and transform render functions ---
  function transformRender(code, funcName) {
    code = code.replace(/^import\s+.*?;\s*$/gm, '');
    code = code.replace(/export\s+function\s+render\s*\(/, `function ${funcName}(`);
    // Rename module-level constants to avoid duplicates across templates
    code = code.replace(/\bANIM_STYLES\b/g, `ANIM_STYLES_${funcName}`);
    return code.trim();
  }

  function toFuncName(name) {
    return 'render' + name.replace(/(^|-)([a-z])/g, (_, _p, c) => c.toUpperCase());
  }

  const renderBlocks = [];
  const templatesMapEntries = [];
  const fieldMapEntries = [];
  const typeButtonsHTML = [];

  for (let i = 0; i < templateNames.length; i++) {
    const name = templateNames[i];
    const funcName = toFuncName(name);
    const meta = JSON.parse(readFileSync(join(templatesDir, name, 'meta.json'), 'utf-8'));
    const renderCode = readFileSync(join(templatesDir, name, 'render.js'), 'utf-8');

    renderBlocks.push(transformRender(renderCode, funcName));
    templatesMapEntries.push(`'${name}': ${funcName}`);

    const keys = meta.fields.map(f => "'" + f.key + "'").join(', ');
    fieldMapEntries.push(`        '${name}': [${keys}]`);

    const active = i === 0 ? ' active' : '';
    const label = meta.label.toUpperCase();
    typeButtonsHTML.push(
      `                    <button class="ctrl-btn${active}" data-type="${name}" onclick="setType('${name}')">${label}</button>`
    );
  }

  const firstTemplate = templateNames[0] || 'terminal';

  return `<!-- Auto-generated by build/generate.js — do not edit manually -->
<!-- Run \`npm run build\` to regenerate from templates/ source files -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JS Poster System — Visual Identity</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700;800&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Space Grotesk', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                    },
                    colors: {
                        brand: { yellow: '#FCD228', black: '#000000', white: '#FFFFFF' }
                    },
                    boxShadow: {
                        'brutal': '4px 4px 0px 0px #000000',
                        'brutal-lg': '8px 8px 0px 0px #000000',
                        'brutal-hover': '2px 2px 0px 0px #000000',
                        'brutal-white': '4px 4px 0px 0px #FFFFFF',
                    },
                    borderWidth: { '3': '3px' },
                }
            }
        }
    <\/script>
    <style>
        body {
            background-color: #111;
            background-image: none;
            color: #fff;
        }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #FCD228; border: 2px solid #111; }

        .ctrl-group { margin-bottom: 20px; }
        .ctrl-label {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.1em;
            color: #FCD228; margin-bottom: 6px; display: block;
        }
        .ctrl-btn {
            background: transparent; color: #888;
            border: 2px solid #333; padding: 6px 12px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px; font-weight: 700;
            text-transform: uppercase; cursor: pointer; transition: all 0.1s;
        }
        .ctrl-btn:hover { border-color: #FCD228; color: #FCD228; }
        .ctrl-btn.active { background: #FCD228; color: #000; border-color: #FCD228; }
        .ctrl-input {
            width: 100%; background: #1a1a1a;
            border: 2px solid #333; color: #fff;
            padding: 8px 10px; font-family: 'Space Grotesk', sans-serif;
            font-size: 13px; outline: none; transition: border-color 0.1s;
        }
        .ctrl-input:focus { border-color: #FCD228; }
        .ctrl-textarea {
            width: 100%; background: #1a1a1a;
            border: 2px solid #333; color: #fff;
            padding: 8px 10px; font-family: 'Space Grotesk', sans-serif;
            font-size: 13px; outline: none; resize: vertical;
            min-height: 60px; transition: border-color 0.1s;
        }
        .ctrl-textarea:focus { border-color: #FCD228; }
        .poster-stage {
            display: flex; align-items: center; justify-content: center;
            flex: 1; min-height: 0; padding: 32px; overflow: hidden;
        }
        .poster-frame {
            transform-origin: center center;
            transition: width 0.3s, height 0.3s; flex-shrink: 0;
        }
        .sidebar::-webkit-scrollbar { width: 6px; }
        .sidebar::-webkit-scrollbar-track { background: #111; }
        .sidebar::-webkit-scrollbar-thumb { background: #333; }

/* ═══ Template CSS (auto-inlined from templates/) ═══ */
${schemesCSS}
${baseCSS}
${templateCSSParts.join('\n')}
    </style>
</head>
<body class="h-screen flex flex-col overflow-hidden font-sans">

    <nav class="flex-shrink-0 bg-black border-b-3 border-[#FCD228] px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-4">
            <a href="index.html" class="font-mono text-xs font-bold text-[#888] hover:text-[#FCD228] transition-colors">&larr; BRAND MANUAL</a>
            <span class="text-[#333]">|</span>
            <span class="font-bold text-lg tracking-tight uppercase">JS POSTER SYSTEM</span>
        </div>
        <div class="flex items-center gap-3">
            <span class="font-mono text-[10px] text-[#555]">v1.1</span>
            <div class="w-8 h-8 rounded-full shadow-[2px_2px_0px_0px_rgba(252,210,40,0.3)]" id="nav-logo"></div>
        </div>
    </nav>

    <div class="flex flex-1 min-h-0">
        <aside class="sidebar w-[300px] flex-shrink-0 bg-[#0a0a0a] border-r-3 border-[#222] overflow-y-auto p-5">
            <div class="ctrl-group">
                <span class="ctrl-label">// poster type</span>
                <div class="flex flex-wrap gap-1">
${typeButtonsHTML.join('\n')}
                </div>
            </div>
            <div class="ctrl-group">
                <span class="ctrl-label">// color scheme</span>
                <div class="flex gap-1">
                    <button class="ctrl-btn" data-scheme="daylight" onclick="setScheme('daylight')"><span style="color:#FCD228">&#9632;</span> DAYLIGHT</button>
                    <button class="ctrl-btn active" data-scheme="dark" onclick="setScheme('dark')"><span style="color:#000">&#9632;</span> DARK</button>
                    <button class="ctrl-btn" data-scheme="minimal" onclick="setScheme('minimal')"><span style="color:#fff">&#9632;</span> MINIMAL</button>
                </div>
            </div>
            <div class="ctrl-group">
                <span class="ctrl-label">// size</span>
                <div class="flex flex-wrap gap-1" id="size-buttons"></div>
            </div>
            <hr class="border-[#222] my-5">
            <div class="ctrl-group"><span class="ctrl-label">// content</span></div>
            <div class="ctrl-group" id="field-tag">
                <label class="ctrl-label" style="color:#888">TAG</label>
                <input class="ctrl-input" id="input-tag" value="EVENT" oninput="updateContent()">
            </div>
            <div class="ctrl-group" id="field-title">
                <label class="ctrl-label" style="color:#888">TITLE</label>
                <textarea class="ctrl-textarea" id="input-title" oninput="updateContent()">SYSTEM\nINITIALIZED</textarea>
            </div>
            <div class="ctrl-group" id="field-subtitle">
                <label class="ctrl-label" style="color:#888">SUBTITLE</label>
                <input class="ctrl-input" id="input-subtitle" value="// Mastering AI with Eastern Philosophy" oninput="updateContent()">
            </div>
            <div class="ctrl-group" id="field-date">
                <label class="ctrl-label" style="color:#888">DATE</label>
                <input class="ctrl-input" id="input-date" value="2026.03.19" oninput="updateContent()">
            </div>
            <div class="ctrl-group" id="field-location">
                <label class="ctrl-label" style="color:#888">LOCATION</label>
                <input class="ctrl-input" id="input-location" value="CYBERSPACE" oninput="updateContent()">
            </div>
            <div class="ctrl-group" id="field-info">
                <label class="ctrl-label" style="color:#888">INFO</label>
                <input class="ctrl-input" id="input-info" value="js@cyber-taoist.com" oninput="updateContent()">
            </div>
            <div class="ctrl-group" id="field-issue">
                <label class="ctrl-label" style="color:#888">ISSUE</label>
                <input class="ctrl-input" id="input-issue" value="Vol.01" oninput="updateContent()">
            </div>
            <hr class="border-[#222] my-5">
            <div class="font-mono text-[10px] text-[#333] leading-relaxed">
                <p>ALL POSTERS FOLLOW JS VI SYSTEM RULES:</p>
                <p class="mt-1">NO GRADIENTS / NO ROUNDED CORNERS / NO SOFT SHADOWS / NO PASTEL COLORS</p>
            </div>
        </aside>
        <div class="poster-stage" id="poster-stage">
            <div class="poster-frame" id="poster-frame">
                <div class="poster" id="poster"></div>
            </div>
        </div>
    </div>

    <script>
    /* ═══ Auto-generated from templates/_shared/ ═══ */
    ${logoJS}
    ${utilsJS}
    ${sizesJS}

    // ═══ Auto-generated from templates/[name]/render.js ═══
    ${renderBlocks.join('\n\n    ')}

    var TEMPLATES = { ${templatesMapEntries.join(', ')} };

    var FIELD_MAP = {
${fieldMapEntries.join(',\n')}
    };

    /* ═══ Preview UI Logic ═══ */

    var state = {
        type: '${firstTemplate}',
        scheme: 'dark',
        size: 'a4',
        content: {
            tag: 'EVENT',
            title: 'SYSTEM\\nINITIALIZED',
            subtitle: '// Mastering AI with Eastern Philosophy',
            date: '2026.03.19',
            location: 'CYBERSPACE',
            info: 'js@cyber-taoist.com',
            issue: 'Vol.01',
        }
    };

    function updateFieldVisibility() {
        var fields = FIELD_MAP[state.type] || [];
        ['tag','title','subtitle','date','location','info','issue'].forEach(function(f) {
            var el = document.getElementById('field-' + f);
            if (el) el.style.display = fields.includes(f) ? 'block' : 'none';
        });
    }

    function setType(type) {
        state.type = type;
        document.querySelectorAll('[data-type]').forEach(function(b) { b.classList.toggle('active', b.dataset.type === type); });
        updateFieldVisibility();
        render();
    }

    function setScheme(scheme) {
        state.scheme = scheme;
        document.querySelectorAll('[data-scheme]').forEach(function(b) { b.classList.toggle('active', b.dataset.scheme === scheme); });
        render();
    }

    function setSize(size) {
        state.size = size;
        document.querySelectorAll('[data-size]').forEach(function(b) { b.classList.toggle('active', b.dataset.size === size); });
        render();
    }

    function updateContent() {
        state.content.tag = document.getElementById('input-tag').value;
        state.content.title = document.getElementById('input-title').value;
        state.content.subtitle = document.getElementById('input-subtitle').value;
        state.content.date = document.getElementById('input-date').value;
        state.content.location = document.getElementById('input-location').value;
        state.content.info = document.getElementById('input-info').value;
        state.content.issue = document.getElementById('input-issue').value;
        render();
    }

    function render() {
        var frame = document.getElementById('poster-frame');
        var poster = document.getElementById('poster');
        var dim = SIZES[state.size];
        frame.style.width = dim.w + 'px';
        frame.style.height = dim.h + 'px';
        frame.className = 'poster-frame scheme-' + state.scheme;
        poster.innerHTML = TEMPLATES[state.type](state.content, { scheme: state.scheme, size: state.size });
        scalePoster();
    }

    function scalePoster() {
        var stage = document.getElementById('poster-stage');
        var frame = document.getElementById('poster-frame');
        var dim = SIZES[state.size];
        var scaleX = (stage.clientWidth - 64) / dim.w;
        var scaleY = (stage.clientHeight - 64) / dim.h;
        frame.style.transform = 'scale(' + Math.min(scaleX, scaleY, 1) + ')';
    }

    document.getElementById('nav-logo').innerHTML = LOGO_SVG;

    (function buildSizeButtons() {
        var container = document.getElementById('size-buttons');
        Object.keys(SIZES).forEach(function(key) {
            var btn = document.createElement('button');
            btn.className = 'ctrl-btn' + (key === state.size ? ' active' : '');
            btn.setAttribute('data-size', key);
            btn.textContent = SIZES[key].label.toUpperCase();
            btn.onclick = function() { setSize(key); };
            container.appendChild(btn);
        });
    })();

    updateFieldVisibility();
    render();
    window.addEventListener('resize', scalePoster);
    <\/script>
</body>
</html>`;
}

// ─── Write files ────────────────────────────────────────────────────

writeFileSync(join(root, 'css', 'tokens.css'), generateTokensCSS(), 'utf-8');
console.log('✓ css/tokens.css');

writeFileSync(join(root, 'css', 'tailwind-preset.js'), generateTailwindPreset(), 'utf-8');
console.log('✓ css/tailwind-preset.js');

writeFileSync(join(root, 'preview', 'posters.html'), generatePostersHTML(), 'utf-8');
console.log('✓ preview/posters.html');

console.log('\nBuild complete.');
