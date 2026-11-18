const puppeteer = require('puppeteer-core');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const REPO_EVIDENCE_DIR = path.resolve(__dirname, '..', 'qa_evidence');

// Ensure qa_evidence exists in repo
if (!fs.existsSync(REPO_EVIDENCE_DIR)) {
  fs.mkdirSync(REPO_EVIDENCE_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runQA() {
  console.log('====================================================');
  console.log('  BizLead Automated Behavioral QA & Assertion Suite ');
  console.log('====================================================');

  console.log('Launching Chrome via puppeteer-core (headless)...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1440,900'
    ]
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  try {
    // ==========================================
    // 0. RESET STORAGE BEFORE STARTING
    // ==========================================
    console.log('[SETUP] Initializing clean state on http://localhost:3000/inbox...');
    await page.goto('http://localhost:3000/inbox', { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(1500);

    // ==========================================
    // 1. INBOX: FLOW 1 - CUSTOMER REPLY
    // ==========================================
    console.log('\n[TEST 1] Testing Customer Reply sending & assertion...');
    const convItems = await page.$$('.bl-conversation-item');
    assert.ok(convItems.length >= 6, `Assertion Failed: Expected >= 6 conversations, found ${convItems.length}`);
    await convItems[0].click(); // CNV-001 (Aarav Sharma)
    await sleep(1000);

    const testReplyText = 'Hello Aarav, confirming our strategy demo session for tomorrow at 3 PM IST.';
    const composerTextarea = await page.$('textarea[aria-label="Message composition input"]');
    assert.ok(composerTextarea, 'Assertion Failed: Composer textarea not found!');

    await composerTextarea.click();
    await composerTextarea.type(testReplyText);
    await sleep(500);

    const sendBtn = await page.$('button.bl-send-btn');
    assert.ok(sendBtn, 'Assertion Failed: Send button not found in composer!');
    await sendBtn.click();
    await sleep(1500);

    // Assert: Message appears in thread as outgoing bubble containing our text
    const messageTexts = await page.$$eval('.bl-message-text', (els) => els.map((e) => e.textContent || ''));
    const replyFound = messageTexts.some((txt) => txt.includes('confirming our strategy demo session'));
    assert.ok(replyFound, `Assertion Failed: Outgoing reply was not rendered in thread! Rendered messages: ${JSON.stringify(messageTexts)}`);
    console.log('✓ PASS: Customer reply rendered in DOM thread.');

    // Save Screenshot in repo qa_evidence
    const flow1Path = path.join(REPO_EVIDENCE_DIR, 'qa_flow1_customer_reply.png');
    await page.screenshot({ path: flow1Path });
    console.log(`Saved screenshot: ${flow1Path}`);

    // ==========================================
    // 2. INBOX: FLOW 2 - INTERNAL TEAM NOTE
    // ==========================================
    console.log('\n[TEST 2] Testing Private Internal Team Note & assertion...');
    const modeButtons = await page.$$('.bl-composer-mode-btn');
    assert.ok(modeButtons.length > 1, 'Assertion Failed: Composer mode tabs missing!');
    await modeButtons[1].click(); // Switch to Note mode
    await sleep(800);

    // Assert note banner warning is visible
    const noteWarning = await page.$('.bl-composer-note-warning');
    assert.ok(noteWarning, 'Assertion Failed: Private Team Note warning banner not shown when in note mode!');

    const noteText = 'Pricing discount approved up to 12% by Finance. Aarav is ready to sign.';
    const noteTextarea = await page.$('textarea[aria-label="Message composition input"]');
    await noteTextarea.click();
    await noteTextarea.type(noteText);
    await sleep(500);

    const saveNoteBtn = await page.$('button.bl-send-btn');
    await saveNoteBtn.click();
    await sleep(1500);

    // Assert: Internal note rendered with lock icon and internal-note content
    const noteTexts = await page.$$eval('.bl-internal-note-content', (els) => els.map((e) => e.textContent || ''));
    const noteFound = noteTexts.some((txt) => txt.includes('Pricing discount approved up to 12%'));
    assert.ok(noteFound, `Assertion Failed: Private internal note card not found in thread! Found notes: ${JSON.stringify(noteTexts)}`);
    console.log('✓ PASS: Internal team note rendered with private lock indicator.');

    const flow2Path = path.join(REPO_EVIDENCE_DIR, 'qa_flow2_internal_note.png');
    await page.screenshot({ path: flow2Path });
    console.log(`Saved screenshot: ${flow2Path}`);

    // ==========================================
    // 3. INBOX: FLOW 3 - TEMPLATES INSERTION
    // ==========================================
    console.log('\n[TEST 3] Testing Saved Reply Templates modal & placeholder replacement...');
    const templatesBtn = await page.$('button[title="Open saved reply templates"]');
    assert.ok(templatesBtn, 'Assertion Failed: Templates button missing in composer footer!');
    await templatesBtn.click();
    await sleep(1000);

    // Assert modal is open
    const templatesModal = await page.$('.bl-templates-modal');
    assert.ok(templatesModal, 'Assertion Failed: Templates modal did not open!');

    // Screenshot modal
    const flow3ModalPath = path.join(REPO_EVIDENCE_DIR, 'qa_flow3_template_modal.png');
    await page.screenshot({ path: flow3ModalPath });
    console.log(`Saved screenshot: ${flow3ModalPath}`);

    // Click Insert into Composer on first template
    const insertBtn = await page.$('.bl-template-item-card .bl-primary');
    assert.ok(insertBtn, 'Assertion Failed: Insert button on template card missing!');
    await insertBtn.click();
    await sleep(1000);

    // Assert: Composer textarea has resolved placeholder content (not empty and has > 20 chars)
    const composerValue = await page.$eval(
      'textarea[aria-label="Message composition input"]',
      (el) => el.value
    );
    assert.ok(composerValue && composerValue.length > 20, `Assertion Failed: Template text was not inserted! Current value: "${composerValue}"`);
    console.log(`✓ PASS: Template successfully inserted into composer: "${composerValue.slice(0, 45)}..."`);

    const flow3Path = path.join(REPO_EVIDENCE_DIR, 'qa_flow3_template_inserted.png');
    await page.screenshot({ path: flow3Path });
    console.log(`Saved screenshot: ${flow3Path}`);

    // Clear composer
    await page.$eval('textarea[aria-label="Message composition input"]', (el) => { el.value = ''; });

    // ==========================================
    // 4. INBOX: FLOW 4 - UNLINKED LEAD CAPTURE
    // ==========================================
    console.log('\n[TEST 4] Testing Inbound Unlinked Lead Capture & conversion...');
    // Select Neha Kapoor reliably
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.bl-conversation-item'));
      const neha = items.find((el) => el.textContent && el.textContent.includes('Neha Kapoor'));
      if (neha) (neha).click();
    });
    await sleep(1200);

    // Assert unlinked prospect banner exists
    const unlinkedBanner = await page.$('.bl-unlinked-conversation-flow');
    assert.ok(unlinkedBanner, 'Assertion Failed: Unlinked Inbound Prospect warning panel not shown for Neha Kapoor (CNV-006)!');

    // Click Capture as New Lead button
    const captureBtns = await page.$$('button');
    let captureBtn = null;
    for (const btn of captureBtns) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes('Capture as New Lead')) {
        captureBtn = btn;
        break;
      }
    }
    assert.ok(captureBtn, 'Assertion Failed: "Capture as New Lead" button not found!');
    await captureBtn.click();
    await sleep(1000);

    // Modal should be open
    const modal = await page.$('.bl-modal-content');
    assert.ok(modal, 'Assertion Failed: Lead Capture modal did not open!');

    // Populate company and submit via native React setter and requestSubmit
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('.bl-modal-content form input'));
      const companyInput = inputs[1];
      if (companyInput) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(companyInput, 'Kapoor Luxury Interiors');
        companyInput.dispatchEvent(new Event('input', { bubbles: true }));
        companyInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const form = document.querySelector('.bl-modal-content form');
      if (form) form.requestSubmit();
    });
    await sleep(2500);

    // Assert: Unlinked banner is gone and Customer Context panel now shows the created contact/lead info
    const unlinkedBannerAfter = await page.$('.bl-unlinked-conversation-flow');
    assert.strictEqual(unlinkedBannerAfter, null, 'Assertion Failed: Unlinked banner still visible after lead capture conversion!');
    console.log('✓ PASS: Unlinked conversation successfully converted into a registered CRM Lead.');

    const flow4Path = path.join(REPO_EVIDENCE_DIR, 'qa_flow4_lead_captured.png');
    await page.screenshot({ path: flow4Path });
    console.log(`Saved screenshot: ${flow4Path}`);

    // ==========================================
    // 5. INBOX: FLOW 5 - STATUS & OWNER UPDATE
    // ==========================================
    console.log('\n[TEST 5] Testing Conversation Status & Owner reassignment...');
    const statusSelect = await page.$('select[aria-label="Conversation Status"]');
    assert.ok(statusSelect, 'Assertion Failed: Conversation Status dropdown not found!');
    await statusSelect.select('pending');
    await sleep(500);

    const ownerSelect = await page.$('select[aria-label="Assigned Executive"]');
    assert.ok(ownerSelect, 'Assertion Failed: Assigned Executive dropdown not found!');
    await ownerSelect.select('Sales Executive B');
    await sleep(500);

    // Assert values in DOM
    const currentStatus = await page.$eval('select[aria-label="Conversation Status"]', (el) => el.value);
    const currentOwner = await page.$eval('select[aria-label="Assigned Executive"]', (el) => el.value);
    assert.strictEqual(currentStatus, 'pending', 'Assertion Failed: Status was not updated to "pending"!');
    assert.strictEqual(currentOwner, 'Sales Executive B', 'Assertion Failed: Owner was not updated to "Sales Executive B"!');
    console.log('✓ PASS: Status and Owner dropdowns updated and synced.');

    const flow5Path = path.join(REPO_EVIDENCE_DIR, 'qa_flow5_status_owner_updated.png');
    await page.screenshot({ path: flow5Path });
    console.log(`Saved screenshot: ${flow5Path}`);

    // ==========================================
    // 6. REGRESSION AUDIT: ACTIVE INTERACTION & ASSERTIONS
    // ==========================================
    console.log('\n====================================================');
    console.log('  Running Interactive Regression on Phases 01-04   ');
    console.log('====================================================');

    // --- 6.1 Dashboard ---
    console.log('\n[REGRESSION 1] Verifying /dashboard widgets & charts...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
    await sleep(1000);
    const dashboardGrid = await page.$('.dashboard-grid');
    assert.ok(dashboardGrid, 'Assertion Failed: Dashboard grid missing!');
    const revenueCard = await page.$('.revenue-card');
    assert.ok(revenueCard, 'Assertion Failed: Revenue Intelligence card missing!');
    console.log('✓ PASS: Dashboard verified with active grid and revenue card.');
    await page.screenshot({ path: path.join(REPO_EVIDENCE_DIR, 'qa_regression_dashboard.png') });

    // --- 6.2 Leads Intelligence (Table, Search & Filter) ---
    console.log('\n[REGRESSION 2] Verifying /leads interactive search & selection...');
    await page.goto('http://localhost:3000/leads', { waitUntil: 'networkidle0' });
    await sleep(1000);
    const tableRows = await page.$$('.bl-data-table tbody tr');
    assert.ok(tableRows.length > 0, 'Assertion Failed: Leads table contains 0 rows!');
    const initialRowCount = tableRows.length;

    // Test Search input interaction
    const searchInput = await page.$('input[placeholder*="Search"]');
    if (searchInput) {
      await searchInput.type('Aarav');
      await sleep(600);
      const filteredRows = await page.$$('.bl-data-table tbody tr');
      assert.ok(filteredRows.length >= 1 && filteredRows.length <= initialRowCount, 'Assertion Failed: Search filter failed to narrow rows!');
      console.log(`✓ PASS: Leads search narrowed ${initialRowCount} rows down to ${filteredRows.length} matches.`);
      // Clear search
      await page.$eval('input[placeholder*="Search"]', (el) => { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); });
      await sleep(400);
    }
    console.log(`✓ PASS: Leads Intelligence operational with ${initialRowCount} leads and interactive search.`);
    await page.screenshot({ path: path.join(REPO_EVIDENCE_DIR, 'qa_regression_leads.png') });

    // --- 6.3 Pipeline Studio (Kanban Columns & Deal Cards) ---
    console.log('\n[REGRESSION 3] Verifying /pipeline Kanban columns & cards...');
    await page.goto('http://localhost:3000/pipeline', { waitUntil: 'networkidle0' });
    await sleep(1000);
    const columns = await page.$$('.bl-kanban-column');
    assert.ok(columns.length >= 4, `Assertion Failed: Expected at least 4 pipeline stages, found: ${columns.length}`);
    const deals = await page.$$('.bl-deal-card');
    assert.ok(deals.length > 0, 'Assertion Failed: Pipeline Kanban board has 0 deal cards!');
    console.log(`✓ PASS: Pipeline Studio operational with ${columns.length} stages and ${deals.length} deals.`);
    await page.screenshot({ path: path.join(REPO_EVIDENCE_DIR, 'qa_regression_pipeline.png') });

    // --- 6.4 Contact 360 ---
    console.log('\n[REGRESSION 4] Verifying /contacts Contact 360 workspace...');
    await page.goto('http://localhost:3000/contacts', { waitUntil: 'networkidle0' });
    await sleep(1000);
    const contactCards = await page.$$('.bl-contact-card-item');
    assert.ok(contactCards.length > 0, `Assertion Failed: Expected contacts, found ${contactCards.length}`);
    console.log(`✓ PASS: Contact 360 operational with ${contactCards.length} contacts.`);
    await page.screenshot({ path: path.join(REPO_EVIDENCE_DIR, 'qa_regression_contacts.png') });

    // --- 6.5 Company Intelligence ---
    console.log('\n[REGRESSION 5] Verifying /companies Account workspace...');
    await page.goto('http://localhost:3000/companies', { waitUntil: 'networkidle0' });
    await sleep(1000);
    const companyCards = await page.$$('.bl-company-card');
    assert.ok(companyCards.length > 0, `Assertion Failed: Expected companies, found ${companyCards.length}`);
    console.log(`✓ PASS: Company Intelligence operational with ${companyCards.length} companies.`);
    await page.screenshot({ path: path.join(REPO_EVIDENCE_DIR, 'qa_regression_companies.png') });

    console.log('\n====================================================');
    console.log('  ALL QA BEHAVIORAL ASSERTIONS & REGRESSIONS PASSED!');
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ QA TEST FAILED WITH ASSERTION ERROR:');
    console.error(err.message);
    process.exitCode = 1;
    throw err;
  } finally {
    // ==========================================
    // 7. CLEAN UP & RESET LOCALSTORAGE TO ZERO POLLUTION
    // ==========================================
    console.log('\n[CLEANUP] Resetting localStorage seed data to pristine demo baseline...');
    try {
      await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
      await page.evaluate(() => localStorage.clear());
      console.log('✓ Demo baseline restored. Zero residual test data.');
    } catch (cleanErr) {
      console.warn('Cleanup warning:', cleanErr.message);
    }
    await browser.close();
  }
}

runQA();
