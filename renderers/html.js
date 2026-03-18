import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export function renderHTML(html, outputPath) {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html, 'utf-8');
  return outputPath;
}
