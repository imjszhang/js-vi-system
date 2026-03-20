import { LOGO_SVG } from '../_shared/logo.js';
import { esc } from '../_shared/utils.js';

export function render(content, options = {}) {
  const c = content;
  const isThumb = options.size === 'wechat-thumb';
  const layoutClass = isThumb ? 'wc-layout-thumb' : 'wc-layout-cover';

  return `
    <div class="poster poster-wechat-cover poster-grid-bg ${layoutClass}" style="width:100%;height:100%">
      <div class="wc-deco-brace">{ }</div>
      <div class="wc-deco-line">// WECHAT_COVER_SYS</div>

      <div class="wc-header">
        <div class="wc-tag">${esc(c.tag)}</div>
        <div class="wc-header-right">
          <span class="wc-issue">${esc(c.issue)}</span>
          <div class="wc-logo">${LOGO_SVG}</div>
        </div>
      </div>

      <div class="wc-body">
        <div class="wc-title">${esc(c.title).replace(/\n/g, '<br>')}</div>
        <div class="wc-subtitle">${esc(c.subtitle)}</div>
      </div>

      <div class="wc-footer">
        <div class="wc-footer-line"></div>
        <span class="wc-footer-text">JS_VI_SYSTEM</span>
        <div class="wc-footer-line"></div>
      </div>
    </div>`;
}
