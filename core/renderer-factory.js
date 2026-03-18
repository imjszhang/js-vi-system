export async function renderOutput(html, format, outputPath, options = {}) {
  switch (format) {
    case 'html': {
      const { renderHTML } = await import('../renderers/html.js');
      return renderHTML(html, outputPath);
    }
    case 'png':
    case 'jpeg':
    case 'jpg': {
      const { renderImage } = await import('../renderers/image.js');
      return renderImage(html, outputPath, { ...options, type: format === 'jpg' ? 'jpeg' : format });
    }
    case 'pdf': {
      const { renderPDF } = await import('../renderers/pdf.js');
      return renderPDF(html, outputPath, options);
    }
    case 'gif': {
      const { renderGIF } = await import('../renderers/gif.js');
      return renderGIF(html, outputPath, options);
    }
    case 'svg': {
      const { renderSVG } = await import('../renderers/svg.js');
      return renderSVG(html, outputPath, options);
    }
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
