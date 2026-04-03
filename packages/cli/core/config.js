import pc from 'picocolors';
import { SIZES } from '../templates/_shared/sizes.js';
import { checkOverflow } from './text-measure.js';

export { SIZES };

const VALID_SCHEMES = ['daylight', 'dark', 'minimal'];
const VALID_FORMATS = ['html', 'png', 'jpeg', 'jpg', 'svg', 'gif', 'pdf'];

export function validateOptions(options) {
  if (options.size && !SIZES[options.size]) {
    throw new Error(`Invalid size: ${options.size}. Available: ${Object.keys(SIZES).join(', ')}`);
  }
  if (options.scheme && !VALID_SCHEMES.includes(options.scheme)) {
    throw new Error(`Invalid scheme: ${options.scheme}. Available: ${VALID_SCHEMES.join(', ')}`);
  }
  if (options.format && !VALID_FORMATS.includes(options.format)) {
    throw new Error(`Invalid format: ${options.format}. Available: ${VALID_FORMATS.join(', ')}`);
  }
}

/**
 * Check text content against template layout constraints.
 * Returns warnings array; throws in strict mode if any overflow detected.
 */
export function validateTextLayout(content, meta, sizeKey, { strict = false } = {}) {
  const warnings = checkOverflow(content, meta.textLayout, sizeKey);

  for (const w of warnings) {
    const msg = `Text overflow in "${w.field}": ${w.lineCount} lines (max ~${w.maxLines}), height ${Math.round(w.height)}px exceeds ${w.maxHeight}px`;
    if (strict) {
      throw new Error(msg);
    }
    console.warn(pc.yellow(`⚠ ${msg}`));
  }

  return warnings;
}

export function mergeContentWithDefaults(content, meta) {
  const merged = {};
  for (const field of meta.fields) {
    merged[field.key] = content[field.key] !== undefined ? content[field.key] : field.default;
  }
  return merged;
}
