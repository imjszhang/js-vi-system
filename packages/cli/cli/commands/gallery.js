import { resolve, basename } from 'path';
import { existsSync, readFileSync } from 'fs';

export function registerGalleryCommand(program) {
  program
    .command('gallery')
    .description('Start the poster gallery server with SSE live-reload')
    .option('--output-dir <dir>', 'Directory containing rendered posters', 'output')
    .option('--configs-dir <dir>', 'Directory containing batch config JSON files', 'configs')
    .option('-p, --port <number>', 'Server port', '3210')
    .option('--title <name>', 'Project title shown in the gallery header')
    .action(async (opts) => {
      const outputDir = resolve(opts.outputDir);
      const configsDir = resolve(opts.configsDir);
      const port = parseInt(opts.port, 10);

      let projectTitle = opts.title;
      if (!projectTitle) {
        const pkgPath = resolve('package.json');
        if (existsSync(pkgPath)) {
          try {
            const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
            projectTitle = (pkg.name || basename(process.cwd())).toUpperCase().replace(/[-_]/g, ' ');
          } catch {
            projectTitle = basename(process.cwd()).toUpperCase();
          }
        } else {
          projectTitle = basename(process.cwd()).toUpperCase();
        }
      }

      const { startGalleryServer } = await import('../../gallery/server.js');
      startGalleryServer({ outputDir, configsDir, port, projectTitle });
    });
}
