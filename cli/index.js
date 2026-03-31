import { Command } from 'commander';
import { registerPosterCommand } from './commands/poster.js';
import { registerTemplatesCommand } from './commands/templates.js';
import { registerBuildCommand } from './commands/build.js';
import { registerInitCommand } from './commands/init.js';
import { registerMeasureCommand } from './commands/measure.js';
import { registerTypesetCommand } from './commands/typeset.js';
import { registerBestSizeCommand } from './commands/best-size.js';
import { registerLintCommand } from './commands/lint.js';
import { registerGalleryCommand } from './commands/gallery.js';

const program = new Command();

program
  .name('js-vi')
  .description('JS Visual Identity System CLI')
  .version('1.3.0');

registerPosterCommand(program);
registerTemplatesCommand(program);
registerBuildCommand(program);
registerInitCommand(program);
registerMeasureCommand(program);
registerTypesetCommand(program);
registerBestSizeCommand(program);
registerLintCommand(program);
registerGalleryCommand(program);

program.parse();
