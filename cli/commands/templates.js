import pc from 'picocolors';
import { listTemplates } from '../../core/template-engine.js';

export function registerTemplatesCommand(program) {
  program
    .command('templates')
    .description('List available poster templates')
    .action(() => {
      const templates = listTemplates();

      if (templates.length === 0) {
        console.log(pc.yellow('No templates found.'));
        return;
      }

      console.log(pc.bold('\n  Available Templates\n'));

      for (const t of templates) {
        console.log(`  ${pc.yellow(pc.bold(t.name))} — ${t.label}`);
        console.log(`  ${pc.dim('Sizes:')}   ${t.sizes.join(', ')}`);
        console.log(`  ${pc.dim('Schemes:')} ${t.schemes.join(', ')}`);
        console.log(`  ${pc.dim('Fields:')}`);
        for (const f of t.fields) {
          const req = f.required ? pc.red('*') : ' ';
          const def = f.default ? pc.dim(` [${JSON.stringify(f.default)}]`) : '';
          console.log(`    ${req} ${f.key} (${f.type})${def}`);
        }
        console.log('');
      }
    });
}
