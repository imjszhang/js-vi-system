import { resolve, relative, basename, join, dirname } from 'path';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import pc from 'picocolors';

const __dirname = dirname(fileURLToPath(import.meta.url));
const viSystemRoot = resolve(__dirname, '..', '..');

function toLabel(name) {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function writeFile(filePath, content) {
  const dir = dirname(filePath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, content, 'utf-8');
  console.log(pc.green(`✓ Created ${relative(process.cwd(), filePath)}`));
}

function generatePackageJSON(dir, viSystemPath) {
  const name = basename(resolve(dir));
  const relPath = relative(resolve(dir), viSystemRoot).replace(/\\/g, '/');

  return JSON.stringify({
    name,
    version: '1.0.0',
    private: true,
    type: 'module',
    description: `Template extension for js-vi-system`,
    dependencies: {
      'js-vi-system': `file:${relPath}`,
    },
    scripts: {
      poster: 'js-vi poster --templates-dir .',
      build: 'js-vi build',
    },
  }, null, 2) + '\n';
}

function generateGitignore() {
  return `node_modules/\noutput/\n`;
}

function generateMetaJSON(name) {
  return JSON.stringify({
    name,
    label: toLabel(name),
    fields: [
      { key: 'title', type: 'text', required: true, default: 'HELLO\nWORLD' },
      { key: 'subtitle', type: 'string', default: '// subtitle' },
      { key: 'tag', type: 'string', default: 'TAG' },
      { key: 'date', type: 'string', default: '2026.01.01' },
    ],
    sizes: ['a4', 'square', 'banner', 'story', 'wechat-cover', 'wechat-thumb'],
    schemes: ['daylight', 'dark', 'minimal'],
    animation: { supported: false },
    textLayout: {
      title: {
        font: '700 48px Space Grotesk',
        lineHeight: 52.8,
        maxWidth: 515,
        maxHeight: 400,
        transform: 'uppercase',
      },
    },
  }, null, 2) + '\n';
}

function generateRenderJS(name) {
  const cls = name;
  return `import { LOGO_SVG } from 'js-vi-system/templates/_shared/logo.js';
import { esc } from 'js-vi-system/templates/_shared/utils.js';

export function render(content, options = {}) {
  const c = content;

  return \`
    <div class="poster poster-${cls} poster-grid-bg" style="width:100%;height:100%">
      <div class="${cls}-body">
        <div class="${cls}-tag">\${esc(c.tag)}</div>
        <div class="${cls}-title">\${esc(c.title).replace(/\\n/g, '<br>')}</div>
        <div class="${cls}-subtitle">\${esc(c.subtitle)}</div>
        <div class="${cls}-date">\${esc(c.date)}</div>
      </div>
      <div class="${cls}-footer">
        <div style="width:28px;height:28px;border-radius:50%">\${LOGO_SVG}</div>
        <span class="${cls}-footer-text">JS_VI_SYSTEM</span>
      </div>
    </div>\`;
}
`;
}

function generateStylesCSS(name) {
  const cls = name;
  return `/*
 * ${toLabel(name)} — Template Styles
 *
 * Design rules:
 *   - NO gradients, rounded corners, soft shadows, or pastel colors
 *   - USE hard borders, hard shadows (offset box-shadow), high contrast
 *   - Fonts: Space Grotesk (body) + JetBrains Mono (code/tags)
 *   - Colors: only brand yellow #FCD228, black #000, white #FFF via CSS vars
 *
 * Available scheme variables:
 *   --p-bg, --p-text, --p-accent, --p-surface, --p-border,
 *   --p-shadow, --p-muted, --p-grid-line, --p-tag-bg, --p-tag-text
 */

.poster-${cls} {
  display: flex;
  flex-direction: column;
  background-color: var(--p-bg);
  color: var(--p-text);
  font-family: 'Space Grotesk', sans-serif;
  padding: 40px;
}

.${cls}-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

.${cls}-tag {
  display: inline-block;
  align-self: flex-start;
  padding: 4px 12px;
  background: var(--p-tag-bg);
  color: var(--p-tag-text);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.${cls}-title {
  font-size: var(--auto-title-size, 48px);
  font-weight: 700;
  line-height: 1.1;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  max-width: var(--balanced-title-width, none);
}

.${cls}-subtitle {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: var(--p-muted);
}

.${cls}-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--p-muted);
}

.${cls}-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 20px;
  border-top: 3px solid var(--p-border);
}

.${cls}-footer-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
`;
}

function generateExampleConfig(templateName) {
  return JSON.stringify({
    posters: [
      {
        template: templateName,
        scheme: 'dark',
        size: 'a4',
        content: { title: 'HELLO\nWORLD', subtitle: '// subtitle' },
        outputs: [
          { format: 'html', path: 'output/example.html' },
          { format: 'png', path: 'output/example.png' },
        ],
      },
    ],
  }, null, 2) + '\n';
}

export function registerInitCommand(program) {
  program
    .command('init [directory]')
    .description('Scaffold a new template plugin repository')
    .option('-t, --template <name>', 'Create a template skeleton')
    .option('--vi-system-path <path>', 'Path to js-vi-system (auto-detected by default)')
    .action((directory, opts) => {
      const targetDir = resolve(directory || '.');
      const pkgPath = join(targetDir, 'package.json');

      if (existsSync(pkgPath)) {
        console.error(pc.red(`Error: ${relative(process.cwd(), pkgPath)} already exists. Aborting to avoid overwrite.`));
        process.exit(1);
      }

      if (opts.viSystemPath) {
        const overridePath = resolve(opts.viSystemPath);
        const rel = relative(targetDir, overridePath).replace(/\\/g, '/');
        writeFile(pkgPath, generatePackageJSON(targetDir, rel));
      } else {
        writeFile(pkgPath, generatePackageJSON(targetDir));
      }

      writeFile(join(targetDir, '.gitignore'), generateGitignore());

      const templateName = opts.template || 'my-template';
      writeFile(join(targetDir, 'configs', 'example.json'), generateExampleConfig(templateName));

      if (opts.template) {
        const tplDir = join(targetDir, opts.template);
        writeFile(join(tplDir, 'meta.json'), generateMetaJSON(opts.template));
        writeFile(join(tplDir, 'render.js'), generateRenderJS(opts.template));
        writeFile(join(tplDir, 'styles.css'), generateStylesCSS(opts.template));
      }

      console.log('');
      console.log(pc.bold('Done! Next steps:'));
      console.log('');
      if (directory) {
        console.log(`  cd ${directory}`);
      }
      console.log('  npm install');
      if (opts.template) {
        console.log(`  npm run poster -- --template ${opts.template} -f html -o output/test.html`);
      } else {
        console.log('  # Create a template directory, then:');
        console.log('  # npm run poster -- --template <name> -f html -o output/test.html');
      }
      console.log('');
    });
}
