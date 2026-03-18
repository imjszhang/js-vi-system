import { LOGO_SVG } from '../_shared/logo.js';
import { esc } from '../_shared/utils.js';

const ANIM_STYLES = `
@keyframes typeIn {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes separatorGrow {
  from { width: 0; }
  to { width: 120px; }
}
.anim-prompt { animation: typeIn 0.6s ease-out both; animation-delay: 0.2s; }
.anim-title-line { animation: typeIn 0.5s ease-out both; }
.anim-separator { animation: separatorGrow 0.4s ease-out both; }
.anim-info { animation: slideUp 0.6s ease-out both; }
.anim-footer { animation: fadeIn 0.4s ease-out both; }
`;

export function render(content, options = {}) {
  const c = content;
  const animated = options.animated || false;
  const lines = c.title.split('\n');

  const titleHtml = lines.map((line, i) => {
    const cursor = i === lines.length - 1
      ? '<span class="cursor-blink" style="margin-left:4px;opacity:0.7">&#9608;</span>'
      : '';
    const animClass = animated ? ' anim-title-line' : '';
    const animDelay = animated ? ` style="animation-delay:${0.6 + i * 0.3}s"` : '';
    return `<div class="${animClass}"${animDelay}>${esc(line)}${cursor}</div>`;
  }).join('');

  const sepDelay = animated ? 0.6 + lines.length * 0.3 + 0.2 : 0;
  const infoDelay = sepDelay + 0.3;
  const footerDelay = infoDelay + 0.4;

  return `
    ${animated ? `<style>${ANIM_STYLES}</style>` : ''}
    <div class="poster poster-terminal poster-grid-bg" style="width:100%;height:100%">
      <div class="term-body">
        <div class="term-prompt${animated ? ' anim-prompt' : ''}">&gt; init js-poster-system</div>
        <div class="term-title">${titleHtml}</div>
        <div class="term-separator${animated ? ' anim-separator' : ''}"${animated ? ` style="animation-delay:${sepDelay}s"` : ''}></div>
        <div class="term-info${animated ? ' anim-info' : ''}"${animated ? ` style="animation-delay:${infoDelay}s"` : ''}>
          <div>${esc(c.subtitle)}</div>
          <div>// ${esc(c.date)} — ${esc(c.location)}</div>
        </div>
      </div>
      <div class="term-footer${animated ? ' anim-footer' : ''}"${animated ? ` style="animation-delay:${footerDelay}s"` : ''}>
        <div class="term-footer-text">${esc(c.info)}</div>
        <div style="width:36px;height:36px;border-radius:50%;box-shadow:2px 2px 0px 0px rgba(255,255,255,0.15)">${LOGO_SVG}</div>
      </div>
    </div>`;
}
