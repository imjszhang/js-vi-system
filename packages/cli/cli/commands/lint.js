import pc from 'picocolors';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { findTemplate, setExtraTemplatesDirs } from '../../core/template-engine.js';
import { mergeContentWithDefaults, SIZES } from '../../core/config.js';
import { checkOverflow } from '../../core/text-measure.js';

export function registerLintCommand(program) {
  program
    .command('lint')
    .description('Validate text overflow for all posters in a config file')
    .option('--config <path>', 'Config JSON file to validate')
    .option('--strict', 'Exit with code 1 on any warning')
    .option('--json', 'Output results as JSON')
    .option('--templates-dir <path>', 'Additional templates directory')
    .action((opts) => {
      try {
        if (opts.templatesDir) {
          setExtraTemplatesDirs([resolve(opts.templatesDir)]);
        }

        if (!opts.config) {
          console.error(pc.red('Error: --config is required'));
          process.exit(1);
        }

        const raw = readFileSync(resolve(opts.config), 'utf-8');
        const config = JSON.parse(raw);
        const posters = config.posters || [config];

        const issues = [];
        let totalWarnings = 0;
        let totalErrors = 0;

        for (let i = 0; i < posters.length; i++) {
          const entry = posters[i];
          const meta = findTemplate(entry.template);
          if (!meta) {
            issues.push({
              index: i,
              template: entry.template,
              severity: 'error',
              message: `Template not found: ${entry.template}`,
            });
            totalErrors++;
            continue;
          }

          const content = mergeContentWithDefaults(entry.content || {}, meta);
          const sizeKey = entry.size || 'a4';

          if (!meta.textLayout) continue;

          const warnings = checkOverflow(content, meta.textLayout, sizeKey);
          for (const w of warnings) {
            issues.push({
              index: i,
              template: entry.template,
              size: sizeKey,
              severity: 'warn',
              field: w.field,
              lineCount: w.lineCount,
              maxLines: w.maxLines,
              height: Math.round(w.height),
              maxHeight: w.maxHeight,
              message: `${w.field} overflow — ${w.lineCount} lines (max ${w.maxLines})`,
            });
            totalWarnings++;
          }
        }

        if (opts.json) {
          console.log(JSON.stringify({
            file: opts.config,
            total: posters.length,
            warnings: totalWarnings,
            errors: totalErrors,
            issues,
          }, null, 2));
        } else {
          console.log(`\n${opts.config}: ${posters.length} posters, ${totalWarnings} warning(s), ${totalErrors} error(s)\n`);

          for (const issue of issues) {
            const tag = issue.severity === 'error'
              ? pc.red('[ERROR]')
              : pc.yellow('[WARN]');
            const loc = issue.size
              ? `poster #${issue.index + 1} (${issue.template}, ${issue.size})`
              : `poster #${issue.index + 1} (${issue.template})`;
            console.log(`  ${tag} ${loc}: ${issue.message}`);
          }

          if (issues.length > 0) console.log('');

          const exitCode = totalErrors > 0 || (opts.strict && totalWarnings > 0) ? 1 : 0;
          console.log(`Exit code: ${exitCode}${totalWarnings > 0 && !opts.strict ? ' (warnings only)' : ''}`);

          if (exitCode !== 0) {
            process.exit(exitCode);
          }
        }
      } catch (err) {
        console.error(pc.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });
}
