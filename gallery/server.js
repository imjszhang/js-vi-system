import { createServer } from 'node:http';
import { existsSync, statSync, readdirSync, readFileSync, watch, mkdirSync, createReadStream } from 'node:fs';
import { join, extname, basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const KNOWN_SIZES = ['a4', 'square', 'wechat', 'banner', 'story', 'thumb'];
const KNOWN_SCHEMES = ['dark', 'daylight', 'minimal'];

const sseClients = new Set();

// ── Static file serving ──────────────────────────────────────────────

function serveFile(res, filePath) {
  const ext = extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const stats = statSync(filePath);
    if (!stats.isFile()) throw new Error('not a file');
    res.writeHead(200, { 'Content-Type': mime, 'Content-Length': stats.size });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404);
    res.end('Not Found');
  }
}

function serveHTMLWithTitle(res, filePath, projectTitle) {
  try {
    let html = readFileSync(filePath, 'utf-8');
    html = html.replace(/\{\{PROJECT_TITLE\}\}/g, projectTitle);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } catch {
    res.writeHead(404);
    res.end('Not Found');
  }
}

// ── Config-based poster index ────────────────────────────────────────

function readJsonSafe(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function buildConfigIndex(configsDir) {
  const index = new Map();
  if (!existsSync(configsDir)) return index;

  const files = readdirSync(configsDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const data = readJsonSafe(join(configsDir, file));
    if (!data?.posters) continue;
    for (const poster of data.posters) {
      if (!poster.outputs) continue;
      for (const out of poster.outputs) {
        if (!out.path) continue;
        const name = basename(out.path, extname(out.path));
        index.set(name, {
          configFile: file,
          template: poster.template || null,
          scheme: poster.scheme || null,
          size: poster.size || null,
          content: poster.content || {},
        });
      }
    }
  }
  return index;
}

function parseFilename(name) {
  const parts = name.split('-');
  let size = null;
  let scheme = null;

  for (let i = parts.length - 1; i >= 0; i--) {
    if (!size && KNOWN_SIZES.includes(parts[i])) { size = parts[i]; continue; }
    if (!scheme && KNOWN_SCHEMES.includes(parts[i])) { scheme = parts[i]; break; }
  }

  let template = name;
  if (scheme) {
    const idx = name.lastIndexOf(`-${scheme}`);
    if (idx > 0) template = name.substring(0, idx);
  }

  return { template, scheme, size };
}

function scanPosters(outputDir, configsDir) {
  if (!existsSync(outputDir)) return [];

  const configIndex = buildConfigIndex(configsDir);
  const files = readdirSync(outputDir);
  const pngFiles = files.filter(f => f.endsWith('.png'));
  const htmlSet = new Set(files.filter(f => f.endsWith('.html')).map(f => basename(f, '.html')));

  const posters = [];
  for (const png of pngFiles) {
    const name = basename(png, '.png');
    const stat = statSync(join(outputDir, png));
    const hasHtml = htmlSet.has(name);
    const configMeta = configIndex.get(name);
    const parsed = parseFilename(name);

    posters.push({
      name,
      pngUrl: `/output/${png}`,
      htmlUrl: hasHtml ? `/output/${name}.html` : null,
      fileSize: stat.size,
      modifiedAt: stat.mtime.toISOString(),
      template: configMeta?.template || parsed.template,
      scheme: configMeta?.scheme || parsed.scheme,
      size: configMeta?.size || parsed.size,
      content: configMeta?.content || null,
      configFile: configMeta?.configFile || null,
    });
  }

  posters.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
  return posters;
}

// ── SSE ──────────────────────────────────────────────────────────────

function sseBroadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try { client.write(payload); } catch { sseClients.delete(client); }
  }
}

const recentEvents = new Map();

function debounceEvent(key, fn, delay = 800) {
  if (recentEvents.has(key)) clearTimeout(recentEvents.get(key));
  recentEvents.set(key, setTimeout(() => {
    recentEvents.delete(key);
    fn();
  }, delay));
}

function startWatcher(outputDir, configsDir) {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  try {
    watch(outputDir, (_, filename) => {
      if (!filename || !filename.endsWith('.png')) return;

      debounceEvent(filename, () => {
        const filePath = join(outputDir, filename);
        if (!existsSync(filePath)) return;

        const name = basename(filename, '.png');
        const configIndex = buildConfigIndex(configsDir);
        const configMeta = configIndex.get(name);
        const parsed = parseFilename(name);
        const stat = statSync(filePath);
        const hasHtml = existsSync(join(outputDir, name + '.html'));

        sseBroadcast('poster-update', {
          name,
          pngUrl: `/output/${filename}`,
          htmlUrl: hasHtml ? `/output/${name}.html` : null,
          fileSize: stat.size,
          modifiedAt: stat.mtime.toISOString(),
          template: configMeta?.template || parsed.template,
          scheme: configMeta?.scheme || parsed.scheme,
          size: configMeta?.size || parsed.size,
          content: configMeta?.content || null,
          configFile: configMeta?.configFile || null,
        });
      });
    });
  } catch (err) {
    console.error('Failed to start file watcher:', err.message);
  }
}

// ── Public API ───────────────────────────────────────────────────────

export function startGalleryServer({ outputDir, configsDir, port, projectTitle }) {
  const galleryDir = __dirname;

  const server = createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    const pathname = url.pathname;

    res.setHeader('Access-Control-Allow-Origin', '*');

    if (pathname === '/api/posters') {
      const posters = scanPosters(outputDir, configsDir);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(posters));
      return;
    }

    if (pathname === '/api/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
      res.write('retry: 3000\n\n');
      sseClients.add(res);
      req.on('close', () => sseClients.delete(res));
      return;
    }

    if (pathname.startsWith('/output/')) {
      const rel = pathname.slice('/output/'.length);
      const filePath = join(outputDir, rel);
      if (!filePath.startsWith(outputDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      serveFile(res, filePath);
      return;
    }

    if (pathname === '/' || pathname === '/index.html') {
      serveHTMLWithTitle(res, join(galleryDir, 'index.html'), projectTitle);
      return;
    }

    const filePath = join(galleryDir, pathname);
    if (!filePath.startsWith(galleryDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    serveFile(res, filePath);
  });

  startWatcher(outputDir, configsDir);

  server.listen(port, () => {
    console.log(`\n  Poster Gallery: http://localhost:${port}\n`);
  });
}
