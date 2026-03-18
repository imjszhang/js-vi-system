import { SIZES } from '../templates/_shared/sizes.js';

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

export function mergeContentWithDefaults(content, meta) {
  const merged = {};
  for (const field of meta.fields) {
    merged[field.key] = content[field.key] !== undefined ? content[field.key] : field.default;
  }
  return merged;
}
