import { LOGO_SVG } from '../_shared/logo.js';
import { esc } from '../_shared/utils.js';

const ANIM_STYLES = `
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.anim-card-main { animation: scaleIn 0.6s ease-out both; animation-delay: 0.2s; }
.anim-tag { animation: slideUp 0.4s ease-out both; animation-delay: 0.5s; }
.anim-title { animation: slideUp 0.5s ease-out both; animation-delay: 0.7s; }
.anim-subtitle { animation: slideUp 0.4s ease-out both; animation-delay: 0.9s; }
.anim-details { animation: slideUp 0.4s ease-out both; animation-delay: 1.1s; }
.anim-bar { animation: fadeIn 0.4s ease-out both; animation-delay: 1.4s; }
.anim-deco { animation: fadeIn 0.6s ease-out both; animation-delay: 1.6s; }
`;

export function render(content, options = {}) {
  const c = content;
  const animated = options.animated || false;
  const a = (cls) => animated ? ` ${cls}` : '';

  return `
    ${animated ? `<style>${ANIM_STYLES}</style>` : ''}
    <div class="poster poster-card poster-grid-bg" style="width:100%;height:100%">
      <div class="card-deco${a('anim-deco')}" style="top:16px;right:24px;font-size:64px;line-height:1">{ }</div>
      <div class="card-deco${a('anim-deco')}" style="bottom:80px;left:12px;font-size:14px;transform:rotate(-90deg)">// POSTER_SYS</div>

      <div class="card-main${a('anim-card-main')}" style="flex:1;display:flex;flex-direction:column">
        <div class="card-tag${a('anim-tag')}">${esc(c.tag)}</div>
        <div class="card-title${a('anim-title')}">${esc(c.title).replace(/\n/g, '<br>')}</div>
        <div class="card-subtitle${a('anim-subtitle')}">${esc(c.subtitle)}</div>
        <div class="card-details${a('anim-details')}" style="margin-top:auto">
          <div><strong>DATE:</strong> ${esc(c.date)}</div>
          <div><strong>LOCATION:</strong> ${esc(c.location)}</div>
        </div>
      </div>

      <div class="card-bottom-bar${a('anim-bar')}">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:28px;height:28px;border-radius:50%">${LOGO_SVG}</div>
          <div class="bar-text">JS_VI_SYSTEM</div>
        </div>
        <div class="bar-text">${esc(c.info)}</div>
      </div>
    </div>`;
}
