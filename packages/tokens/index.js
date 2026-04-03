import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const load = (name) => JSON.parse(readFileSync(join(__dirname, name), 'utf-8'));

export const colors = load('colors.json');
export const typography = load('typography.json');
export const shadows = load('shadows.json');
export const borders = load('borders.json');
export const spacing = load('spacing.json');
export const animation = load('animation.json');
export const grid = load('grid.json');
