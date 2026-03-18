import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function registerBuildCommand(program) {
  program
    .command('build')
    .description('Generate CSS tokens and Tailwind preset from design tokens')
    .action(async () => {
      const buildScript = join(__dirname, '..', '..', 'build', 'generate.js');
      await import('file:///' + buildScript.replace(/\\/g, '/'));
    });
}
