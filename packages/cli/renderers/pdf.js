import { mkdirSync } from 'fs';
import { dirname } from 'path';
import { renderPage, closeBrowser } from '../core/browser.js';

export async function renderPDF(html, outputPath, options = {}) {
  mkdirSync(dirname(outputPath), { recursive: true });

  const page = await renderPage(html, {
    width: options.width,
    height: options.height,
    browserPath: options.browserPath,
  });

  try {
    const width = options.width || 595;
    const height = options.height || 842;

    await page.pdf({
      path: outputPath,
      width: width + 'px',
      height: height + 'px',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return outputPath;
  } finally {
    const context = page.context();
    await page.close();
    await context.close();
    await closeBrowser();
  }
}
