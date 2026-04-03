import { createCanvas } from '@napi-rs/canvas';
import { prepare, prepareWithSegments, layout, walkLineRanges, clearCache } from '@chenglou/pretext';

let polyfilled = false;

function ensureCanvasPolyfill() {
  if (polyfilled) return;
  if (typeof globalThis.OffscreenCanvas === 'undefined') {
    globalThis.OffscreenCanvas = class OffscreenCanvas {
      constructor(w, h) {
        this._canvas = createCanvas(w, h);
      }
      getContext(type) {
        return this._canvas.getContext(type);
      }
    };
  }
  polyfilled = true;
}

function applyTransform(text, transform) {
  if (transform === 'uppercase') return text.toUpperCase();
  if (transform === 'lowercase') return text.toLowerCase();
  return text;
}

/**
 * Measure text dimensions without DOM.
 * @returns {{ height: number, lineCount: number }}
 */
export function measureText(text, font, maxWidth, lineHeight, options = {}) {
  ensureCanvasPolyfill();
  const transformed = applyTransform(text, options.transform);
  const prepared = prepare(transformed, font);
  return layout(prepared, maxWidth, lineHeight);
}

/**
 * Binary-search the largest font size that keeps text within the given box.
 * @returns {number} optimal font size in px
 */
export function fitFontSize(text, {
  fontFamily,
  fontWeight = '',
  maxWidth,
  maxHeight,
  lineHeightRatio = 1.05,
  transform,
  minSize = 12,
  maxSize = 120,
}) {
  ensureCanvasPolyfill();
  const transformed = applyTransform(text, transform);

  let lo = minSize;
  let hi = maxSize;
  let bestSize = minSize;

  while (hi - lo > 0.5) {
    const mid = (lo + hi) / 2;
    const font = `${fontWeight} ${mid}px ${fontFamily}`.trim();
    const lh = mid * lineHeightRatio;

    clearCache();
    const prepared = prepare(transformed, font);
    const result = layout(prepared, maxWidth, lh);

    if (result.height <= maxHeight) {
      bestSize = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  clearCache();
  return Math.floor(bestSize);
}

/**
 * Find the narrowest width that keeps the same line count as full width,
 * producing visually balanced (even-width) lines.
 * @returns {{ width: number, lineCount: number }}
 */
export function balanceText(text, font, maxWidth, lineHeight, options = {}) {
  ensureCanvasPolyfill();
  const transformed = applyTransform(text, options.transform);
  const prepared = prepareWithSegments(transformed, font);

  const baseResult = layout(prepared, maxWidth, lineHeight);
  if (baseResult.lineCount <= 1) {
    return { width: maxWidth, lineCount: baseResult.lineCount };
  }

  let lo = 0;
  let hi = maxWidth;
  let bestWidth = maxWidth;

  while (hi - lo > 1) {
    const mid = (lo + hi) / 2;
    let lineCount = 0;
    walkLineRanges(prepared, mid, () => { lineCount++; });

    if (lineCount <= baseResult.lineCount) {
      bestWidth = mid;
      hi = mid;
    } else {
      lo = mid;
    }
  }

  const finalWidth = Math.ceil(bestWidth) + 1;
  return { width: Math.min(finalWidth, maxWidth), lineCount: baseResult.lineCount };
}

/**
 * Detailed measurement of a single text field against its constraint.
 * Returns line count, height, per-line widths, fill ratio, and overflow status.
 */
export function measureField(text, constraint, sizeKey) {
  ensureCanvasPolyfill();

  const sizeOverride = constraint.sizeOverrides?.[sizeKey];
  const font = sizeOverride?.font || constraint.font;
  const lineHeight = sizeOverride?.lineHeight || constraint.lineHeight;
  const maxWidth = sizeOverride?.maxWidth || constraint.maxWidth;
  const maxHeight = sizeOverride?.maxHeight || constraint.maxHeight;
  const transform = constraint.transform;

  if (!font || !maxWidth || !maxHeight || !lineHeight) return null;

  const transformed = applyTransform(text, transform);
  const prepared = prepareWithSegments(transformed, font);
  const result = layout(prepared, maxWidth, lineHeight);

  const lineWidths = [];
  walkLineRanges(prepared, maxWidth, (line) => { lineWidths.push(Math.round(line.width * 10) / 10); });

  const maxLines = Math.floor(maxHeight / lineHeight);
  const fillRatio = maxHeight > 0 ? result.height / maxHeight : 0;

  clearCache();
  return {
    font,
    lineHeight,
    maxWidth,
    maxHeight,
    lineCount: result.lineCount,
    height: result.height,
    maxLines,
    fillRatio,
    lineWidths,
    overflow: result.height > maxHeight,
  };
}

/**
 * Compute the tightest canvas width that still fits the text (shrink-wrap).
 * Returns the max line width found across all lines.
 */
export function shrinkWrapWidth(text, font, maxWidth, lineHeight, options = {}) {
  ensureCanvasPolyfill();
  const transformed = applyTransform(text, options.transform);
  const prepared = prepareWithSegments(transformed, font);

  let maxLineWidth = 0;
  walkLineRanges(prepared, maxWidth, (line) => {
    if (line.width > maxLineWidth) maxLineWidth = line.width;
  });

  clearCache();
  return Math.ceil(maxLineWidth);
}

/**
 * Binary-search for the font size that produces exactly `targetLines` lines.
 * @returns {number} font size in px
 */
export function fitToLines(text, {
  fontFamily,
  fontWeight = '',
  maxWidth,
  lineHeightRatio = 1.05,
  transform,
  targetLines,
  minSize = 8,
  maxSize = 200,
}) {
  ensureCanvasPolyfill();
  const transformed = applyTransform(text, transform);

  let lo = minSize;
  let hi = maxSize;
  let bestSize = minSize;

  while (hi - lo > 0.5) {
    const mid = (lo + hi) / 2;
    const font = `${fontWeight} ${mid}px ${fontFamily}`.trim();
    const lh = mid * lineHeightRatio;

    clearCache();
    const prepared = prepare(transformed, font);
    const result = layout(prepared, maxWidth, lh);

    if (result.lineCount <= targetLines) {
      bestSize = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  clearCache();
  return Math.floor(bestSize);
}

/**
 * Validate text fields against a template's textLayout constraints.
 * @returns {Array<{ field: string, lineCount: number, maxLines: number, height: number, maxHeight: number }>}
 */
export function checkOverflow(content, textLayout, sizeKey) {
  if (!textLayout) return [];

  ensureCanvasPolyfill();
  const warnings = [];

  for (const [field, constraint] of Object.entries(textLayout)) {
    const text = content[field];
    if (!text) continue;

    const sizeOverride = constraint.sizeOverrides?.[sizeKey];
    const font = sizeOverride?.font || constraint.font;
    const lineHeight = sizeOverride?.lineHeight || constraint.lineHeight;
    const mw = sizeOverride?.maxWidth || constraint.maxWidth;
    const mh = sizeOverride?.maxHeight || constraint.maxHeight;

    if (!font || !mw || !mh || !lineHeight) continue;

    const result = measureText(text, font, mw, lineHeight, {
      transform: constraint.transform,
    });

    const maxLines = Math.floor(mh / lineHeight);
    if (result.height > mh) {
      warnings.push({
        field,
        lineCount: result.lineCount,
        maxLines,
        height: result.height,
        maxHeight: mh,
      });
    }
  }

  clearCache();
  return warnings;
}
