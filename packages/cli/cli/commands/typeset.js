import pc from 'picocolors';
import { resolve } from 'path';
import { findTemplate, setExtraTemplatesDirs } from '../../core/template-engine.js';
import { mergeContentWithDefaults, SIZES } from '../../core/config.js';
import { measureField, fitFontSize } from '../../core/text-measure.js';

export function registerTypesetCommand(program) {
  program
    .command('typeset')
    .description('Scan text layout across all supported sizes for a template')
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

        console.log(pc.bold(`\n  Template: ${meta.name}\n`));

        const titleConstraint = textLayout.title;
        const titleText = content.title || '';
        if (!titleText) {
          console.log(pc.yellow('  No title text to measure.\n'));
          return;
        }

        const sizes = meta.sizes || Object.keys(SIZES);

        for (const sizeKey of sizes) {
          const dim = SIZES[sizeKey];
          if (!dim) continue;

          const result = measureField(titleText, titleConstraint, sizeKey);
          if (!result) continue;

          const pct = Math.round(result.fillRatio * 100);

          let suggestion = '';
          if (result.overflow) {
            const fontMatch = result.font.match(/^(\d+)\s+(\d+)px\s+(.+)$/);
            if (fontMatch) {
              const [, fontWeight, , fontFamily] = fontMatch;
              const fitted = fitFontSize(titleText, {
                fontFamily,
                fontWeight,
                maxWidth: result.maxWidth,
                maxHeight: result.maxHeight,
                lineHeightRatio: result.lineHeight / parseFloat(fontMatch[2]),
                transform: titleConstraint.transform,
              });
              suggestion = pc.cyan(` suggest --auto-fit -> ${fitted}px`);
            }
          } else if (pct < 60) {
            const fontMatch = result.font.match(/^(\d+)\s+(\d+)px\s+(.+)$/);
            if (fontMatch) {
              const [, fontWeight, , fontFamily] = fontMatch;
              const fitted = fitFontSize(titleText, {
                fontFamily,
                fontWeight,
                maxWidth: result.maxWidth,
                maxHeight: result.maxHeight,
                lineHeightRatio: result.lineHeight / parseFloat(fontMatch[2]),
                transform: titleConstraint.transform,
              });
              if (fitted > parseFloat(fontMatch[2])) {
                suggestion = pc.cyan(`, suggest --auto-fit -> ${fitted}px`);
              }
            }
          }

          const sizeLabel = `${sizeKey} (${dim.w}x${dim.h})`;
          const fontSize = result.font.match(/(\d+)px/)?.[1] || '?';
          const status = result.overflow
            ? pc.red('overflow') + suggestion
            : pc.green(`OK`) + suggestion;

          console.log(
            `  ${sizeLabel.padEnd(22)} ${(fontSize + 'px').padEnd(6)} ${String(result.lineCount).padStart(2)} lines  ${String(pct + '% fill').padEnd(10)} ${status}`
          );
        }

        console.log('');
      } catch (err) {
        console.error(pc.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });
}
