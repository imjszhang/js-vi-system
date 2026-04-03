import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function registerBuildCommand(program) {
  program
    .command('build')
    .description('Generate CSS tokens and Tailwind preset from design tokens')
    .action(async () => {
      const tokensGenerateScript = join(__dirname, '..', '..', '..', 'tokens', 'build', 'generate.js');
      await import('file:///' + tokensGenerateScript.replace(/\\/g, '/'));
    });
}
