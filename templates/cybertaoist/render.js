import { LOGO_SVG } from '../_shared/logo.js';
import { esc } from '../_shared/utils.js';

const ANIM_STYLES = `
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes ringPulse {
  0% { opacity: 0; transform: scale(0.7); }
  60% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes energyFade {
  from { opacity: 0; }
  to { opacity: 0.3; }
}
@keyframes diagonalSlide {
  from { opacity: 0; left: -50%; }
  to { opacity: 1; left: -10%; }
}
.anim-ring { animation: ringPulse 0.8s ease-out both; animation-delay: 0.3s; }
.anim-energy { animation: energyFade 0.5s ease-out both; animation-delay: 1.0s; }
.anim-title { animation: slideUp 0.6s ease-out both; animation-delay: 1.2s; }
.anim-comment { animation: slideUp 0.4s ease-out both; animation-delay: 1.5s; }
.anim-footer { animation: fadeIn 0.4s ease-out both; animation-delay: 1.8s; }
.anim-diagonal { animation: diagonalSlide 0.6s ease-out both; animation-delay: 0.1s; }
.anim-split { animation: fadeIn 0.4s ease-out both; }
`;

export function render(content, options = {}) {
  const c = content;
  const animated = options.animated || false;
  const a = (cls) => animated ? ` ${cls}` : '';

  const energyLines = [
    'width:3px;height:60px;top:calc(35% - 30px);left:calc(50% + 130px)',
    'width:80px;height:3px;top:calc(35% + 5px);left:calc(50% + 120px)',
    'width:3px;height:40px;top:calc(35% - 60px);left:calc(50% - 130px)',
    'width:50px;height:3px;top:calc(35% - 30px);left:calc(50% - 160px)',
  ].map(s => `<div class="ct-energy-line${a('anim-energy')}" style="position:absolute;${s}"></div>`).join('');

  return `
    ${animated ? `<style>${ANIM_STYLES}</style>` : ''}
    <div class="poster poster-cybertaoist" style="width:100%;height:100%">
      <div class="ct-split${a('anim-split')}">
        <div class="ct-split-dark"></div>
        <div class="ct-split-light poster-grid-bg"></div>
        <div class="ct-diagonal${a('anim-diagonal')}"></div>
      </div>

      ${energyLines}

      <div class="ct-body">
        <div class="ct-logo-area">
          <div class="ct-logo-ring${a('anim-ring')}">
            <div style="width:120px;height:120px;border-radius:50%;box-shadow:4px 4px 0px 0px rgba(0,0,0,0.2)">${LOGO_SVG}</div>
          </div>
        </div>

        <div class="ct-text-block">
          <div class="ct-title${a('anim-title')}">${esc(c.title).replace(/\n/g, '<br>')}</div>
          <div class="ct-code-comment${a('anim-comment')}">${esc(c.subtitle)}</div>
        </div>

        <div class="ct-footer${a('anim-footer')}">
          <div class="ct-footer-brand">CYBER-TAOIST // JS</div>
          <div class="ct-footer-date">${esc(c.date)} — ${esc(c.location)}</div>
        </div>
      </div>
    </div>`;
}
