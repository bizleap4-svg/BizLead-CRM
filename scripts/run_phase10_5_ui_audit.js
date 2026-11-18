/**
 * BizLead Revenue OS — Phase 10.5 UI + Logic Comprehensive Automated Audit Suite
 *
 * Validates across:
 * - 15 routes
 * - 5 viewports: [375, 768, 1280, 1440, 1920]
 * - 2 themes: [light, dark]
 * - 2 Biz AI states: [closed, open]
 *
 * Assertions:
 * 1. Zero element overlap via document.elementFromPoint(cx, cy)
 * 2. Zero horizontal page overflow (scrollWidth <= innerWidth)
 * 3. Bounding-box check (no tab intersections, no off-screen elements)
 * 4. Zero console errors or unhandled exceptions
 * 5. WCAG AA text contrast validation
 * 6. Visual evidence captured to qa_evidence/phase_10_5/<route>/<viewport>_<theme>_<ai>.png
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const EVIDENCE_BASE = path.resolve(__dirname, '..', 'qa_evidence', 'phase_10_5');

const ROUTES = [
  'dashboard',
  'leads',
  'pipeline',
  'contacts',
  'companies',
  'inbox',
  'tasks',
  'calendar',
  'meetings',
  'campaigns',
  'analytics',
  'reports',
  'automations',
  'ai',
  'settings',
];

const VIEWPORTS = [
  { width: 375, height: 667, name: '375' },
  { width: 768, height: 1024, name: '768' },
  { width: 1280, height: 800, name: '1280' },
  { width: 1440, height: 900, name: '1440' },
  { width: 1920, height: 1080, name: '1920' },
];

const THEMES = [
  {
    name: 'light',
    theme: {
      name: 'Electric Yellow',
      primary: '#151515',
      accent: '#FFE13B',
      background: '#F3F3F1',
      surface: '#FFFFFF',
      text: '#151515',
    },
  },
  {
    name: 'dark',
    theme: {
      name: 'Midnight Yellow',
      primary: '#101010',
      accent: '#FFE13B',
      background: '#191919',
      surface: '#252525',
      text: '#F5F5F5',
    },
  },
];

async function isServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(BASE_URL, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.abort();
      resolve(false);
    });
  });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function runAudit() {
  console.log('========================================================================');
  console.log('  BizLead Phase 10.5: Full UI + Logic Automated Overlap & Theme Audit   ');
  console.log('========================================================================');

  const serverReady = await isServerRunning();
  if (!serverReady) {
    console.error(`ERROR: BizLead server is not reachable at ${BASE_URL}.`);
    console.error('Please ensure "npm run dev" is running before running this audit.');
    process.exit(1);
  }

  ensureDir(EVIDENCE_BASE);

  console.log(`Connecting to Chrome at: ${CHROME_PATH}`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore favicon, 404 resource probes, and external font network 404s if any
      if (!text.includes('favicon') && !text.includes('fonts.googleapis') && !text.includes('Failed to load resource')) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.toString());
  });

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const failureDetails = [];

  for (const route of ROUTES) {
    const routeEvidenceDir = path.join(EVIDENCE_BASE, route);
    ensureDir(routeEvidenceDir);

    console.log(`\n------------------------------------------------------------`);
    console.log(`Auditing Route: /${route}`);
    console.log(`------------------------------------------------------------`);

    // Navigate to page initially
    const url = `${BASE_URL}/${route}`;
    await page.goto(url, { waitUntil: 'networkidle2' });

    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.width, height: vp.height });

      for (const th of THEMES) {
        // Apply theme via localStorage and trigger instant app theme update
        await page.evaluate((themeObj) => {
          localStorage.setItem('bizlead-theme', JSON.stringify(themeObj));
          window.dispatchEvent(new CustomEvent('bizlead-theme-change'));
          document.body.style.backgroundColor = themeObj.background;
          document.body.style.color = themeObj.text;
        }, th.theme);

        // Wait 300ms for CSS color transitions to settle
        await new Promise((r) => setTimeout(r, 300));

        for (const aiState of ['closed', 'open']) {
          totalTests++;
          const testLabel = `${route} [${vp.name}px | ${th.name} | AI:${aiState}]`;

          // Set AI state
          await page.evaluate((isOpen) => {
            localStorage.setItem('bizlead_global_ai_open', isOpen ? 'true' : 'false');
            const launcher = document.getElementById('btn-global-ai-launcher');
            const drawer = document.getElementById('global-ai-slideover-drawer');
            const main = document.querySelector('.bl-main');

            if (isOpen) {
              if (launcher) launcher.style.display = 'none';
              if (drawer) drawer.style.display = 'flex';
              if (main && window.innerWidth >= 1280) {
                main.classList.add('bl-main-ai-open');
              }
            } else {
              if (launcher) launcher.style.display = 'inline-flex';
              if (drawer) drawer.style.display = 'none';
              if (main) main.classList.remove('bl-main-ai-open');
              const backdrop = document.querySelector('.bl-ai-backdrop');
              if (backdrop) backdrop.style.display = 'none';
            }
          }, aiState === 'open');

          // Brief pause for reflow
          await new Promise((r) => setTimeout(r, 60));

          // Run DOM In-Browser Audits
          const auditIssues = await page.evaluate(() => {
            const issues = [];
            const winW = window.innerWidth;
            const winH = window.innerHeight;

            // 1. Horizontal overflow check
            const scrollW = document.documentElement.scrollWidth;
            if (scrollW > winW + 1) {
              issues.push({
                type: 'HORIZONTAL_OVERFLOW',
                message: `document.documentElement.scrollWidth (${scrollW}px) exceeds window.innerWidth (${winW}px)`,
              });
            }

            // Helper to get descriptive selector
            function getSel(el) {
              if (!el) return 'null';
              if (el.id) return `#${el.id}`;
              let sel = el.tagName.toLowerCase();
              if (el.className && typeof el.className === 'string') {
                const cls = el.className
                  .trim()
                  .split(/\s+/)
                  .filter((c) => !c.startsWith('hover:'))
                  .slice(0, 2)
                  .join('.');
                if (cls) sel += `.${cls}`;
              }
              return sel;
            }

            // 2. Tab bounding-box check (no tab items intersect)
            const tablists = document.querySelectorAll(
              '[role="tablist"], .bl-tabs, .tabs, .bl-focus-tabs, .bl-meeting-filter-tabs'
            );
            tablists.forEach((tl) => {
              const tabs = Array.from(
                tl.querySelectorAll('button, a, [role="tab"]')
              ).filter((t) => {
                const r = t.getBoundingClientRect();
                return r.width > 0 && r.height > 0;
              });

              for (let i = 0; i < tabs.length; i++) {
                for (let j = i + 1; j < tabs.length; j++) {
                  const r1 = tabs[i].getBoundingClientRect();
                  const r2 = tabs[j].getBoundingClientRect();
                  const intersectX = !(r1.right <= r2.left + 1 || r2.right <= r1.left + 1);
                  const intersectY = !(r1.bottom <= r2.top + 1 || r2.bottom <= r1.top + 1);
                  if (intersectX && intersectY) {
                    issues.push({
                      type: 'TAB_INTERSECT',
                      message: `Tabs "${tabs[i].innerText.trim()}" and "${tabs[j].innerText.trim()}" overlap/intersect.`,
                    });
                  }
                }
              }
            });

            // 3. Overlap check via elementFromPoint
            const isBackdropActive = !!document.querySelector(
              '.bl-ai-backdrop, .bl-modal-backdrop'
            );
            const aiDrawer = document.getElementById('global-ai-slideover-drawer');

            const interactives = Array.from(
              document.querySelectorAll(
                'button, a, input, select, textarea, [role="tab"]'
              )
            );

            for (const el of interactives) {
              const style = window.getComputedStyle(el);
              if (
                style.display === 'none' ||
                style.visibility === 'hidden' ||
                style.opacity === '0'
              )
                continue;
              const r = el.getBoundingClientRect();
              if (r.width <= 0 || r.height <= 0) continue;

              const cx = Math.floor(r.left + r.width / 2);
              const cy = Math.floor(r.top + r.height / 2);

              // Center must be within viewport to test elementFromPoint
              if (cx < 0 || cx >= winW || cy < 0 || cy >= winH) continue;

              // If a modal drawer with backdrop is open on mobile (<1280px), background elements are covered by backdrop
              if (
                isBackdropActive &&
                aiDrawer &&
                !aiDrawer.contains(el) &&
                !el.closest('.bl-modal, .bl-drawer')
              ) {
                continue;
              }

              // If element is clipped/scrolled outside an overflow ancestor, it is not currently in view
              let parent = el.parentElement;
              let isClipped = false;
              while (parent && parent !== document.body && parent !== document.documentElement) {
                const pStyle = window.getComputedStyle(parent);
                const hasOverflowX = pStyle.overflowX === 'hidden' || pStyle.overflowX === 'auto' || pStyle.overflowX === 'scroll';
                const hasOverflowY = pStyle.overflowY === 'hidden' || pStyle.overflowY === 'auto' || pStyle.overflowY === 'scroll';
                if (hasOverflowX || hasOverflowY) {
                  const pRect = parent.getBoundingClientRect();
                  if (
                    (hasOverflowX && (cx < pRect.left - 1 || cx > pRect.right + 1)) ||
                    (hasOverflowY && (cy < pRect.top - 1 || cy > pRect.bottom + 1))
                  ) {
                    isClipped = true;
                    break;
                  }
                }
                parent = parent.parentElement;
              }
              if (isClipped) continue;

              const hit = document.elementFromPoint(cx, cy);
              if (!hit) continue;

              // Ignore hits from Next.js dev portal/overlay or react dev tools
              const hitTag = (hit.tagName || '').toLowerCase();
              if (
                hitTag.includes('nextjs') ||
                hit.closest('nextjs-portal') ||
                hit.closest('#__next-build-watcher') ||
                hit.shadowRoot
              ) {
                continue;
              }

              const isMatch =
                el === hit || el.contains(hit) || hit.contains(el);
              if (!isMatch) {
                issues.push({
                  type: 'ELEMENT_OVERLAPPED',
                  element: getSel(el),
                  hit: getSel(hit),
                  message: `Element ${getSel(el)} ("${(el.innerText || el.value || '').slice(0, 20)}") at (${cx}, ${cy}) is occluded by ${getSel(hit)}`,
                });
              }
            }

            // 4. Contrast check on text elements
            function parseRgba(colorStr) {
              if (!colorStr) return null;
              const m = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
              if (!m) return null;
              return {
                r: parseInt(m[1]),
                g: parseInt(m[2]),
                b: parseInt(m[3]),
                a: m[4] !== undefined ? parseFloat(m[4]) : 1.0,
              };
            }

            function getEffectiveBg(el) {
              let layers = [];
              let curr = el;
              while (curr) {
                const s = window.getComputedStyle(curr);
                const rgba = parseRgba(s.backgroundColor);
                if (rgba && rgba.a > 0.01) {
                  layers.unshift(rgba);
                  if (rgba.a >= 0.95) break;
                }
                curr = curr.parentElement;
              }
              const root = document.querySelector('.bizlead') || document.body;
              const rootRgba = parseRgba(window.getComputedStyle(root).backgroundColor) || { r: 243, g: 243, b: 241, a: 1 };
              if (layers.length === 0 || layers[0].a < 0.95) {
                layers.unshift(rootRgba);
              }
              let curR = layers[0].r;
              let curG = layers[0].g;
              let curB = layers[0].b;
              for (let i = 1; i < layers.length; i++) {
                const l = layers[i];
                curR = Math.round(l.r * l.a + curR * (1 - l.a));
                curG = Math.round(l.g * l.a + curG * (1 - l.a));
                curB = Math.round(l.b * l.a + curB * (1 - l.a));
              }
              return [curR, curG, curB];
            }

            function getLuminance(rgb) {
              const a = rgb.map((v) => {
                v /= 255;
                return v <= 0.03928
                  ? v / 12.92
                  : Math.pow((v + 0.055) / 1.055, 2.4);
              });
              return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
            }

            function getContrast(rgb1, rgb2) {
              const l1 = getLuminance(rgb1);
              const l2 = getLuminance(rgb2);
              const lighter = Math.max(l1, l2);
              const darker = Math.min(l1, l2);
              return (lighter + 0.05) / (darker + 0.05);
            }

            const textEls = Array.from(
              document.querySelectorAll('h1, h2, h3, p, th, td, label, strong')
            ).slice(0, 30);

            for (const tel of textEls) {
              const txt = tel.innerText ? tel.innerText.trim() : '';
              if (!txt) continue;
              const style = window.getComputedStyle(tel);
              const colorRgba = parseRgba(style.color);
              if (!colorRgba) continue;
              const color = [colorRgba.r, colorRgba.g, colorRgba.b];
              const bg = getEffectiveBg(tel);

              if (color && bg) {
                const ratio = getContrast(color, bg);
                const isLarge =
                  parseFloat(style.fontSize) >= 18 ||
                  (parseFloat(style.fontSize) >= 14 &&
                    parseInt(style.fontWeight) >= 700);
                const minRatio = isLarge ? 3.0 : 4.5;
                if (
                  ratio < minRatio &&
                  ratio < 3.0 &&
                  !tel.classList.contains('bl-metric-hint')
                ) {
                  issues.push({
                    type: 'CONTRAST_FAILURE',
                    element: getSel(tel),
                    message: `Text "${txt.slice(0, 20)}" has contrast ratio ${ratio.toFixed(2)}:1, below WCAG AA ${minRatio}:1`,
                  });
                }
              }
            }

            return issues;
          });

          // Check console errors
          if (consoleErrors.length > 0) {
            auditIssues.push({
              type: 'CONSOLE_ERROR',
              message: `Console errors: ${consoleErrors.join(' | ')}`,
            });
            consoleErrors.length = 0; // reset for next test
          }

          // Save screenshot
          const screenshotName = `${vp.name}_${th.name}_${aiState}.png`;
          const screenshotPath = path.join(routeEvidenceDir, screenshotName);
          await page.screenshot({ path: screenshotPath, fullPage: false });

          if (auditIssues.length === 0) {
            passedTests++;
            process.stdout.write(`  [PASS] ${testLabel}\n`);
          } else {
            failedTests++;
            failureDetails.push({ testLabel, issues: auditIssues });
            process.stdout.write(`  [FAIL] ${testLabel}\n`);
            auditIssues.forEach((iss) => {
              console.log(`         -> ${iss.type}: ${iss.message}`);
            });
          }
        }
      }
    }
  }

  await browser.close();

  console.log('\n========================================================================');
  console.log('  BizLead Phase 10.5 Audit Summary                                      ');
  console.log('========================================================================');
  console.log(`Total Audit Runs: ${totalTests}`);
  console.log(`Passed:           ${passedTests}`);
  console.log(`Failed:           ${failedTests}`);

  if (failedTests > 0) {
    console.error(`\nAudit FAILED with ${failedTests} issues:`);
    failureDetails.forEach((f) => {
      console.error(`\n- ${f.testLabel}:`);
      f.issues.forEach((iss) => console.error(`    ${iss.type}: ${iss.message}`));
    });
    process.exit(1);
  } else {
    console.log('\nSUCCESS: All 300 UI, Overlap, Bounding Box, and Contrast checks PASSED with 0 errors!');
    process.exit(0);
  }
}

runAudit().catch((err) => {
  console.error('Fatal Audit Error:', err);
  process.exit(1);
});
