import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { renderPage, closeBrowser } from '../cli/utils/browser.js';

export async function renderSVG(html, outputPath, options = {}) {
  mkdirSync(dirname(outputPath), { recursive: true });

  const width = options.width || 595;
  const height = options.height || 842;

  const page = await renderPage(html, {
    width,
    height,
    browserPath: options.browserPath,
  });

  try {
    const pngBuffer = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width, height },
      omitBackground: false,
    });

    const base64 = pngBuffer.toString('base64');

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${width}" height="${height}"
     viewBox="0 0 ${width} ${height}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">
      <img src="data:image/png;base64,${base64}" width="${width}" height="${height}" style="display:block"/>
    </div>
  </foreignObject>
</svg>`;

    writeFileSync(outputPath, svg, 'utf-8');
    return outputPath;
  } finally {
    await page.close();
    await closeBrowser();
  }
}
