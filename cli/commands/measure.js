import pc from 'picocolors';
import { resolve } from 'path';
import { findTemplate, setExtraTemplatesDirs } from '../../core/template-engine.js';
import { mergeContentWithDefaults, SIZES } from '../../core/config.js';
import { measureField } from '../../core/text-measure.js';

export function registerMeasureCommand(program) {
  program
    .command('measure')
    .description('Measure text layout for a template without rendering')
    .option('-t, --template <name>', 'Template name')
    .option('--size <size>', 'Poster size', 'a4')
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

        const sizeKey = opts.size || 'a4';
        const dim = SIZES[sizeKey];
        if (!dim) {
          console.error(pc.red(`Invalid size: ${sizeKey}`));
          process.exit(1);
        }

        console.log(pc.bold(`\n  Template: ${meta.name} (${dim.label} ${dim.w}x${dim.h})\n`));

        const textLayout = meta.textLayout;
        if (!textLayout) {
          console.log(pc.yellow('  No textLayout defined for this template.\n'));
          return;
        }

        for (const [field, constraint] of Object.entries(textLayout)) {
          const text = content[field];
          if (!text) continue;

          const result = measureField(text, constraint, sizeKey);
          if (!result) continue;

          const pct = Math.round(result.fillRatio * 100);
          const status = result.overflow
            ? pc.red('OVERFLOW')
            : pc.green('OK');

          console.log(`  ${pc.bold(field)}`);
          console.log(`    ${pc.dim('Font:')}      ${result.font}`);
          console.log(`    ${pc.dim('Container:')} ${result.maxWidth} x ${result.maxHeight} px`);
          console.log(`    ${pc.dim('Lines:')}     ${result.lineCount}`);
          console.log(`    ${pc.dim('Height:')}    ${Math.round(result.height * 10) / 10} / ${result.maxHeight} px (${pct}%)`);
          console.log(`    ${pc.dim('Status:')}    ${status}`);
          console.log('');
        }
      } catch (err) {
        console.error(pc.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });
}
