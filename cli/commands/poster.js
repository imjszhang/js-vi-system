import { resolve, join } from 'path';
import pc from 'picocolors';
import { readFileSync } from 'fs';
import { renderToHTML, findTemplate, listTemplates, setExtraTemplatesDirs } from '../../core/template-engine.js';
import { validateOptions, mergeContentWithDefaults, SIZES } from '../../core/config.js';
import { renderOutput } from '../../core/renderer-factory.js';

async function handleSinglePoster(opts) {
  validateOptions(opts);

  const meta = findTemplate(opts.template);
  if (!meta) {
    const available = listTemplates().map(t => t.name).join(', ');
    console.error(pc.red(`Template not found: ${opts.template}`));
    console.error(`Available: ${available}`);
    process.exit(1);
  }

  const content = mergeContentWithDefaults({
    title: opts.title,
    subtitle: opts.subtitle,
    date: opts.date,
    location: opts.location,
    info: opts.info,
    tag: opts.tag,
  }, meta);

  const animated = opts.format === 'gif';
  const options = { scheme: opts.scheme, size: opts.size, animated };
  const html = await renderToHTML(opts.template, content, options);

  const ext = opts.format === 'jpg' ? 'jpeg' : opts.format;
  const outputPath = opts.output || join('poster', `poster-${opts.template}.${ext}`);
  const dim = SIZES[opts.size] || SIZES.a4;

  const animMeta = meta.animation || {};
  const result = await renderOutput(html, opts.format, resolve(outputPath), {
    ...options,
    width: dim.w,
    height: dim.h,
    fps: opts.fps || animMeta.defaultFps,
    duration: opts.duration || animMeta.duration,
    quality: opts.quality,
    browserPath: opts.browserPath,
    deviceScaleFactor: opts.deviceScaleFactor,
  });

  console.log(pc.green(`✓ Generated: ${result}`));
}

async function handleConfigFile(configPath, cliOpts = {}) {
  const raw = readFileSync(resolve(configPath), 'utf-8');
  const config = JSON.parse(raw);
  const posters = config.posters || [config];

  for (const entry of posters) {
    const meta = findTemplate(entry.template);
    if (!meta) {
      console.error(pc.red(`Template not found: ${entry.template}`));
      continue;
    }

    const content = mergeContentWithDefaults(entry.content || {}, meta);
    const dim = SIZES[entry.size || 'a4'] || SIZES.a4;
    const animMeta = meta.animation || {};

    const outputs = entry.outputs || [{ format: 'html', path: join('poster', `poster-${entry.template}.html`) }];
    for (const out of outputs) {
      try {
        const animated = out.format === 'gif';
        const options = { scheme: entry.scheme || 'dark', size: entry.size || 'a4', animated };
        const html = await renderToHTML(entry.template, content, options);
        const dpr =
          out.deviceScaleFactor ??
          entry.deviceScaleFactor ??
          config.deviceScaleFactor ??
          cliOpts.deviceScaleFactor;
        const result = await renderOutput(html, out.format, resolve(out.path), {
          ...options,
          width: dim.w,
          height: dim.h,
          fps: out.fps || animMeta.defaultFps,
          duration: out.duration || animMeta.duration,
          deviceScaleFactor: dpr,
        });
        console.log(pc.green(`✓ Generated: ${result}`));
      } catch (err) {
        console.error(pc.red(`✗ Failed ${out.path}: ${err.message}`));
      }
    }
  }
}

export function registerPosterCommand(program) {
  program
    .command('poster')
    .description('Generate a poster from a template')
    .option('-t, --template <name>', 'Template name')
    .option('-s, --scheme <scheme>', 'Color scheme', 'dark')
    .option('--size <size>', 'Poster size', 'a4')
    .option('-f, --format <format>', 'Output format', 'html')
    .option('-o, --output <path>', 'Output file path')
    .option('--title <text>', 'Poster title')
    .option('--subtitle <text>', 'Poster subtitle')
    .option('--date <text>', 'Date text')
    .option('--location <text>', 'Location text')
    .option('--info <text>', 'Info text')
    .option('--tag <text>', 'Tag text')
    .option('--config <path>', 'Config JSON file for batch generation')
    .option('--fps <number>', 'GIF frames per second', parseFloat)
    .option('--duration <number>', 'GIF animation duration in ms', parseFloat)
    .option('--quality <number>', 'JPEG quality (0-100)', parseFloat)
    .option('--browser-path <path>', 'Path to Chrome/Edge executable')
    .option(
      '--device-scale-factor <n>',
      'Device pixel ratio for raster screenshots (png/jpeg/pdf). Default in renderer: 2',
      parseFloat,
    )
    .option('--templates-dir <path>', 'Additional templates directory')
    .action(async (opts) => {
      try {
        if (opts.templatesDir) {
          setExtraTemplatesDirs([resolve(opts.templatesDir)]);
        }

        if (opts.config) {
          await handleConfigFile(opts.config, opts);
        } else {
          if (!opts.template) {
            console.error(pc.red('Error: --template or --config is required'));
            process.exit(1);
          }
          await handleSinglePoster(opts);
        }
      } catch (err) {
        console.error(pc.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });
}
