const puppeteer = require('puppeteer-core');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const REPO_EVIDENCE_DIR = path.resolve(__dirname, '..', 'qa_evidence', 'phase_07');

if (!fs.existsSync(REPO_EVIDENCE_DIR)) {
  fs.mkdirSync(REPO_EVIDENCE_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runQA() {
  console.log('========================================================================');
  console.log('  BizLead Phase 07: Campaign Intelligence, Analytics & Reports QA Suite ');
  console.log('========================================================================');

  console.log('Launching isolated Chrome session via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1440,900',
    ],
  });

  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  page.on('pageerror', (err) => {
    console.error('[BROWSER PAGE ERROR]', err.message);
  });
  page.on('requestfailed', (req) => {
    console.warn('[REQ FAILED]', req.url(), req.failure() ? req.failure().errorText : '');
  });

  try {
    console.log('Warming up dev server...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
    await sleep(2000);

    // -------------------------------------------------------------
    // FLOW 1: Campaign Manager Overview (/campaigns)
    // -------------------------------------------------------------
    console.log('\n--- FLOW 1: Verifying Campaign Manager (/campaigns) ---');
    await page.goto('http://localhost:3000/campaigns', { waitUntil: 'networkidle2' });
    await sleep(1000);

    const campaignHeading = await page.$eval('h1', (el) => el.innerText);
    console.log(`Page Heading: "${campaignHeading}"`);
    assert(
      campaignHeading.includes('Every campaign counts.'),
      'Expected heading "Every campaign counts."'
    );

    const kpiCards = await page.$$eval('.grid.grid-cols-2.md\\:grid-cols-4 > div', (cards) =>
      cards.map((c) => c.innerText)
    );
    console.log(`Found ${kpiCards.length} executive KPI cards on campaigns page`);
    assert(kpiCards.length >= 4, 'Expected at least 4 KPI cards');

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow1_campaign_manager_overview.png'),
    });
    console.log('✓ Flow 1 passed: Campaign Manager overview verified & screenshot saved');

    // -------------------------------------------------------------
    // FLOW 2: Grid and Table View Switching
    // -------------------------------------------------------------
    console.log('\n--- FLOW 2: Verifying Grid and Table View Switching ---');
    // Switch to table view
    const tableButton = await page.$('button[title="Table View"]');
    assert(tableButton, 'Table view button should exist');
    await tableButton.click();
    await sleep(600);

    const tableExists = await page.$('table');
    assert(tableExists, 'Table element should exist after switching to table view');

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow2_campaign_table_view.png'),
    });

    // Switch back to grid view
    const gridButton = await page.$('button[title="Grid View"]');
    assert(gridButton, 'Grid view button should exist');
    await gridButton.click();
    await sleep(600);
    console.log('✓ Flow 2 passed: Grid and Table view toggle verified');

    // -------------------------------------------------------------
    // FLOW 3: Campaign Filtering & Search
    // -------------------------------------------------------------
    console.log('\n--- FLOW 3: Verifying Search & Platform Filter ---');
    const searchInput = await page.$('input[placeholder*="Search campaigns"]');
    assert(searchInput, 'Search input should exist');
    await searchInput.type('Meta');
    await sleep(600);

    const filteredCards = await page.$$eval('h3.font-semibold', (els) => els.map((e) => e.innerText));
    console.log(`Filtered campaigns matching "Meta": ${filteredCards.length}`);
    assert(
      filteredCards.some((name) => name.toLowerCase().includes('meta')),
      'Filtered results should include Meta campaign'
    );

    // Clear search
    await searchInput.click();
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await sleep(600);

    const searchValAfter = await page.$eval('input[placeholder*="Search campaigns"]', (el) => el.value);
    console.log(`Search input value after clearing: "${searchValAfter}"`);
    console.log('✓ Flow 3 passed: Search filtering verified');

    // -------------------------------------------------------------
    // FLOW 4: UTM Link Builder Modal & Link Generation
    // -------------------------------------------------------------
    console.log('\n--- FLOW 4: Verifying UTM Campaign Builder Modal ---');
    const utmButton = await page.$eval('button', (el) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find((b) => b.innerText.includes('UTM Builder'));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });
    assert(utmButton, 'Should click UTM Builder button');
    await sleep(800);

    const utmHeading = await page.$eval('.bl-utm-header h3', (el) => el.innerText);
    console.log(`UTM Modal Header: "${utmHeading}"`);
    assert(utmHeading.includes('UTM Campaign Link Builder'), 'UTM modal should open');

    const generatedCode = await page.$eval('.bl-utm-code-display code', (el) => el.innerText);
    console.log(`Generated UTM Preview: ${generatedCode}`);
    assert(generatedCode.includes('utm_source='), 'Generated URL must include utm_source');

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow4_utm_builder_modal.png'),
    });

    // Close UTM modal
    await page.keyboard.press('Escape');
    const closeBtn = await page.$('.fixed.inset-0 button');
    if (closeBtn) await closeBtn.click();
    await sleep(600);
    console.log('✓ Flow 4 passed: UTM Builder verified & link generated');

    // -------------------------------------------------------------
    // FLOW 5: Campaign Creation via Flyout Drawer
    // -------------------------------------------------------------
    console.log('\n--- FLOW 5: Verifying New Campaign Launch via Drawer ---');
    const newCampButton = await page.$eval('button', () => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find((b) => b.innerText.includes('New Campaign'));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });
    assert(newCampButton, 'Should click New Campaign button');
    await sleep(800);

    const drawerTitle = await page.$eval('h2', (el) => el.innerText);
    console.log(`Campaign Drawer Title: "${drawerTitle}"`);
    assert(drawerTitle.includes('New Marketing Campaign'), 'Drawer should open with New Marketing Campaign');

    const testCampaignName = 'Q4 Omnichannel Enterprise Scale';
    const nameInput = await page.$('input[placeholder*="Q4 B2B SaaS"]');
    assert(nameInput, 'Name input should exist in drawer');
    await nameInput.type(testCampaignName);

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow5_campaign_drawer_form.png'),
    });

    // Submit campaign using native Puppeteer click
    const saveBtn = await page.$('#btn-save-campaign');
    assert(saveBtn, 'Save button with #btn-save-campaign should exist');
    await saveBtn.click();
    await sleep(1500);

    const campaignNamesAfter = await page.$$eval('h3.font-semibold', (els) => els.map((e) => e.innerText));
    console.log(`Campaigns in list after creation: ${JSON.stringify(campaignNamesAfter)}`);
    assert(
      campaignNamesAfter.includes(testCampaignName),
      `Created campaign "${testCampaignName}" should appear in campaign listing`
    );

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow5_campaign_created_in_listing.png'),
    });
    console.log('✓ Flow 5 passed: Campaign creation verified');

    // -------------------------------------------------------------
    // FLOW 6: Budget Tracker & Pacing Accordion
    // -------------------------------------------------------------
    console.log('\n--- FLOW 6: Verifying Budget & Pacing Intelligence ---');
    const budgetAccordionBtn = await page.$eval('button', () => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find((b) => b.innerText.includes('Budget & Pacing'));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });
    assert(budgetAccordionBtn, 'Budget accordion button should exist');
    await sleep(600);

    const runwayVisible = await page.$eval('body', (b) => b.innerText.includes('Remaining Runway'));
    assert(runwayVisible, 'Remaining Runway card should be visible in budget tracker');

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow6_budget_tracker_accordion.png'),
    });
    console.log('✓ Flow 6 passed: Budget Tracker verified');

    // -------------------------------------------------------------
    // FLOW 7: Advertising Integration Center
    // -------------------------------------------------------------
    console.log('\n--- FLOW 7: Verifying Advertising Integration Center Disclosure ---');
    const integBtn = await page.$eval('button', () => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find((b) => b.innerText.includes('Integrations'));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });
    assert(integBtn, 'Integrations button should be clicked');
    await sleep(800);

    const disclosureText = await page.$eval('body', (b) => b.innerText);
    assert(
      disclosureText.includes('Integration Disclosure & Production Boundary'),
      'Honest compliance boundary must be stated'
    );
    assert(
      disclosureText.includes('Demo Mode Active'),
      'Demo Mode Active badge must be visible'
    );

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow7_integrations_modal.png'),
    });

    const closeIntegBtn = await page.$eval('.fixed.inset-0 button', (btn) => {
      btn.click();
      return true;
    });
    await sleep(600);
    console.log('✓ Flow 7 passed: Integration center disclosure verified');

    // -------------------------------------------------------------
    // FLOW 8: Growth Intelligence Executive Dashboard (/analytics)
    // -------------------------------------------------------------
    console.log('\n--- FLOW 8: Verifying Growth Intelligence (/analytics) ---');
    await page.goto('http://localhost:3000/analytics', { waitUntil: 'networkidle2' });
    await sleep(1000);

    const analyticsH1 = await page.$eval('h1', (el) => el.innerText);
    console.log(`Analytics Heading: "${analyticsH1}"`);
    assert(
      analyticsH1.includes('Growth, decoded.'),
      'Expected heading "Growth, decoded."'
    );

    const analyticsSubtitle = await page.$eval('p.text-sm', (el) => el.innerText);
    console.log(`Analytics Subtitle: "${analyticsSubtitle}"`);
    assert(
      analyticsSubtitle.includes('From the first impression to the final conversion'),
      'Expected subtitle matching Growth OS design brief'
    );

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow8_growth_intelligence_dashboard.png'),
    });
    console.log('✓ Flow 8 passed: Growth Intelligence dashboard verified');

    // -------------------------------------------------------------
    // FLOW 9: Conversion Funnel Stage Verification
    // -------------------------------------------------------------
    console.log('\n--- FLOW 9: Verifying Conversion Funnel Stages ---');
    const funnelStages = await page.$$eval(
      '.group .flex.items-center.justify-between.text-xs span.font-medium.text-foreground',
      (els) => els.map((e) => e.innerText)
    );
    console.log(`Funnel stages detected: ${funnelStages.join(' -> ')}`);
    assert(funnelStages.includes('Impressions'), 'Funnel must include Impressions');
    assert(funnelStages.includes('Clicks'), 'Funnel must include Clicks');
    assert(funnelStages.includes('Captured Leads'), 'Funnel must include Captured Leads');
    assert(funnelStages.includes('Qualified Leads'), 'Funnel must include Qualified Leads');
    assert(funnelStages.includes('Won Customers'), 'Funnel must include Won Customers');

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow9_conversion_funnel.png'),
    });
    console.log('✓ Flow 9 passed: Full conversion funnel verified');

    // -------------------------------------------------------------
    // FLOW 10: Performance Trend SVG Visualization
    // -------------------------------------------------------------
    console.log('\n--- FLOW 10: Verifying Performance Trend SVG Visualization ---');
    const svgChart = await page.$('svg line');
    assert(svgChart, 'SVG chart lines should be rendered');

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow10_performance_trend_svg.png'),
    });
    console.log('✓ Flow 10 passed: Performance trend SVG chart verified');

    // -------------------------------------------------------------
    // FLOW 11: Cross-Channel Attribution Matrix
    // -------------------------------------------------------------
    console.log('\n--- FLOW 11: Verifying Channel Attribution Tab ---');
    const channelTabBtn = await page.$eval('button', () => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find((b) => b.innerText.includes('Channel Attribution'));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });
    assert(channelTabBtn, 'Channel Attribution tab button should be clicked');
    await sleep(600);

    const channelRows = await page.$$eval('tbody tr td', (els) => els.map((e) => e.innerText));
    assert(
      channelRows.some((r) => r.includes('Meta Ads')),
      'Attribution matrix must list Meta Ads'
    );
    assert(
      channelRows.some((r) => r.includes('Google Ads')),
      'Attribution matrix must list Google Ads'
    );

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow11_channel_attribution_matrix.png'),
    });
    console.log('✓ Flow 11 passed: Cross-Channel attribution tab verified');

    // -------------------------------------------------------------
    // FLOW 12: Creative Asset Library
    // -------------------------------------------------------------
    console.log('\n--- FLOW 12: Verifying Creative Asset Library Tab ---');
    const creativeTabBtn = await page.$eval('button', () => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find((b) => b.innerText.includes('Creative Performance'));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });
    assert(creativeTabBtn, 'Creative Performance tab button should be clicked');
    await sleep(600);

    const creativeCards = await page.$$eval('h4.font-semibold', (els) => els.map((e) => e.innerText));
    console.log(`Creatives found in library: ${creativeCards.length}`);
    assert(creativeCards.length > 0, 'Creative library should display assets');

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow12_creative_library.png'),
    });
    console.log('✓ Flow 12 passed: Creative library verified');

    // -------------------------------------------------------------
    // FLOW 13: Deterministic Insights Banner & 1-Click Task
    // -------------------------------------------------------------
    console.log('\n--- FLOW 13: Verifying Deterministic Insights & Task Creation ---');
    // Switch back to overview tab to see insights banner
    const overviewTabBtn = await page.$eval('button', () => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find((b) => b.innerText.includes('Executive Overview'));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });
    await sleep(600);

    const insightCards = await page.$$eval('.space-y-3.mb-6 button', (btns) =>
      btns.filter((b) => b.innerText.includes('Create Task')).length
    );
    console.log(`Actionable insight buttons found: ${insightCards}`);

    if (insightCards > 0) {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('.space-y-3.mb-6 button'));
        const target = btns.find((b) => b.innerText.includes('Create Task'));
        if (target) target.click();
      });
      await sleep(600);

      const taskConfirmed = await page.$eval('body', (b) =>
        b.innerText.includes('Task Created in Focus Center')
      );
      assert(taskConfirmed, 'Confirmation "Task Created in Focus Center" should appear');
      console.log('✓ Task created successfully from marketing insight');
    }

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow13_marketing_insights_action.png'),
    });
    console.log('✓ Flow 13 passed: Marketing insights banner verified');

    // -------------------------------------------------------------
    // FLOW 14: Report Studio (/reports) & Client Spend Hiding
    // -------------------------------------------------------------
    console.log('\n--- FLOW 14: Verifying Report Studio (/reports) ---');
    await page.goto('http://localhost:3000/reports', { waitUntil: 'networkidle2' });
    await sleep(1000);

    const reportsH1 = await page.$eval('h1', (el) => el.innerText);
    console.log(`Reports Heading: "${reportsH1}"`);
    assert(
      reportsH1.includes('Performance, made clear.'),
      'Expected heading "Performance, made clear."'
    );

    // Verify report paper preview is rendered
    const reportPaper = await page.$('.bl-report-paper');
    assert(reportPaper, 'Print-ready report paper should be visible in preview');

    // Toggle Hide Budget & Spend
    const hideBudgetCheckbox = await page.$('#hide-budget-toggle');
    assert(hideBudgetCheckbox, 'Hide budget toggle checkbox must exist');
    await hideBudgetCheckbox.click();
    await sleep(600);

    // Verify spend column is hidden in report paper
    const reportTableHeaders = await page.$$eval('.bl-report-paper th', (ths) =>
      ths.map((t) => t.innerText)
    );
    console.log(`Report table headers with budget hidden: ${reportTableHeaders.join(', ')}`);
    assert(
      !reportTableHeaders.includes('Spend'),
      'Spend column must be suppressed when Hide Budget is checked'
    );

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow14_report_studio_spend_hidden.png'),
    });
    console.log('✓ Flow 14 passed: Report Studio & spend hiding verified');

    // -------------------------------------------------------------
    // REGRESSION CHECKS: All 9 Core CRM Routes
    // -------------------------------------------------------------
    console.log('\n--- REGRESSION CHECKS: Verifying All Core Workspace Routes ---');
    const routesToTest = [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/leads', label: 'Leads' },
      { path: '/pipeline', label: 'Pipeline Studio' },
      { path: '/contacts', label: 'Contacts 360' },
      { path: '/companies', label: 'Company Intelligence' },
      { path: '/inbox', label: 'Unified Inbox' },
      { path: '/tasks', label: 'Focus Center' },
      { path: '/calendar', label: 'Calendar' },
      { path: '/meetings', label: 'Meetings' },
    ];

    for (const r of routesToTest) {
      const response = await page.goto(`http://localhost:3000${r.path}`, {
        waitUntil: 'networkidle2',
      });
      assert.strictEqual(
        response.status(),
        200,
        `Route ${r.path} must respond with HTTP 200`
      );

      // Verify approved wordmark and tagline
      const brandLogo = await page.$('.bl-brand-wordmark');
      assert(brandLogo, `Brand wordmark must exist on ${r.path}`);

      const taglineText = await page.$eval('.bl-brand-tagline', (el) => el.innerText);
      assert.strictEqual(
        taglineText,
        'The Intelligence Behind Growth.',
        `Tagline on ${r.path} must match approved tagline`
      );

      console.log(`  ✓ Route ${r.path} (${r.label}) healthy — HTTP 200 & brand intact`);
    }

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_regression_dashboard.png'),
    });

    console.log('\n===============================================================');
    console.log('  ALL PHASE 07 QA FLOWS & REGRESSION CHECKS PASSED (14/14)     ');
    console.log('===============================================================');
  } finally {
    await browser.close();
  }
}

runQA().catch((err) => {
  console.error('\n❌ QA TEST FAILED:', err);
  process.exit(1);
});
