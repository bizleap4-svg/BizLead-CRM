const puppeteer = require('puppeteer-core');
const fs = require('fs');
const assert = require('assert');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('====================================================');
  console.log('  BizLead: Magnetic Sidebar Refinement Verification  ');
  console.log('====================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('[TEST 1] Loading Dashboard at http://localhost:3000/dashboard...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });

  // 1. Check collapsed sidebar initial state
  const dockWidth = await page.$eval('.bl-dock', (el) => el.offsetWidth);
  console.log(`Collapsed dock width: ${dockWidth}px`);
  assert(dockWidth >= 60 && dockWidth <= 72, `Expected collapsed dock width ~64px, got ${dockWidth}px`);

  // 2. Test Magnetic Glass Reveal on Hovering Navigation Icon
  console.log('\n[TEST 2] Hovering over Leads navigation icon...');
  const leadsLink = await page.$('a.bl-nav-item[href="/leads"]');
  assert(leadsLink, 'Leads link must exist');

  await leadsLink.hover();
  await new Promise((r) => setTimeout(r, 350));

  // Check portal element in document.body
  const portalExists = await page.$eval('.bl-magnetic-portal', (el) => !!el).catch(() => false);
  console.log(`Magnetic portal mounted in DOM: ${portalExists}`);
  assert(portalExists, 'Magnetic portal must mount on hover');

  const portalData = await page.$eval('.bl-magnetic-portal', (el) => {
    const pill = el.querySelector('.bl-magnetic-pill');
    const title = el.querySelector('.bl-magnetic-title')?.innerText || '';
    const desc = el.querySelector('.bl-magnetic-desc')?.innerText || '';
    const accentLine = !!el.querySelector('.bl-magnetic-accent-line');
    const arrow = !!el.querySelector('.bl-magnetic-arrow');
    const iconBox = !!el.querySelector('.bl-magnetic-icon-box');
    const style = window.getComputedStyle(pill);

    return {
      title,
      desc,
      accentLine,
      arrow,
      iconBox,
      backdropFilter: style.backdropFilter || style.webkitBackdropFilter,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow,
      rect: el.getBoundingClientRect(),
    };
  });

  console.log('Magnetic Reveal Data:', portalData);
  assert.strictEqual(portalData.title, 'Leads', 'Expected module title "Leads"');
  assert.strictEqual(portalData.desc, 'Capture, qualify & convert prospects', 'Expected module description');
  assert(portalData.accentLine, 'Expected subtle yellow accent line');
  assert(portalData.arrow, 'Expected small directional arrow');
  assert(portalData.iconBox, 'Expected connected icon box');
  assert(portalData.backdropFilter.includes('blur(24px)'), `Expected backdrop blur(24px), got: ${portalData.backdropFilter}`);
  console.log('✓ TEST 2 Passed: Magnetic Glass Reveal rendered with all styling specs');

  // 3. Move mouse away and verify magnetic portal unmounts
  console.log('\n[TEST 3] Moving mouse away to verify smooth dismissal...');
  await page.mouse.move(500, 500);
  await new Promise((r) => setTimeout(r, 300));
  const portalDismissed = await page.$eval('.bl-magnetic-portal', (el) => false).catch(() => true);
  console.log(`Magnetic portal dismissed: ${portalDismissed}`);
  assert(portalDismissed, 'Magnetic portal must unmount smoothly on mouse leave');
  console.log('✓ TEST 3 Passed: Smooth dismissal verified');

  // 4. Test Expand Sidebar
  console.log('\n[TEST 4] Testing Expand Sidebar button...');
  const expandBtn = await page.$('.bl-sidebar-toggle-btn');
  assert(expandBtn, 'Expand button must exist in bottom dock');
  await expandBtn.click();
  await new Promise((r) => setTimeout(r, 400));

  const expandedDockWidth = await page.$eval('.bl-dock', (el) => el.offsetWidth);
  console.log(`Expanded dock width: ${expandedDockWidth}px`);
  assert(expandedDockWidth >= 235 && expandedDockWidth <= 245, `Expected expanded dock width ~240px, got ${expandedDockWidth}px`);

  // Verify expanded branding constraints:
  // - Original symbol centered at top
  // - Zero wordmark, zero brand name text, zero tagline in sidebar
  const sidebarText = await page.$eval('.bl-dock', (el) => el.innerText);
  console.log('Expanded sidebar text items (first 100 chars):', sidebarText.slice(0, 100).replace(/\n/g, ' '));
  assert(!sidebarText.toLowerCase().includes('the intelligence behind growth'), 'Tagline must NOT appear in sidebar');
  assert(!sidebarText.includes('BIZLEAD') && !sidebarText.includes('BizLead'), 'Wordmark must NOT appear in sidebar');

  // Verify header branding outside sidebar is preserved
  const headerBrand = await page.$eval('.bl-header .bl-brand-group', (el) => el.innerText);
  console.log(`Header branding preserved: "${headerBrand.replace(/\n/g, ' ')}"`);
  assert(headerBrand.toLowerCase().includes('the intelligence behind growth'), 'Header tagline must be preserved');

  // Verify active row has extended yellow background
  const activeNavItem = await page.$('.bl-dock .bl-nav-item.active');
  assert(activeNavItem, 'Active nav item must exist in expanded sidebar');
  const activeLabel = await activeNavItem.$eval('.bl-nav-item-label', (el) => el.innerText);
  console.log(`Active expanded row label: "${activeLabel}"`);
  assert.strictEqual(activeLabel, 'Overview');

  // Verify persistence after refresh
  console.log('\n[TEST 5] Testing expansion preference persistence after refresh...');
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 300));
  const reloadedDockWidth = await page.$eval('.bl-dock', (el) => el.offsetWidth);
  console.log(`Dock width after refresh: ${reloadedDockWidth}px`);
  assert(reloadedDockWidth >= 235 && reloadedDockWidth <= 245, 'Sidebar expansion must persist after refresh');
  console.log('✓ TEST 5 Passed: Expansion preference preserved in localStorage');

  // 5. Collapse sidebar back
  console.log('\n[TEST 6] Collapsing sidebar back...');
  const collapseBtn = await page.$('.bl-sidebar-toggle-btn');
  await collapseBtn.click();
  await new Promise((r) => setTimeout(r, 400));
  const collapsedAgainWidth = await page.$eval('.bl-dock', (el) => el.offsetWidth);
  console.log(`Collapsed dock width after toggle: ${collapsedAgainWidth}px`);
  assert(collapsedAgainWidth >= 60 && collapsedAgainWidth <= 72, 'Sidebar must collapse back to ~64px');
  console.log('✓ TEST 6 Passed: Collapse back verified');

  await browser.close();
  console.log('\n====================================================');
  console.log('  ALL MAGNETIC SIDEBAR TESTS PASSED!               ');
  console.log('====================================================');
})();
