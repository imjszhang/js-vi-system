import { readFileSync, readdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { wrapHTML } from '../templates/_shared/html-wrapper.js';

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

export async function renderToHTML(templateName, content, options = {}) {
  const { render } = await loadTemplate(templateName);
  const fragment = render(content, options);
  return wrapHTML(fragment, {
    scheme: options.scheme || 'dark',
    size: options.size || 'a4',
    templateName,
  });
}
