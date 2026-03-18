import { existsSync } from 'fs';
import { execSync } from 'child_process';

const CHROME_PATHS_WIN = [
  process.env['PROGRAMFILES'] + '\\Google\\Chrome\\Application\\chrome.exe',
  process.env['PROGRAMFILES(X86)'] + '\\Google\\Chrome\\Application\\chrome.exe',
  process.env['LOCALAPPDATA'] + '\\Google\\Chrome\\Application\\chrome.exe',
  process.env['PROGRAMFILES'] + '\\Microsoft\\Edge\\Application\\msedge.exe',
  process.env['PROGRAMFILES(X86)'] + '\\Microsoft\\Edge\\Application\\msedge.exe',
];

const CHROME_PATHS_MAC = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];

const CHROME_PATHS_LINUX = [
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/microsoft-edge',
  '/snap/bin/chromium',
];

function findBrowserPath() {
  const platform = process.platform;
  let candidates;

  if (platform === 'win32') {
    candidates = CHROME_PATHS_WIN;
  } else if (platform === 'darwin') {
    candidates = CHROME_PATHS_MAC;
  } else {
    candidates = CHROME_PATHS_LINUX;
  }

  for (const p of candidates) {
    if (p && existsSync(p)) return p;
  }

  if (platform === 'linux') {
    try {
      const result = execSync('which google-chrome || which chromium || which chromium-browser', { encoding: 'utf-8' }).trim();
      if (result) return result;
    } catch (_) { /* not found */ }
  }

  return null;
}

let browserInstance = null;

export async function launchBrowser(customPath) {
  if (browserInstance) return browserInstance;

  const puppeteer = await import('puppeteer-core');
  const executablePath = customPath || findBrowserPath();

  if (!executablePath) {
    throw new Error(
      'Could not find Chrome/Edge on this system.\n' +
      'Install Chrome or Edge, or pass --browser-path <path> to specify the executable.'
    );
  }

  browserInstance = await puppeteer.default.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  return browserInstance;
}

export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

export async function renderPage(html, { width, height, browserPath } = {}) {
  const browser = await launchBrowser(browserPath);
  const page = await browser.newPage();

  if (width && height) {
    await page.setViewport({ width, height, deviceScaleFactor: 2 });
  }

  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
  return page;
}
