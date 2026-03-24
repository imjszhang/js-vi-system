import { Command } from 'commander';
import { registerPosterCommand } from './commands/poster.js';
import { registerTemplatesCommand } from './commands/templates.js';
import { registerBuildCommand } from './commands/build.js';
import { registerInitCommand } from './commands/init.js';

const program = new Command();

program
  .name('js-vi')
  .description('JS Visual Identity System CLI')
  .version('1.0.0');

registerPosterCommand(program);
registerTemplatesCommand(program);
registerBuildCommand(program);
registerInitCommand(program);

program.parse();
