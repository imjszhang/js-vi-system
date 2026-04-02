import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import pkg from 'gifenc';
const { GIFEncoder, quantize, applyPalette } = pkg;
import { renderPage, closeBrowser } from '../cli/utils/browser.js';

export async function renderGIF(html, outputPath, options = {}) {
  mkdirSync(dirname(outputPath), { recursive: true });

  const fps = options.fps || 10;
  const duration = options.duration || 3000;
  const width = options.width || 595;
  const height = options.height || 842;
  const totalFrames = Math.ceil((duration / 1000) * fps);
  const delay = Math.round(1000 / fps);

  const page = await renderPage(html, {
    width,
    height,
    browserPath: options.browserPath,
  });

  try {
    await page.evaluate(() => {
      document.getAnimations({ subtree: true }).forEach(a => {
        a.pause();
        a.currentTime = 0;
      });
    });

    const gif = GIFEncoder();
    const vp = page.viewportSize();

    for (let i = 0; i < totalFrames; i++) {
      const time = (i / totalFrames) * duration;

      await page.evaluate((t) => {
        document.getAnimations({ subtree: true }).forEach(a => {
          a.currentTime = t;
        });
      }, time);

      await page.evaluate(() => new Promise(r => requestAnimationFrame(r)));

      const buffer = await page.screenshot({
        type: 'png',
        clip: { x: 0, y: 0, width: vp.width, height: vp.height },
        omitBackground: false,
      });

      const { data, info } = await decodeRawPixels(buffer, page);
      const palette = quantize(data, 256);
      const indexed = applyPalette(data, palette);

      gif.writeFrame(indexed, info.width, info.height, { palette, delay });
    }

    gif.finish();
    const output = gif.bytes();
    writeFileSync(outputPath, Buffer.from(output));

    return outputPath;
  } finally {
    const context = page.context();
    await page.close();
    await context.close();
    await closeBrowser();
  }
}

async function decodeRawPixels(pngBuffer, page) {
  const base64 = pngBuffer.toString('base64');

  const result = await page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = 'data:image/png;base64,' + b64;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    return {
      data: Array.from(imageData.data),
      width: img.width,
      height: img.height,
    };
  }, base64);

  return {
    data: new Uint8Array(result.data),
    info: { width: result.width, height: result.height },
  };
}
