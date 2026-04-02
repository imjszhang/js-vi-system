import { mkdirSync } from 'fs';
import { dirname } from 'path';
import { renderPage, closeBrowser } from '../cli/utils/browser.js';

export async function renderImage(html, outputPath, options = {}) {
  mkdirSync(dirname(outputPath), { recursive: true });

  const type = options.type || 'png';
  const page = await renderPage(html, {
    width: options.width,
    height: options.height,
    browserPath: options.browserPath,
    deviceScaleFactor: options.deviceScaleFactor,
  });

  try {
    const screenshotOptions = {
      path: outputPath,
      type: type === 'jpg' ? 'jpeg' : type,
      fullPage: false,
    };

    if (type === 'jpeg' || type === 'jpg') {
      screenshotOptions.quality = options.quality || 90;
    }

    const element = await page.locator('.poster').first().elementHandle();
    if (element) {
      await element.screenshot(screenshotOptions);
    } else {
      await page.screenshot(screenshotOptions);
    }

    return outputPath;
  } finally {
    const context = page.context();
    await page.close();
    await context.close();
    await closeBrowser();
  }
}
