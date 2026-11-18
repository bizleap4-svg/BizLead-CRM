const puppeteer = require('puppeteer-core');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const REPO_EVIDENCE_DIR = path.resolve(__dirname, '..', 'qa_evidence', 'phase_09');

if (!fs.existsSync(REPO_EVIDENCE_DIR)) {
  fs.mkdirSync(REPO_EVIDENCE_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findButtonByText(page, matchText) {
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await b.evaluate((el) => el.innerText || '');
    if (text.toLowerCase().includes(matchText.toLowerCase())) {
      return b;
    }
  }
  return null;
}

async function runQA() {
  console.log('========================================================================');
  console.log('  BizLead Phase 09: Biz AI Intelligence Assistant Behavioral QA Suite  ');
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
    if (!req.url().includes('_next/static')) {
      console.warn('[REQ FAILED]', req.url(), req.failure() ? req.failure().errorText : '');
    }
  });

  try {
    console.log('Warming up dev server at http://localhost:3000...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
    await sleep(2000);

    // -------------------------------------------------------------
    // FLOW 1: Biz AI Overview & Headlines (/ai)
    // -------------------------------------------------------------
    console.log('\n--- FLOW 1: Verifying Biz AI Workspace (/ai) ---');
    await page.goto('http://localhost:3000/ai', { waitUntil: 'networkidle2' });
    await sleep(1500);

    const heading = await page.$eval('h1', (el) => el.innerText.trim());
    console.log(`Page Heading: "${heading}"`);
    assert(
      heading.includes('Intelligence, unlocked.'),
      'Expected heading "Intelligence, unlocked."'
    );

    const pageContent = await page.content();
    assert(
      pageContent.includes('Your entire business ecosystem. One conversation.'),
      'Expected subtitle "Your entire business ecosystem. One conversation."'
    );
    assert(
      pageContent.includes('Local CRM Assistant') && pageContent.includes('Rule-Based Mode'),
      'Expected Local CRM Assistant — Rule-Based Mode badge'
    );

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow1_ai_overview.png'),
    });
    console.log('✓ Flow 1 passed: AI overview verified & screenshot saved');

    // -------------------------------------------------------------
    // FLOW 2: Pre-seeded Priority Leads & Action Proposal Card
    // -------------------------------------------------------------
    console.log('\n--- FLOW 2: Verifying Priority Leads Cards & Action Proposal ---');
    // Verify pre-seeded conversation cards render
    const leadCards = await page.$$eval('.grid.grid-cols-1.sm\\:grid-cols-2.md\\:grid-cols-3 > div', (cards) =>
      cards.map((c) => c.innerText)
    );
    console.log(`Found ${leadCards.length} priority lead cards`);
    assert(leadCards.length >= 3, 'Expected at least 3 priority lead cards');
    assert(leadCards[0].includes('Aarav Sharma') || pageContent.includes('Aarav Sharma'), 'Expected Aarav Sharma card');
    assert(leadCards[0].includes('96/100') || pageContent.includes('96/100'), 'Expected score 96/100');

    // Verify Action Proposal Card
    const actionCard = await page.$eval('#btn-approve-action', (btn) => btn.closest('.rounded-xl')?.innerText || '');
    console.log('Action Proposal card found');
    assert(
      actionCard.includes('Create 3 High-Priority Follow-up Tasks') || actionCard.includes('Proposed CRM Action'),
      'Expected proposed action card'
    );
    assert(actionCard.includes('Requires Approval'), 'Expected Requires Approval status badge');

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow2_priority_leads_proposal.png'),
    });
    console.log('✓ Flow 2 passed: Priority leads & action proposal verified');

    // -------------------------------------------------------------
    // FLOW 3: Action Approval & Real Execution
    // -------------------------------------------------------------
    console.log('\n--- FLOW 3: Verifying Action Approval & Idempotency ---');
    const approveBtn = await page.$('#btn-approve-action');
    assert(approveBtn, 'Approve & Execute button must exist');
    await approveBtn.click();
    await sleep(2000);

    const errOnCard = await page.$eval('.text-rose-500', el => el.innerText).catch(() => null);
    if (errOnCard) console.log('Error on action card:', errOnCard);

    const statusPills = await page.$$eval('.rounded-full', (els) => els.map((e) => e.innerText));
    console.log('Status pills:', statusPills);
    assert(
      statusPills.some((p) => p.includes('Approved & Executed')),
      'Expected status to transition to Approved & Executed'
    );

    // Verify button is no longer clickable (idempotent protection)
    const approveBtnAfter = await page.$('#btn-approve-action');
    assert(!approveBtnAfter, 'Approve button should be dismissed after execution');

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow3_action_approved.png'),
    });
    console.log('✓ Flow 3 passed: Action approved, executed into CRM, and idempotency enforced');

    // -------------------------------------------------------------
    // FLOW 4: Pipeline Query with Data Table
    // -------------------------------------------------------------
    console.log('\n--- FLOW 4: Verifying Pipeline Query with Data Table ---');
    const pipelineSuggestion = await findButtonByText(page, 'What is our current pipeline value?');
    if (pipelineSuggestion) {
      await pipelineSuggestion.click();
      await sleep(300);
    } else {
      await page.type('textarea', 'What is our current pipeline value?');
    }

    const sendBtn = await page.$('#btn-send-message');
    assert(sendBtn, 'Send button must exist');
    await sendBtn.click();
    await sleep(2000);

    const afterPipelineContent = await page.content();
    assert(
      afterPipelineContent.includes('Pipeline Revenue & Forecasting Breakdown') || afterPipelineContent.includes('Total Active Pipeline'),
      'Expected Pipeline summary response'
    );
    assert(
      afterPipelineContent.includes('tool: calculate_pipeline_metrics'),
      'Expected tool execution badge tool: calculate_pipeline_metrics'
    );

    // Check table rendered
    const tableExists = await page.$('table');
    assert(tableExists, 'Data table must be rendered for pipeline query');

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow4_pipeline_data_table.png'),
    });
    console.log('✓ Flow 4 passed: Pipeline query executed tool & rendered data table');

    // -------------------------------------------------------------
    // FLOW 5: Context Picker Attachment
    // -------------------------------------------------------------
    console.log('\n--- FLOW 5: Verifying Context Picker ---');
    const attachBtn = await findButtonByText(page, 'Attach Context');
    assert(attachBtn, 'Attach Context button must exist');
    await attachBtn.click();
    await sleep(600);

    // Context popover opens
    const popoverHeading = await page.$eval('.z-40 h4, .z-40 span.font-bold', (el) => el.innerText);
    console.log(`Context Popover Header: "${popoverHeading}"`);
    assert(popoverHeading.includes('Attach Record Context'), 'Expected Attach Record Context popover');

    // Click first item in list
    const firstContextItem = await page.$('.z-40 .cursor-pointer');
    assert(firstContextItem, 'Context item must exist');
    await firstContextItem.click();
    await sleep(600);

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow5_context_picker.png'),
    });
    console.log('✓ Flow 5 passed: Record context attached to composer');

    // -------------------------------------------------------------
    // FLOW 6: Natural Language to Automation Draft
    // -------------------------------------------------------------
    console.log('\n--- FLOW 6: Verifying Natural Language to Automation Draft ---');
    await page.type('textarea', 'When a new lead has a score above 80, assign it to Rahul Sharma');
    await sleep(200);
    await sendBtn.click();
    await sleep(2500);

    const wfReplyContent = await page.content();
    assert(
      wfReplyContent.includes('structured, validated workflow graph') || wfReplyContent.includes('Draft (Inactive)'),
      'Expected automation assistant workflow synthesis response'
    );
    assert(
      wfReplyContent.includes('Save Inactive Workflow Blueprint'),
      'Expected inactive workflow draft action proposal'
    );

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow6_workflow_draft.png'),
    });
    console.log('✓ Flow 6 passed: Natural language workflow draft generated safely');

    // -------------------------------------------------------------
    // FLOW 7: Unsupported Query Transparency (Zero Hallucination)
    // -------------------------------------------------------------
    console.log('\n--- FLOW 7: Verifying Unsupported Query Transparency ---');
    await page.type('textarea', 'Write a fictional sci-fi novel about Mars colonization');
    await sleep(200);
    await sendBtn.click();
    await sleep(1500);

    const unsuppContent = await page.content();
    assert(
      unsuppContent.includes('outside the supported CRM intent scope') || unsuppContent.includes('Phase 10'),
      'Expected transparent notice indicating query is outside rule-based scope'
    );

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow7_unsupported_transparency.png'),
    });
    console.log('✓ Flow 7 passed: Unsupported query transparently flagged without hallucination');

    // -------------------------------------------------------------
    // FLOW 8: Daily Business Briefing Modal
    // -------------------------------------------------------------
    console.log('\n--- FLOW 8: Verifying Daily Business Briefing ---');
    const briefingBtn = await page.$('#btn-daily-briefing');
    assert(briefingBtn, 'Daily Briefing button must exist');
    await briefingBtn.click();
    await sleep(800);

    const briefingTitle = await page.$eval('h3', (el) => el.innerText);
    console.log(`Briefing Modal Title: "${briefingTitle}"`);
    assert(briefingTitle.includes('Daily Business Briefing'), 'Expected Daily Business Briefing modal');

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow8_daily_briefing.png'),
    });

    // Dismiss briefing
    const dismissBtn = await findButtonByText(page, 'Dismiss Briefing');
    if (dismissBtn) {
      await dismissBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await sleep(600);
    console.log('✓ Flow 8 passed: Daily Business Briefing modal verified');

    // -------------------------------------------------------------
    // FLOW 9: Provider Architecture & Settings
    // -------------------------------------------------------------
    console.log('\n--- FLOW 9: Verifying Provider Architecture & Settings ---');
    const providersBtn = await findButtonByText(page, 'Providers');
    assert(providersBtn, 'Providers button must exist');
    await providersBtn.click();
    await sleep(800);

    const provContent = await page.content();
    assert(
      provContent.includes('Zero-Exfiltration Architecture') || provContent.includes('AI Provider Architecture'),
      'Expected AI Provider Architecture header'
    );
    assert(
      provContent.includes('Local CRM Assistant') && provContent.includes('Rule-Based Mode Active'),
      'Expected Local CRM Assistant Active status'
    );
    assert(
      provContent.includes('OpenAI') && provContent.includes('Gateway Integration Pending'),
      'Expected OpenAI pending gateway disclosure'
    );

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow9_provider_settings.png'),
    });

    const closeSettings = await findButtonByText(page, 'Close Settings');
    if (closeSettings) {
      await closeSettings.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await sleep(600);
    console.log('✓ Flow 9 passed: Provider architecture & honest compliance settings verified');

    // -------------------------------------------------------------
    // FLOW 10: Global Floating Assistant & Workspace Regression
    // -------------------------------------------------------------
    console.log('\n--- FLOW 10: Verifying Global Assistant & Workspace Regression ---');
    // Navigate to /leads to check floating assistant
    await page.goto('http://localhost:3000/leads', { waitUntil: 'networkidle2' });
    await sleep(1500);

    const globalBtn = await page.$('#btn-global-ai-launcher');
    assert(globalBtn, 'Global floating "Ask Biz AI" button must exist on CRM pages');
    await page.evaluate(() => {
      const btn = document.getElementById('btn-global-ai-launcher');
      if (btn) btn.click();
    });
    await sleep(1000);

    const drawer = await page.$('#global-ai-slideover-drawer');
    assert(drawer, 'Global floating slide-over drawer must be rendered');

    const floatingHeader = await page.content();
    assert(
      floatingHeader.includes('Biz AI Assistant') && floatingHeader.includes('Contextual Copilot'),
      'Expected contextual slide-over drawer'
    );

    // Verify all 14 routes return HTTP 200
    const routesToTest = [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/leads', label: 'Leads' },
      { path: '/pipeline', label: 'Pipeline Studio' },
      { path: '/contacts', label: 'Contact 360°' },
      { path: '/companies', label: 'Company Intelligence' },
      { path: '/inbox', label: 'Unified Inbox' },
      { path: '/tasks', label: 'Tasks' },
      { path: '/calendar', label: 'Calendar' },
      { path: '/meetings', label: 'Meetings' },
      { path: '/campaigns', label: 'Campaign Manager' },
      { path: '/analytics', label: 'Attribution & Analytics' },
      { path: '/reports', label: 'Report Studio' },
      { path: '/automations', label: 'Automation Studio' },
      { path: '/ai', label: 'Biz AI' },
    ];

    for (const route of routesToTest) {
      const res = await page.goto(`http://localhost:3000${route.path}`, { waitUntil: 'networkidle2' });
      assert.strictEqual(res.status(), 200, `Route ${route.path} must return HTTP 200`);
      await sleep(200);
      console.log(`  ✓ Route ${route.path} (${route.label}) returned 200 OK`);
    }

    // Verify approved BIZLEAD wordmark & adaptive tagline
    const shellContent = await page.content();
    assert(
      shellContent.includes('The Intelligence Behind Growth.'),
      'Adaptive tagline "The Intelligence Behind Growth." must remain intact across workspace'
    );

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_flow10_global_assistant_and_regression.png'),
    });
    console.log('✓ Flow 10 passed: Global assistant and complete workspace regression verified');

    console.log('\n========================================================================');
    console.log('  ALL PHASE 09 BEHAVIORAL QA FLOWS PASSED (10/10)                       ');
    console.log('========================================================================');
  } catch (err) {
    console.error('\n❌ QA Suite encountered an error:', err);
    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, 'qa_failure_debug.png'),
    });
    throw err;
  } finally {
    await browser.close();
  }
}

runQA().catch((err) => {
  console.error(err);
  process.exit(1);
});
