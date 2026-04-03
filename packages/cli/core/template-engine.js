import { readFileSync, readdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { wrapHTML } from '../templates/_shared/html-wrapper.js';
import { SIZES } from '../templates/_shared/sizes.js';
import { fitFontSize, balanceText, shrinkWrapWidth, fitToLines, measureText } from './text-measure.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const builtinTemplatesDir = join(__dirname, '..', 'templates');

let extraTemplatesDirs = [];

export function setExtraTemplatesDirs(dirs) {
  extraTemplatesDirs = dirs;
}

function getTemplateDirs() {
  return [builtinTemplatesDir, ...extraTemplatesDirs];
}

export function listTemplates() {
  const templates = [];

  for (const dir of getTemplateDirs()) {
    if (!existsSync(dir)) continue;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
      const metaPath = join(dir, entry.name, 'meta.json');
      if (!existsSync(metaPath)) continue;
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
      meta._dir = join(dir, entry.name);
      templates.push(meta);
    }
  }

  return templates;
}

export function findTemplate(name) {
  const all = listTemplates();
  return all.find(t => t.name === name) || null;
}

export async function loadTemplate(name) {
  const meta = findTemplate(name);
  if (!meta) throw new Error(`Template not found: ${name}`);
  const renderPath = join(meta._dir, 'render.js');
  const mod = await import('file:///' + renderPath.replace(/\\/g, '/'));
  return { meta, render: mod.render };
}

function measureFieldHeight(fieldName, content, textLayout, sizeKey, cssVars) {
  const constraint = textLayout?.[fieldName];
  if (!constraint) return 0;

  const text = content[fieldName];
  if (!text) return 0;

  const sizeOverride = constraint.sizeOverrides?.[sizeKey];
  let font = sizeOverride?.font || constraint.font;
  let lineHeight = sizeOverride?.lineHeight || constraint.lineHeight;
  const maxWidth = sizeOverride?.maxWidth || constraint.maxWidth;
  const transform = constraint.transform;

  if (!font || !maxWidth || !lineHeight) return 0;

  const autoVar = constraint.autoSizeVar;
  if (autoVar && cssVars[autoVar]) {
    const fontMatch = font.match(/^(\d+)\s+(\d+)px\s+(.+)$/);
    if (fontMatch) {
      const [, weight, baseSizeStr, family] = fontMatch;
      const baseSize = parseFloat(baseSizeStr);
      const ratio = lineHeight / baseSize;
      const autoSize = parseFloat(cssVars[autoVar]);
      font = `${weight} ${autoSize}px ${family}`;
      lineHeight = autoSize * ratio;
    }
  }

  const result = measureText(text, font, maxWidth, lineHeight, { transform });
  return result.height;
}

function computeSpatialVars(content, meta, sizeKey, cssVars) {
  const sl = meta.spatialLayout;
  if (!sl?.zones) return;

  const dim = SIZES[sizeKey] || SIZES.a4;
  const sizeOv = sl.sizeOverrides?.[sizeKey] || {};

  const zones = sl.zones.map(z => ({ ...z, ...(sizeOv[z.id] || {}) }));

  const heights = {};
  let fillIdx = -1;

  for (let i = 0; i < zones.length; i++) {
    const z = zones[i];
    if (z.fill) {
      fillIdx = i;
      continue;
    }
    let h = z.fixed || 0;
    for (const field of (z.measure || [])) {
      h += measureFieldHeight(field, content, meta.textLayout, sizeKey, cssVars);
    }
    heights[z.id] = h;
  }

  if (fillIdx >= 0) {
    const fillZone = zones[fillIdx];
    const margin = fillZone.margin || 0;
    const extendBehind = new Set(fillZone.extendBehind || []);
    let used = margin;
    for (const z of zones) {
      if (z.fill) continue;
      if (!extendBehind.has(z.id)) used += (heights[z.id] || 0);
    }
    heights[fillZone.id] = Math.max(0, dim.h - used);
  }

  const tops = {};
  let cursor = 0;
  for (const z of zones) {
    if (z.fill && z.margin) cursor += z.margin;
    tops[z.id] = cursor;
    cursor += (heights[z.id] || 0);
  }

  if (sl.vars) {
    for (const [varName, expr] of Object.entries(sl.vars)) {
      const [zoneId, prop] = expr.split('.');
      const val = prop === 'top' ? tops[zoneId] : prop === 'height' ? heights[zoneId] : undefined;
      if (val != null) cssVars[varName] = `${Math.round(val)}px`;
    }
  }
}

function computeCSSVars(content, meta, options) {
  const cssVars = {};
  const textLayout = meta.textLayout;
  if (!textLayout?.title) {
    computeSpatialVars(content, meta, options.size || 'a4', cssVars);
    return cssVars;
  }

  const sizeKey = options.size || 'a4';
  const titleConstraint = textLayout.title;
  const sizeOverride = titleConstraint.sizeOverrides?.[sizeKey];

  const font = sizeOverride?.font || titleConstraint.font;
  const maxWidth = sizeOverride?.maxWidth || titleConstraint.maxWidth;
  const maxHeight = sizeOverride?.maxHeight || titleConstraint.maxHeight;
  const lineHeightVal = sizeOverride?.lineHeight || titleConstraint.lineHeight;
  const transform = titleConstraint.transform;

  const fontMatch = font.match(/^(\d+)\s+(\d+)px\s+(.+)$/);
  if (!fontMatch) return cssVars;

  const [, fontWeight, baseSizeStr, fontFamily] = fontMatch;
  const baseFontSize = parseFloat(baseSizeStr);
  const lineHeightRatio = lineHeightVal / baseFontSize;
  const titleText = content.title || '';

  if (options.targetLines && titleText) {
    const fittedSize = fitToLines(titleText, {
      fontFamily,
      fontWeight,
      maxWidth,
      lineHeightRatio,
      transform,
      targetLines: options.targetLines,
    });
    cssVars['--auto-title-size'] = `${fittedSize}px`;
  } else if (options.autoFit && titleText) {
    const optimalSize = fitFontSize(titleText, {
      fontFamily,
      fontWeight,
      maxWidth,
      maxHeight,
      lineHeightRatio,
      transform,
    });
    cssVars['--auto-title-size'] = `${optimalSize}px`;
  }

  if (options.balanced && titleText) {
    const fontStr = cssVars['--auto-title-size']
      ? `${fontWeight} ${cssVars['--auto-title-size']} ${fontFamily}`
      : font;
    const lh = cssVars['--auto-title-size']
      ? parseFloat(cssVars['--auto-title-size']) * lineHeightRatio
      : lineHeightVal;

    const result = balanceText(titleText, fontStr, maxWidth, lh, { transform });
    if (result.width < maxWidth) {
      cssVars['--balanced-title-width'] = `${result.width}px`;
    }
  }

  if (options.shrinkWrap && titleText) {
    const fontStr = cssVars['--auto-title-size']
      ? `${fontWeight} ${cssVars['--auto-title-size']} ${fontFamily}`
      : font;
    const lh = cssVars['--auto-title-size']
      ? parseFloat(cssVars['--auto-title-size']) * lineHeightRatio
      : lineHeightVal;

    const contentWidth = shrinkWrapWidth(titleText, fontStr, maxWidth, lh, { transform });
    const dim = SIZES[sizeKey] || SIZES.a4;
    const padding = dim.w - maxWidth;
    options.overrideWidth = contentWidth + padding;
  }

  computeSpatialVars(content, meta, sizeKey, cssVars);

  return cssVars;
}

export async function renderToHTML(templateName, content, options = {}) {
  const { meta, render } = await loadTemplate(templateName);
  const fragment = render(content, options);

  const cssVars = computeCSSVars(content, meta, options);

  return wrapHTML(fragment, {
    scheme: options.scheme || 'dark',
    size: options.size || 'a4',
    templateName,
    templateDir: meta._dir,
    cssVars,
    overrideWidth: options.overrideWidth,
  });
}
