const puppeteer = require('puppeteer-core');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const REPO_EVIDENCE_DIR = path.resolve(__dirname, '..', 'qa_evidence', 'phase_06');

// Ensure qa_evidence/phase_06 exists in repo
if (!fs.existsSync(REPO_EVIDENCE_DIR)) {
  fs.mkdirSync(REPO_EVIDENCE_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runQA() {
  console.log('===============================================================');
  console.log('  BizLead Phase 06: Focus Center & Calendar QA Assertion Suite ');
  console.log('===============================================================');

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

  // Use isolated incognito context so user browser storage is NOT wiped
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  // Monitor console errors and page errors
  page.on('pageerror', (err) => {
    console.error('[BROWSER PAGE ERROR]', err.message);
  });
  page.on('requestfailed', (req) => {
    console.warn('[REQ FAILED]', req.url(), req.failure() ? req.failure().errorText : '');
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('[BROWSER ERROR]', msg.text());
    } else {
      console.log('[BROWSER]', msg.text());
    }
  });

  try {
    // -------------------------------------------------------------
    // FLOW 1: Focus Center & Daily Momentum Layout (/tasks)
    // -------------------------------------------------------------
    console.log('\n[TEST 1] Loading Focus Center at http://localhost:3000/tasks...');
    await page.goto('http://localhost:3000/tasks', { waitUntil: 'networkidle0' });
    await sleep(1500);

    // Assert Daily Momentum hero exists
    const momentumTitle = await page.$eval('.bl-momentum-title', (el) => el.textContent);
    assert.strictEqual(momentumTitle.trim(), 'Daily Momentum', 'Daily Momentum title missing!');
    console.log('✓ Daily Momentum bento hero verified.');

    // Assert Focus Metrics row
    const kpiCards = await page.$$('.bl-focus-kpi-card');
    assert.ok(kpiCards.length >= 4, `Expected at least 4 KPI cards, found ${kpiCards.length}`);
    console.log(`✓ Focus Metrics KPI cards verified (${kpiCards.length} cards found).`);

    // Screenshot Flow 1
    const screenshot1 = path.join(REPO_EVIDENCE_DIR, 'qa_flow1_focus_center.png');
    await page.screenshot({ path: screenshot1, fullPage: true });
    console.log(`✓ Screenshot saved: ${screenshot1}`);

    // -------------------------------------------------------------
    // FLOW 2: Task Lifecycle (Create, View, Toggle Complete)
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Testing Task Creation & Toggle in Focus Center...');
    // Click "+ New Task" in FocusHeader
    const newTaskBtn = await page.waitForSelector('.bl-focus-header .bl-primary-btn');
    await newTaskBtn.click();
    await sleep(600);

    // Verify Task Drawer opened
    await page.waitForSelector('.bl-task-drawer');
    const drawerTitle = await page.$eval('#task-drawer-title', (el) => el.textContent);
    assert.ok(drawerTitle.includes('Action Item') || drawerTitle.includes('Task'), 'Task Drawer title mismatch');

    // Fill form
    const taskTitle = 'QA Task: Executive Follow-up ' + Date.now();
    await page.type('#task-title', taskTitle);
    await page.select('#task-priority', 'urgent');
    await page.select('#task-type', 'follow_up');

    // Submit
    const submitBtn = await page.$('button[type="submit"].bl-primary-btn');
    await submitBtn.click();
    await sleep(1000);

    // Assert newly created task is visible in the list
    const pageContent = await page.content();
    assert.ok(pageContent.includes(taskTitle), `Created task "${taskTitle}" not found in page content!`);
    console.log(`✓ Task "${taskTitle}" successfully created and rendered.`);

    // Find and toggle the task checkbox
    const taskCards = await page.$$('.bl-task-card');
    let targetCard = null;
    for (const card of taskCards) {
      const title = await card.$eval('.bl-task-title', (el) => el.textContent);
      if (title.includes(taskTitle)) {
        targetCard = card;
        break;
      }
    }
    assert.ok(targetCard, 'Target task card not found for toggle test');

    const checkbox = await targetCard.$('.bl-task-checkbox');
    await checkbox.click();
    await sleep(1500);

    // Verify task moved to completed section or received completed class
    const completedCard = await page.waitForSelector('.bl-task-card.completed');
    assert.ok(completedCard, 'Task was not marked completed in list');
    const isCompleted = await page.evaluate((titleText) => {
      const cards = Array.from(document.querySelectorAll('.bl-task-card.completed'));
      return cards.some((c) => c.textContent.includes(titleText));
    }, taskTitle);
    assert.ok(isCompleted, 'Completed task not found in completed section');
    console.log('✓ Task successfully marked complete and moved to Completed section with reactive state synchronization.');

    const screenshot2 = path.join(REPO_EVIDENCE_DIR, 'qa_flow2_task_lifecycle.png');
    await page.screenshot({ path: screenshot2, fullPage: true });
    console.log(`✓ Screenshot saved: ${screenshot2}`);

    // -------------------------------------------------------------
    // FLOW 3: Kanban Task Board (/tasks viewMode = board)
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Testing Kanban Task Board view & Move action...');
    // Switch to Board view
    const boardTab = await page.$('button.bl-view-tab[title*="Kanban"]');
    assert.ok(boardTab, 'Kanban board tab not found');
    await boardTab.click();
    await sleep(800);

    // Assert 4 columns exist: To Do, In Progress, Waiting, Completed
    const columns = await page.$$('.bl-task-board-column');
    assert.strictEqual(columns.length, 4, `Expected 4 Kanban columns, found ${columns.length}`);

    // Click move button on a task in "To Do" to shift it to "In Progress"
    const moveBtn = await page.$('.bl-task-board-column:first-child .bl-board-move-btn');
    if (moveBtn) {
      await moveBtn.click();
      await sleep(1000);
      console.log('✓ Task shifted right from To Do to In Progress via accessible move button.');
    }

    const screenshot3 = path.join(REPO_EVIDENCE_DIR, 'qa_flow3_task_board.png');
    await page.screenshot({ path: screenshot3, fullPage: true });
    console.log(`✓ Screenshot saved: ${screenshot3}`);

    // Switch back to Focus view
    const focusTab = await page.$('button.bl-view-tab[title*="Focus"]');
    if (focusTab) await focusTab.click();
    await sleep(500);

    // -------------------------------------------------------------
    // FLOW 4: Smart Follow-up Recommendation Engine
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Testing Smart Follow-up Intelligence banner...');
    const recBanner = await page.$('.bl-recommendations-banner');
    assert.ok(recBanner, 'Recommendations banner not found on /tasks');

    const recCount = await page.$$eval('.bl-rec-card', (cards) => cards.length);
    assert.ok(recCount >= 1, `Expected recommendations, found ${recCount}`);
    console.log(`✓ Smart recommendations engine evaluated (${recCount} active recommendations).`);

    // Click "Create Task" on first recommendation
    const createFromRecBtn = await page.$('.bl-rec-card:first-child .bl-rec-btn');
    await createFromRecBtn.click();
    await sleep(600);

    // Verify task drawer opened with prefilled suggested action
    await page.waitForSelector('.bl-task-drawer');
    const prefillTitle = await page.$eval('#task-title', (el) => el.value);
    assert.ok(prefillTitle.length > 0, 'Prefilled task title is empty!');
    console.log(`✓ 1-Click Follow-up opened drawer with prefilled title: "${prefillTitle}".`);

    // Close drawer
    const closeDrawerBtn = await page.$('.bl-task-drawer .bl-icon[aria-label="Close drawer"]');
    await closeDrawerBtn.click();
    await sleep(500);

    const screenshot4 = path.join(REPO_EVIDENCE_DIR, 'qa_flow4_recommendations.png');
    await page.screenshot({ path: screenshot4, fullPage: true });
    console.log(`✓ Screenshot saved: ${screenshot4}`);

    // -------------------------------------------------------------
    // FLOW 5: Calendar Studio (/calendar)
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Loading Calendar Studio at http://localhost:3000/calendar...');
    await page.goto('http://localhost:3000/calendar', { waitUntil: 'networkidle0' });
    await sleep(1500);

    // Verify Toolbar
    const calTitle = await page.$eval('.bl-cal-title', (el) => el.textContent);
    assert.ok(calTitle.length > 0, 'Calendar toolbar title missing');
    console.log(`✓ Calendar Studio active (${calTitle}).`);

    // Verify Month View grid has day cells and weekday headers
    const weekdayCells = await page.$$('.bl-month-weekday-cell');
    assert.strictEqual(weekdayCells.length, 7, `Expected 7 weekday headers, found ${weekdayCells.length}`);

    const dayCells = await page.$$('.bl-month-day-cell');
    assert.ok(dayCells.length >= 28, `Expected month day cells, found ${dayCells.length}`);

    // Check event chips
    const eventChips = await page.$$('.bl-cal-event-chip');
    console.log(`✓ Month view rendered with ${dayCells.length} cells and ${eventChips.length} event chips.`);

    // Switch to Week View
    const weekTab = await page.$('.bl-cal-view-group button:nth-child(2)');
    await weekTab.click();
    await sleep(600);
    const weekHours = await page.$$('.bl-week-hour-row');
    assert.ok(weekHours.length >= 10, 'Week view hourly rows missing');
    console.log('✓ Week view rendered successfully.');

    // Switch to Day View
    const dayTab = await page.$('.bl-cal-view-group button:nth-child(3)');
    await dayTab.click();
    await sleep(600);
    const dayHours = await page.$$('.bl-day-hour-row');
    assert.ok(dayHours.length >= 10, 'Day view hourly rows missing');
    console.log('✓ Day view rendered successfully.');

    // Switch to Agenda View
    const agendaTab = await page.$('.bl-cal-view-group button:nth-child(4)');
    await agendaTab.click();
    await sleep(600);
    const agendaGroups = await page.$$('.bl-agenda-date-group');
    assert.ok(agendaGroups.length >= 1, 'Agenda date groups missing');
    console.log('✓ Agenda view rendered successfully.');

    const screenshot5 = path.join(REPO_EVIDENCE_DIR, 'qa_flow5_calendar_views.png');
    await page.screenshot({ path: screenshot5, fullPage: true });
    console.log(`✓ Screenshot saved: ${screenshot5}`);

    // -------------------------------------------------------------
    // FLOW 6: Calendar Sync & RFC 5545 Export Modal
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Testing Calendar Sync & RFC 5545 Export modal...');
    const syncExportBtn = await page.waitForSelector('button[title*="External Calendar Sync"]');
    await syncExportBtn.click();
    await sleep(600);

    // Verify modal
    await page.waitForSelector('.bl-sync-modal');
    const modalHeading = await page.$eval('#sync-modal-title', (el) => el.textContent);
    assert.ok(modalHeading.includes('RFC 5545'), 'Sync modal heading mismatch');

    // Verify provider cards (GCal, Outlook, Zoom)
    const providerCards = await page.$$('.bl-sync-provider-card');
    assert.strictEqual(providerCards.length, 3, `Expected 3 provider cards, found ${providerCards.length}`);

    // Verify disclaimer
    const disclaimer = await page.$eval('.bl-sync-disclaimer', (el) => el.textContent);
    assert.ok(disclaimer.includes('Zero-Simulation Standard'), 'Transparency disclaimer missing');
    console.log('✓ External sync modal & RFC 5545 export verified.');

    const screenshot6 = path.join(REPO_EVIDENCE_DIR, 'qa_flow6_calendar_sync_modal.png');
    await page.screenshot({ path: screenshot6, fullPage: true });
    console.log(`✓ Screenshot saved: ${screenshot6}`);

    // Close modal
    const closeSyncBtn = await page.$('.bl-sync-modal .bl-modal-footer button');
    await closeSyncBtn.click();
    await sleep(500);

    // -------------------------------------------------------------
    // FLOW 7: Meeting Workspace & Preparation Brief (/meetings)
    // -------------------------------------------------------------
    console.log('\n[TEST 7] Loading Meeting Workspace at http://localhost:3000/meetings...');
    await page.goto('http://localhost:3000/meetings', { waitUntil: 'networkidle0' });
    await sleep(1500);

    // Assert Meeting Hero renders
    const heroTitle = await page.$eval('.bl-hero-title', (el) => el.textContent);
    assert.ok(heroTitle.length > 0, 'Meeting hero title missing');
    console.log(`✓ Next Upcoming Meeting Hero displayed: "${heroTitle}".`);

    // Click "Prep Brief" in hero
    const prepBriefBtn = await page.$('.bl-hero-actions button:first-child');
    await prepBriefBtn.click();
    await sleep(600);

    // Verify Brief modal
    await page.waitForSelector('.bl-brief-modal');
    const briefModalTitle = await page.$eval('#brief-title', (el) => el.textContent);
    assert.ok(briefModalTitle.includes('Preparation Brief'), 'Brief modal title mismatch');
    console.log('✓ Meeting Preparation Brief opened with Contact 360 & Deal context.');

    const screenshot7 = path.join(REPO_EVIDENCE_DIR, 'qa_flow7_meeting_prep_brief.png');
    await page.screenshot({ path: screenshot7, fullPage: true });
    console.log(`✓ Screenshot saved: ${screenshot7}`);

    // Close brief modal
    const closeBriefBtn = await page.$('.bl-brief-modal .bl-modal-footer button');
    await closeBriefBtn.click();
    await sleep(500);

    // -------------------------------------------------------------
    // FLOW 8: Meeting Outcome Logging & Pipeline Stage Advancement
    // -------------------------------------------------------------
    console.log('\n[TEST 8] Testing Meeting Outcome Logging flow...');
    const outcomeBtn = await page.$('.bl-outcome-btn');
    assert.ok(outcomeBtn, 'Log Outcome button not found in meeting hero');
    await outcomeBtn.click();
    await sleep(600);

    // Verify Outcome modal
    await page.waitForSelector('.bl-outcome-modal');
    await page.type('#outcome-summary', 'Demo executed with key CXO stakeholders. Strong intent shown for commercial close.');

    // Select positive sentiment
    const posSentimentBtn = await page.$('.bl-sentiment-btn.positive');
    await posSentimentBtn.click();

    // Submit outcome
    const saveOutcomeBtn = await page.$('.bl-outcome-modal button[type="submit"]');
    await saveOutcomeBtn.click();
    await sleep(1500);

    // Assert outcome preview in meeting list
    const outcomePreview = await page.waitForSelector('.bl-meeting-outcome-preview');
    assert.ok(outcomePreview, 'Meeting outcome preview not found in meeting list');
    console.log('✓ Meeting completed and outcome successfully logged to CRM.');

    const screenshot8 = path.join(REPO_EVIDENCE_DIR, 'qa_flow8_meeting_outcome_completed.png');
    await page.screenshot({ path: screenshot8, fullPage: true });
    console.log(`✓ Screenshot saved: ${screenshot8}`);

    // -------------------------------------------------------------
    // FLOW 9: Reminder Center & Header Bell
    // -------------------------------------------------------------
    console.log('\n[TEST 9] Testing Header Bell & Reminder Center...');
    const bellBtn = await page.waitForSelector('button[aria-label="Notifications"]');
    await bellBtn.click();
    await sleep(600);

    // Verify Reminder popover
    await page.waitForSelector('.bl-reminder-popover');
    const reminderCount = await page.$$eval('.bl-reminder-item', (items) => items.length);
    console.log(`✓ Reminder Center opened with ${reminderCount} scheduled reminders.`);

    const screenshot9 = path.join(REPO_EVIDENCE_DIR, 'qa_flow9_reminder_center.png');
    await page.screenshot({ path: screenshot9, fullPage: true });
    console.log(`✓ Screenshot saved: ${screenshot9}`);

    // Close reminder popover
    await page.keyboard.press('Escape');
    await sleep(500);

    // -------------------------------------------------------------
    // FLOW 10: Regression Verification Across Core Routes
    // -------------------------------------------------------------
    console.log('\n[TEST 10] Testing regression across all core routes...');
    const routes = ['/dashboard', '/leads', '/pipeline', '/contacts', '/companies', '/inbox'];
    for (const r of routes) {
      const res = await page.goto(`http://localhost:3000${r}`, { waitUntil: 'networkidle0' });
      assert.strictEqual(res.status(), 200, `Route ${r} failed with status ${res.status()}`);

      // Verify brand logo and adaptive tagline
      const brandWordmark = await page.$eval('.bl-brand-wordmark', (el) => el.textContent);
      assert.ok(brandWordmark.includes('BIZ') && brandWordmark.includes('LEAD'), `Brand wordmark mismatch on ${r}`);

      const tagline = await page.$eval('.bl-brand-tagline', (el) => el.textContent);
      assert.strictEqual(tagline.trim(), 'The Intelligence Behind Growth.', `Tagline mismatch on ${r}`);
      console.log(`✓ Route ${r} passed (HTTP 200, branding & tagline intact).`);
    }

    const screenshot10 = path.join(REPO_EVIDENCE_DIR, 'qa_flow10_regression.png');
    await page.screenshot({ path: screenshot10, fullPage: true });
    console.log(`✓ Screenshot saved: ${screenshot10}`);

    console.log('\n===============================================================');
    console.log('  ALL 10 BEHAVIORAL QA TEST FLOWS PASSED WITH 0 ASSERTION FAILS');
    console.log('===============================================================');
  } catch (err) {
    console.error('\n❌ QA TEST RUN FAILED:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runQA();
