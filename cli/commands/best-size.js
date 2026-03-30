import pc from 'picocolors';
import { resolve } from 'path';
import { findTemplate, setExtraTemplatesDirs } from '../../core/template-engine.js';
import { mergeContentWithDefaults, SIZES } from '../../core/config.js';
import { measureField } from '../../core/text-measure.js';

export function registerBestSizeCommand(program) {
  program
    .command('best-size')
    .description('Recommend the best poster size for given content')
    .option('-t, --template <name>', 'Template name')
    .option('--title <text>', 'Title text')
    .option('--subtitle <text>', 'Subtitle text')
    .option('--templates-dir <path>', 'Additional templates directory')
    .action((opts) => {
      try {
        if (opts.templatesDir) {
          setExtraTemplatesDirs([resolve(opts.templatesDir)]);
        }

        if (!opts.template) {
          console.error(pc.red('Error: --template is required'));
          process.exit(1);
        }

        const meta = findTemplate(opts.template);
        if (!meta) {
          console.error(pc.red(`Template not found: ${opts.template}`));
          process.exit(1);
        }

        const content = mergeContentWithDefaults({
          title: opts.title,
          subtitle: opts.subtitle,
        }, meta);

        const textLayout = meta.textLayout;
        if (!textLayout?.title) {
          console.log(pc.yellow('No textLayout.title defined for this template.\n'));
          return;
        }

        const titleText = content.title || '';
        if (!titleText) {
          console.log(pc.yellow('No title text to measure.\n'));
          return;
        }

        const sizes = meta.sizes || Object.keys(SIZES);
        const results = [];

        for (const sizeKey of sizes) {
          const dim = SIZES[sizeKey];
          if (!dim) continue;

          const result = measureField(titleText, textLayout.title, sizeKey);
          if (!result) continue;

          results.push({
            sizeKey,
            dim,
            ...result,
          });
        }

        results.sort((a, b) => {
          if (a.overflow && !b.overflow) return 1;
          if (!a.overflow && b.overflow) return -1;
          const idealA = Math.abs(a.fillRatio - 0.7);
          const idealB = Math.abs(b.fillRatio - 0.7);
          return idealA - idealB;
        });

        console.log('');

        let bestPicked = false;
        for (const r of results) {
          const pct = Math.round(r.fillRatio * 100);
          const label = `${r.sizeKey} (fill ${pct}%, ${r.lineCount} lines)`;

          if (r.overflow) {
            console.log(`  ${pc.red('Too tight:')}   ${label}`);
          } else if (!bestPicked) {
            console.log(`  ${pc.green('Recommended:')} ${label}`);
            bestPicked = true;
          } else {
            console.log(`  ${pc.cyan('Also good:')}  ${label}`);
          }
        }

        console.log('');
      } catch (err) {
        console.error(pc.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });
}
