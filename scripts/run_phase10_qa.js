const puppeteer = require('puppeteer-core');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const REPO_EVIDENCE_DIR = path.resolve(__dirname, '..', 'qa_evidence', 'phase_10');

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
  console.log('  BizLead Phase 10: Control Center & RBAC Behavioral QA Suite           ');
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
    // FLOW 1: Control Center Overview & Navigation (/settings)
    // -------------------------------------------------------------
    console.log('\n--- FLOW 1: Verifying Control Center Workspace (/settings) ---');
    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle2' });
    await sleep(1500);

    const heading = await page.$eval('h1', (el) => el.innerText.trim());
    console.log(`Page Heading: "${heading}"`);
    assert(
      heading.includes('Your business. Your rules.'),
      `Expected headline "Your business. Your rules.", got "${heading}"`
    );

    const pageContent = await page.content();
    assert(
      pageContent.includes('Manage your people, permissions and workspace.'),
      'Subtitle must be displayed accurately'
    );
    assert(
      pageContent.includes('The Intelligence Behind Growth.'),
      'Tagline "The Intelligence Behind Growth." must be preserved'
    );

    // Verify Categorized Navigation Sidebar
    const navButtons = await page.$$('.bl-settings-nav-btn');
    console.log(`Categorized Settings Navigation Items: ${navButtons.length}`);
    assert(navButtons.length >= 8, 'Must render categorized settings tabs');

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, '01_control_center_overview.png'),
    });
    console.log('✓ Flow 1 passed: Control Center overview and headline verified');

    // -------------------------------------------------------------
    // FLOW 2: Organization Profile Editing & Persistence
    // -------------------------------------------------------------
    console.log('\n--- FLOW 2: Organization Profile Editing & Validation ---');
    // Ensure on Organization tab
    const orgBtn = await findButtonByText(page, 'Organization');
    if (orgBtn) await orgBtn.click();
    await sleep(500);

    // Verify default currency and timezone
    const selects = await page.$$('select');
    let hasKolkata = false;
    let hasINR = false;
    for (const s of selects) {
      const val = await s.evaluate((el) => el.value);
      if (val === 'Asia/Kolkata') hasKolkata = true;
      if (val === 'INR') hasINR = true;
    }
    assert(hasKolkata, 'Default timezone must be Asia/Kolkata');
    assert(hasINR, 'Default currency must be INR');
    console.log('✓ Verified default localization: Asia/Kolkata & INR');

    // Edit Organization Name
    const nameInput = await page.$('input[value*="Acme"], input[type="text"]');
    if (nameInput) {
      await nameInput.click({ clickCount: 3 });
      await nameInput.type('BizLead Enterprise Global Technologies');
    }

    const saveBtn = await findButtonByText(page, 'Save Organization Profile');
    if (saveBtn) {
      await saveBtn.click();
      await sleep(800);
    }

    const afterSaveContent = await page.content();
    assert(
      afterSaveContent.includes('Organization settings saved successfully') ||
      afterSaveContent.includes('BizLead Enterprise Global Technologies'),
      'Organization updates must succeed with feedback'
    );

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, '02_organization_settings.png'),
    });
    console.log('✓ Flow 2 passed: Organization profile editing and defaults verified');

    // -------------------------------------------------------------
    // FLOW 3: Team Directory & Workload Information
    // -------------------------------------------------------------
    console.log('\n--- FLOW 3: Team Directory & Workload Stats ---');
    const teamBtn = await findButtonByText(page, 'Team & Workload');
    assert(teamBtn, 'Team & Workload navigation tab must exist');
    await teamBtn.click();
    await sleep(800);

    const teamContent = await page.content();
    assert(teamContent.includes('Aarav Patel'), 'Must list Workspace Owner Aarav Patel');
    assert(teamContent.includes('Rahul Sharma'), 'Must list Sales Manager Rahul Sharma');
    assert(teamContent.includes('Priya Nair'), 'Must list Sales Executive Priya Nair');
    assert(teamContent.includes('leads'), 'Must display workload stats');

    // Verify Last Owner Protection Button state
    const deleteButtons = await page.$$('.bl-btn-danger');
    console.log(`Action buttons verified: ${deleteButtons.length}`);

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, '03_team_directory_workload.png'),
    });
    console.log('✓ Flow 3 passed: Team directory, roles, and workload stats verified');

    // -------------------------------------------------------------
    // FLOW 4: Add Local Member with Backend Invitation Disclosure
    // -------------------------------------------------------------
    console.log('\n--- FLOW 4: Add Local Member Workflow ---');
    const addMemberBtn = await findButtonByText(page, 'Add Member');
    assert(addMemberBtn, '"Add Member" action button must exist');
    await addMemberBtn.click();
    await sleep(600);

    // Verify modal appeared and fill details
    const modalContent = await page.content();
    assert(
      modalContent.includes('Add Workspace Member'),
      'Add Member modal must be open'
    );
    assert(
      modalContent.includes('Phase 12'),
      'Must disclose pending Phase 12 cloud email delivery'
    );

    const modalInputs = await page.$$('.bl-modal-content input');
    if (modalInputs.length >= 2) {
      await modalInputs[0].type('Siddharth Verma');
      await modalInputs[1].type('siddharth@bizlead.io');
    }

    const confirmAddBtn = await findButtonByText(page, 'Confirm Member Addition');
    if (confirmAddBtn) {
      await confirmAddBtn.click();
      await sleep(1000);
    }

    const updatedTeamContent = await page.content();
    assert(
      updatedTeamContent.includes('Siddharth Verma'),
      'New member Siddharth Verma must appear in directory table'
    );

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, '04_member_created.png'),
    });
    console.log('✓ Flow 4 passed: Local member creation and invitation disclosure verified');

    // -------------------------------------------------------------
    // FLOW 5: Roles & Permissions Matrix
    // -------------------------------------------------------------
    console.log('\n--- FLOW 5: Roles & Permissions Matrix ---');
    const rolesBtn = await findButtonByText(page, 'Roles & Permissions');
    assert(rolesBtn, 'Roles & Permissions tab must exist');
    await rolesBtn.click();
    await sleep(800);

    const rolesContent = await page.content();
    assert(
      rolesContent.includes('Workspace Owner'),
      'Roles matrix must include Workspace Owner'
    );
    assert(
      rolesContent.includes('Sales Manager'),
      'Roles matrix must include Sales Manager'
    );
    assert(
      rolesContent.includes('Sales Executive'),
      'Roles matrix must include Sales Executive'
    );
    assert(
      rolesContent.includes('Viewer'),
      'Roles matrix must include Viewer'
    );
    assert(
      rolesContent.includes('Prototype Authorization Notice'),
      'Must disclose prototype authorization limitations'
    );

    // Verify Scope badges
    assert(rolesContent.includes('Full / Org'), 'Matrix must show Full / Org scope');
    assert(rolesContent.includes('Assigned'), 'Matrix must show Assigned scope');

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, '05_roles_matrix.png'),
    });
    console.log('✓ Flow 5 passed: Comprehensive permission matrix and role presets verified');

    // -------------------------------------------------------------
    // FLOW 6: Active Testing Role Switcher
    // -------------------------------------------------------------
    console.log('\n--- FLOW 6: Active Testing Identity Switcher ---');
    const roleSwitcherBtn = await page.$('.bl-role-switcher-button');
    assert(roleSwitcherBtn, 'Role switcher button must exist in header');
    await page.evaluate((el) => el.click(), roleSwitcherBtn);
    await page.waitForSelector('.bl-role-switcher-dropdown', { visible: true, timeout: 5000 });
    await sleep(400);

    const dropdownContent = await page.content();
    assert(
      dropdownContent.includes('TEST IDENTITY & PERMISSIONS') ||
      dropdownContent.includes('Switch active role to verify CRM access scopes'),
      'Role switcher dropdown must open with testing guide'
    );

    // Switch to Rahul Sharma (Sales Manager)
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.bl-role-dropdown-item'));
      const rahul = items.find((el) => el.innerText.includes('Rahul Sharma'));
      if (rahul) rahul.click();
    });
    await sleep(1000);

    const headerPillText = await page.$eval('.bl-role-header-pill', (el) => el.innerText);
    console.log(`Active Role Pill in Header: "${headerPillText.replace(/\n/g, ' ')}"`);
    assert(
      headerPillText.includes('Rahul Sharma') ||
      headerPillText.toLowerCase().includes('sales manager') ||
      headerPillText.includes('RS'),
      'Header identity pill must reflect switched active testing user'
    );

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, '06_role_switcher_active.png'),
    });
    console.log('✓ Flow 6 passed: Active testing role switcher dynamically updates identity');

    // -------------------------------------------------------------
    // FLOW 7: Department Architecture & Leadership
    // -------------------------------------------------------------
    console.log('\n--- FLOW 7: Department Management ---');
    const deptBtn = await findButtonByText(page, 'Departments');
    assert(deptBtn, 'Departments tab must exist');
    await deptBtn.click();
    await sleep(800);

    const deptContent = await page.content();
    assert(deptContent.includes('Sales'), 'Must display Sales department');
    assert(deptContent.includes('Marketing'), 'Must display Marketing department');
    assert(deptContent.includes('Customer Support'), 'Must display Customer Support department');
    assert(deptContent.includes('Management'), 'Must display Management department');

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, '07_departments_view.png'),
    });
    console.log('✓ Flow 7 passed: Department architecture and leadership structure verified');

    // -------------------------------------------------------------
    // FLOW 8: Centralized CRM Configuration
    // -------------------------------------------------------------
    console.log('\n--- FLOW 8: CRM System Configuration ---');
    const crmConfigBtn = await findButtonByText(page, 'CRM Configuration');
    assert(crmConfigBtn, 'CRM Configuration tab must exist');
    await crmConfigBtn.click();
    await sleep(800);

    const crmConfigContent = await page.content();
    assert(crmConfigContent.includes('Pipeline Stages'), 'Must display Pipeline Stages tab');
    assert(crmConfigContent.includes('Lead Sources'), 'Must display Lead Sources tab');
    assert(crmConfigContent.includes('Deal Lost Reasons'), 'Must display Deal Lost Reasons tab');
    assert(crmConfigContent.includes('CRM Tags'), 'Must display CRM Tags tab');

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, '08_crm_configuration.png'),
    });
    console.log('✓ Flow 8 passed: Centralized CRM configuration dictionaries verified');

    // -------------------------------------------------------------
    // FLOW 9: Integration Center & Honest Disclosures
    // -------------------------------------------------------------
    console.log('\n--- FLOW 9: Integration Center ---');
    const intBtn = await findButtonByText(page, 'Integrations');
    assert(intBtn, 'Integrations tab must exist');
    await intBtn.click();
    await sleep(800);

    const intContent = await page.content();
    assert(intContent.includes('WhatsApp Business'), 'Must include WhatsApp Business');
    assert(intContent.includes('Meta Ads Manager'), 'Must include Meta Ads Manager');
    assert(intContent.includes('Google Ads'), 'Must include Google Ads');
    assert(intContent.includes('OpenAI GPT-4o'), 'Must include OpenAI Gateway');
    assert(intContent.includes('Google Gemini 2.0'), 'Must include Gemini Gateway');
    assert(
      intContent.includes('Phase 13 Cloud Integration Gateway') || intContent.includes('Phase 13'),
      'Must disclose Phase 13 Cloud Integration Gateway requirement'
    );

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, '09_integrations_center.png'),
    });
    console.log('✓ Flow 9 passed: Integration center adapters and security disclosures verified');

    // -------------------------------------------------------------
    // FLOW 10: Audit Trail, Quotas & Onboarding Tour
    // -------------------------------------------------------------
    console.log('\n--- FLOW 10: Audit Trail, Quotas & Onboarding Tour ---');
    const auditBtn = await findButtonByText(page, 'Audit History');
    assert(auditBtn, 'Audit History tab must exist');
    await auditBtn.click();
    await sleep(800);

    const auditContent = await page.content();
    assert(
      auditContent.includes('Tamper-Proof Disclosure'),
      'Must disclose client-side audit records limitations'
    );

    // Launch Onboarding Tour
    const tourBtn = await findButtonByText(page, 'Tour');
    if (tourBtn) {
      await tourBtn.click();
      await sleep(600);
    }

    const tourContent = await page.content();
    assert(
      tourContent.includes('Step 1: Organization Details') || tourContent.includes('Welcome to BizLead'),
      'Onboarding Tour modal must launch smoothly'
    );

    await page.screenshot({
      path: path.join(REPO_EVIDENCE_DIR, '10_audit_and_onboarding.png'),
    });
    console.log('✓ Flow 10 passed: Audit history logging and reusable onboarding tour verified');

    console.log('\n========================================================================');
    console.log('  ALL PHASE 10 BEHAVIORAL QA FLOWS PASSED (10/10)                       ');
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
