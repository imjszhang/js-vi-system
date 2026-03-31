window.Gallery = (function () {
    'use strict';

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const state = {
        posters: [],
        filterTemplate: 'all',
        filterScheme: 'all',
        filterSize: 'all',
        sse: null,
    };

    const el = {};

    // ── Helpers ──────────────────────────────────────────────────────

    function escapeHtml(str) {
        if (!str) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return String(str).replace(/[&<>"']/g, (c) => map[c]);
    }

    function formatSize(bytes) {
        if (!bytes) return '--';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function getContentPreview(content) {
        if (!content) return '';
        const fields = ['title', 'verse', 'formula', 'description', 'subtitle', 'name'];
        for (const f of fields) {
            if (content[f]) return content[f].replace(/\n/g, ' ');
        }
        return '';
    }

    // ── Filtering ───────────────────────────────────────────────────

    function getFilteredPosters() {
        return state.posters.filter((p) => {
            if (state.filterTemplate !== 'all' && p.template !== state.filterTemplate) return false;
            if (state.filterScheme !== 'all' && p.scheme !== state.filterScheme) return false;
            if (state.filterSize !== 'all' && p.size !== state.filterSize) return false;
            return true;
        });
    }

    function populateTemplateFilter() {
        const templates = new Set(state.posters.map(p => p.template).filter(Boolean));
        const select = el.filterTemplate;
        const current = select.value;

        while (select.options.length > 1) select.remove(1);

        const sorted = [...templates].sort();
        for (const t of sorted) {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t.toUpperCase();
            select.appendChild(opt);
        }

        if ([...select.options].some(o => o.value === current)) {
            select.value = current;
        }
    }

    function populateSizeFilter() {
        const sizes = new Set(state.posters.map(p => p.size).filter(Boolean));
        const container = $('#filter-size');
        const current = state.filterSize;

        const allBtn = container.querySelector('[data-value="all"]');
        container.innerHTML = '';
        container.appendChild(allBtn);

        const sorted = [...sizes].sort();
        for (const s of sorted) {
            const btn = document.createElement('button');
            btn.className = 'filter-btn' + (current === s ? ' active' : '');
            btn.dataset.value = s;
            btn.textContent = s.toUpperCase();
            btn.addEventListener('click', () => {
                container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.filterSize = s;
                renderGrid();
            });
            container.appendChild(btn);
        }

        if (current === 'all') allBtn.classList.add('active');
    }

    // ── Rendering ───────────────────────────────────────────────────

    function renderCard(poster) {
        const schemeClass = poster.scheme ? `scheme-${poster.scheme}` : '';
        const schemeTagClass = poster.scheme ? `tag-scheme tag-scheme-${poster.scheme}` : '';
        const preview = getContentPreview(poster.content);

        const htmlBtn = poster.htmlUrl
            ? `<a class="card-overlay-btn" href="${escapeHtml(poster.htmlUrl)}" target="_blank" onclick="event.stopPropagation()">HTML</a>`
            : '';

        return `
        <div class="poster-card ${schemeClass}" data-name="${escapeHtml(poster.name)}">
            <div class="card-image-wrap" data-name="${escapeHtml(poster.name)}">
                <img src="${escapeHtml(poster.pngUrl)}" alt="${escapeHtml(poster.name)}" loading="lazy">
                <div class="card-overlay">
                    <span class="card-overlay-btn" data-action="lightbox">VIEW</span>
                    ${htmlBtn}
                </div>
            </div>
            <div class="card-body">
                <div class="card-name">// ${escapeHtml(poster.name)}</div>
                ${preview ? `<div class="card-content-preview">${escapeHtml(preview)}</div>` : ''}
            </div>
            <div class="card-footer">
                <span class="tag">${escapeHtml(poster.template || '?')}</span>
                ${poster.scheme ? `<span class="tag ${schemeTagClass}">${escapeHtml(poster.scheme)}</span>` : ''}
                ${poster.size ? `<span class="tag">${escapeHtml(poster.size)}</span>` : ''}
                <span class="tag-filesize">${formatSize(poster.fileSize)}</span>
            </div>
        </div>`;
    }

    function renderGrid() {
        const filtered = getFilteredPosters();

        el.statTotal.textContent = `${state.posters.length} POSTERS`;
        el.statShowing.textContent = `${filtered.length} SHOWING`;

        if (filtered.length === 0 && state.posters.length === 0) {
            el.empty.style.display = 'flex';
            el.grid.innerHTML = '';
            return;
        }

        el.empty.style.display = 'none';

        if (filtered.length === 0) {
            el.grid.innerHTML = '<div class="gallery-empty" style="display:flex"><span class="empty-text">// NO MATCHING POSTERS</span></div>';
            return;
        }

        el.grid.innerHTML = filtered.map(renderCard).join('');
    }

    // ── Data Loading ────────────────────────────────────────────────

    async function loadPosters() {
        try {
            const res = await fetch('/api/posters');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            state.posters = await res.json();
            el.loading.style.display = 'none';
            el.error.style.display = 'none';
            populateTemplateFilter();
            populateSizeFilter();
            renderGrid();
        } catch (err) {
            el.loading.style.display = 'none';
            el.error.style.display = 'flex';
            el.errorMsg.textContent = err.message;
        }
    }

    // ── SSE ─────────────────────────────────────────────────────────

    function connectSSE() {
        if (state.sse) state.sse.close();

        const es = new EventSource('/api/events');
        state.sse = es;

        es.onopen = () => {
            el.sseDot.className = 'sse-dot connected';
            el.sseLabel.textContent = 'LIVE';
        };

        es.onerror = () => {
            el.sseDot.className = 'sse-dot disconnected';
            el.sseLabel.textContent = 'RECONNECTING';
        };

        es.addEventListener('poster-update', (e) => {
            try {
                const poster = JSON.parse(e.data);
                const idx = state.posters.findIndex((p) => p.name === poster.name);
                if (idx >= 0) {
                    state.posters[idx] = poster;
                } else {
                    state.posters.unshift(poster);
                }
                populateTemplateFilter();
                populateSizeFilter();
                renderGrid();
            } catch { /* ignore */ }
        });
    }

    // ── Lightbox ────────────────────────────────────────────────────

    function openLightbox(posterName) {
        const poster = state.posters.find((p) => p.name === posterName);
        if (!poster) return;

        el.lightboxImage.src = poster.pngUrl;

        let metaHtml = '';

        metaHtml += `<div class="lightbox-meta-section">
            <span class="meta-label">// NAME</span>
            <span class="meta-value mono">${escapeHtml(poster.name)}</span>
        </div>`;

        if (poster.template) {
            metaHtml += `<div class="lightbox-meta-section">
                <span class="meta-label">// TEMPLATE</span>
                <span class="meta-value mono">${escapeHtml(poster.template)}</span>
            </div>`;
        }

        if (poster.scheme) {
            metaHtml += `<div class="lightbox-meta-section">
                <span class="meta-label">// SCHEME</span>
                <span class="meta-value mono">${escapeHtml(poster.scheme)}</span>
            </div>`;
        }

        if (poster.size) {
            metaHtml += `<div class="lightbox-meta-section">
                <span class="meta-label">// SIZE</span>
                <span class="meta-value mono">${escapeHtml(poster.size)}</span>
            </div>`;
        }

        if (poster.content) {
            const contentEntries = Object.entries(poster.content);
            for (const [key, val] of contentEntries) {
                if (!val) continue;
                const displayVal = typeof val === 'string' ? val : JSON.stringify(val);
                metaHtml += `<div class="lightbox-meta-section">
                    <span class="meta-label">// ${escapeHtml(key.toUpperCase())}</span>
                    <span class="meta-value">${escapeHtml(displayVal)}</span>
                </div>`;
            }
        }

        metaHtml += `<div class="lightbox-meta-section">
            <span class="meta-label">// FILE SIZE</span>
            <span class="meta-value mono">${formatSize(poster.fileSize)}</span>
        </div>`;

        if (poster.configFile) {
            metaHtml += `<div class="lightbox-meta-section">
                <span class="meta-label">// CONFIG</span>
                <span class="meta-value mono">configs/${escapeHtml(poster.configFile)}</span>
            </div>`;
        }

        let actionsHtml = `<div class="lightbox-meta-section"><span class="meta-label">// ACTIONS</span><div class="meta-actions">`;
        actionsHtml += `<a class="meta-action-btn" href="${escapeHtml(poster.pngUrl)}" target="_blank">OPEN PNG</a>`;
        if (poster.htmlUrl) {
            actionsHtml += `<a class="meta-action-btn" href="${escapeHtml(poster.htmlUrl)}" target="_blank">OPEN HTML</a>`;
        }
        actionsHtml += `</div></div>`;
        metaHtml += actionsHtml;

        el.lightboxMeta.innerHTML = metaHtml;
        el.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        el.lightbox.classList.remove('active');
        el.lightboxImage.src = '';
        el.lightboxMeta.innerHTML = '';
        document.body.style.overflow = '';
    }

    // ── Events ──────────────────────────────────────────────────────

    function bindEvents() {
        el.grid.addEventListener('click', (e) => {
            const overlayBtn = e.target.closest('.card-overlay-btn[data-action="lightbox"]');
            if (overlayBtn) {
                const wrap = overlayBtn.closest('.card-image-wrap');
                if (wrap) openLightbox(wrap.dataset.name);
                return;
            }

            const imageWrap = e.target.closest('.card-image-wrap');
            if (imageWrap && !e.target.closest('a')) {
                openLightbox(imageWrap.dataset.name);
                return;
            }
        });

        $('.lightbox-backdrop').addEventListener('click', closeLightbox);
        $('#lightbox-close').addEventListener('click', closeLightbox);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });

        $$('#filter-scheme .filter-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                $$('#filter-scheme .filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.filterScheme = btn.dataset.value;
                renderGrid();
            });
        });

        $('#filter-size').querySelector('[data-value="all"]').addEventListener('click', () => {
            $$('#filter-size .filter-btn').forEach(b => b.classList.remove('active'));
            $('#filter-size').querySelector('[data-value="all"]').classList.add('active');
            state.filterSize = 'all';
            renderGrid();
        });

        el.filterTemplate.addEventListener('change', () => {
            state.filterTemplate = el.filterTemplate.value;
            renderGrid();
        });
    }

    // ── Init ────────────────────────────────────────────────────────

    function init() {
        el.grid = $('#gallery-grid');
        el.loading = $('#loading');
        el.empty = $('#empty');
        el.error = $('#error');
        el.errorMsg = $('#error-msg');
        el.sseDot = $('#sse-dot');
        el.sseLabel = $('#sse-label');
        el.statTotal = $('#stat-total');
        el.statShowing = $('#stat-showing');
        el.lightbox = $('#lightbox');
        el.lightboxImage = $('#lightbox-image');
        el.lightboxMeta = $('#lightbox-meta');
        el.footerPort = $('#footer-port');
        el.filterTemplate = $('#filter-template');

        el.footerPort.textContent = `localhost:${location.port || '3210'}`;

        bindEvents();
        loadPosters();
        connectSSE();
    }

    document.addEventListener('DOMContentLoaded', init);

    return { loadPosters, state };
})();
