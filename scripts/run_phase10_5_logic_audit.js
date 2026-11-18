/**
 * BizLead Revenue OS — Phase 10.5 Behavioral Logic & RBAC Audit Suite
 *
 * Verifies:
 * 1. CRUD (Create, Edit, Delete) with persistence across page reloads for:
 *    - Leads
 *    - Deals
 *    - Contacts
 *    - Companies
 *    - Tasks
 *    - Meetings
 * 2. Required-field HTML5 & application form validation
 * 3. Role-Based Access Control (RBAC) Enforcement for Viewer role:
 *    - UI action buttons (Create/Edit/Delete) are hidden from DOM
 *    - Direct client-side invocation of mutation handlers is blocked with Unauthorized error
 */

const puppeteer = require('puppeteer-core');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

async function runLogicAudit() {
  console.log('========================================================================');
  console.log('  BizLead Phase 10.5: Behavioral CRUD, Persistence & RBAC Logic Audit   ');
  console.log('========================================================================');

  const ready = await isServerRunning();
  if (!ready) {
    console.error(`ERROR: Server not reachable at ${BASE_URL}. Ensure "npm run dev" is running.`);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    process.stdout.write(`TEST ${total}: ${name} ... `);
    try {
      await fn();
      passed++;
      console.log('PASSED [✓]');
    } catch (err) {
      console.log('FAILED [✗]');
      console.error(`       Error: ${err.message}`);
      throw err;
    }
  }

  try {
    // Ensure active testing member is Owner (mem-1) initially
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.setItem('bizlead_active_member_id_v1', JSON.stringify('mem-1'));
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(500);

    // =========================================================================
    // SECTION 1: CRUD & Persistence Across Reload
    // =========================================================================
    console.log('\n--- SECTION 1: Entity CRUD & Persistence Across Refresh ---');

    let createdLeadId = null;
    await test('Lead: Create entity via action and verify in memory state', async () => {
      await page.goto(`${BASE_URL}/leads`, { waitUntil: 'networkidle2' });
      await sleep(400);
      const res = await page.evaluate(async () => {
        const lead = await window.__BIZLEAD_ACTIONS__.createLead({
          name: 'Audit Lead Alpha',
          company: 'Alpha Corp Ltd',
          email: 'alpha@corp.in',
          phone: '+91 98765 43210',
          value: 125000,
          stage: 'new',
          source: 'Website Direct',
          priority: 'high',
          status: 'new',
        });
        return lead;
      });
      assert(res && res.id, 'Created lead must have valid ID');
      assert.strictEqual(res.name, 'Audit Lead Alpha');
      createdLeadId = res.id;
    });

    await test('Lead: Edit entity, reload page, and confirm persistence', async () => {
      await page.evaluate(async (id) => {
        await window.__BIZLEAD_ACTIONS__.updateLead(id, {
          value: 175000,
          status: 'contacted',
        });
      }, createdLeadId);

      // Hard page reload to test persistence from localStorage
      await page.reload({ waitUntil: 'networkidle2' });
      await sleep(600);

      const content = await page.content();
      assert(content.includes('Audit Lead Alpha'), 'Lead name must persist after reload');

      // Verify stored entity values
      const stored = await page.evaluate((id) => {
        const raw = localStorage.getItem('bizlead_crm_leads_v1');
        if (!raw) return null;
        const leads = JSON.parse(raw);
        return leads.find((l) => l.id === id);
      }, createdLeadId);

      assert(stored, 'Stored lead must exist in storage');
      assert.strictEqual(stored.value, 175000, 'Updated value must persist in storage');
      assert.strictEqual(stored.status, 'contacted', 'Updated status must persist in storage');
    });

    await test('Lead: Delete entity, reload page, and confirm removal', async () => {
      await page.evaluate(async (id) => {
        await window.__BIZLEAD_ACTIONS__.deleteLead(id);
      }, createdLeadId);

      await page.reload({ waitUntil: 'networkidle2' });
      await sleep(500);

      const content = await page.content();
      assert(!content.includes('Audit Lead Alpha'), 'Lead must not appear in UI after deletion');

      const existsInStorage = await page.evaluate((id) => {
        const raw = localStorage.getItem('bizlead_crm_leads_v1');
        if (!raw) return false;
        const leads = JSON.parse(raw);
        return leads.some((l) => l.id === id);
      }, createdLeadId);

      assert.strictEqual(existsInStorage, false, 'Lead must be purged from storage');
    });

    // ------------------ DEAL CRUD ------------------
    let createdDealId = null;
    await test('Deal: Create entity via action and verify pipeline state', async () => {
      await page.goto(`${BASE_URL}/pipeline`, { waitUntil: 'networkidle2' });
      await sleep(400);
      const deal = await page.evaluate(async () => {
        return await window.__BIZLEAD_ACTIONS__.createDeal({
          title: 'Enterprise ERP Modernization',
          value: 450000,
          stage: 'proposal',
          probability: 70,
          priority: 'high',
          expectedCloseDate: '2026-12-15',
        });
      });
      assert(deal && deal.id, 'Deal must have an ID');
      createdDealId = deal.id;
    });

    await test('Deal: Edit entity value/stage, reload, and confirm persistence', async () => {
      await page.evaluate(async (id) => {
        await window.__BIZLEAD_ACTIONS__.updateDeal(id, {
          value: 620000,
          stage: 'negotiation',
        });
      }, createdDealId);

      await page.reload({ waitUntil: 'networkidle2' });
      await sleep(600);

      const stored = await page.evaluate((id) => {
        const raw = localStorage.getItem('bizlead_crm_deals_v1');
        if (!raw) return null;
        const deals = JSON.parse(raw);
        return deals.find((d) => d.id === id);
      }, createdDealId);

      assert(stored, 'Deal must persist across reload');
      assert.strictEqual(stored.value, 620000, 'Deal value update must persist');
      assert.strictEqual(stored.stage, 'negotiation', 'Deal stage update must persist');
    });

    await test('Deal: Delete entity, reload, and confirm removal', async () => {
      await page.evaluate(async (id) => {
        await window.__BIZLEAD_ACTIONS__.deleteDeal(id);
      }, createdDealId);

      await page.reload({ waitUntil: 'networkidle2' });
      await sleep(500);

      const existsInStorage = await page.evaluate((id) => {
        const raw = localStorage.getItem('bizlead_crm_deals_v1');
        if (!raw) return false;
        const deals = JSON.parse(raw);
        return deals.some((d) => d.id === id);
      }, createdDealId);

      assert.strictEqual(existsInStorage, false, 'Deal must be removed from storage');
    });

    // ------------------ CONTACT CRUD ------------------
    let createdContactId = null;
    await test('Contact: Create entity via action and verify directory', async () => {
      await page.goto(`${BASE_URL}/contacts`, { waitUntil: 'networkidle2' });
      await sleep(400);
      const contact = await page.evaluate(async () => {
        return await window.__BIZLEAD_ACTIONS__.createContact({
          name: 'Suresh Raina',
          email: 'suresh@raina.in',
          phone: '+91 99887 76655',
          company: 'Alpha Corp Ltd',
          title: 'VP Technology',
        });
      });
      assert(contact && contact.id, 'Contact must have valid ID');
      createdContactId = contact.id;
    });

    await test('Contact: Edit title/email, reload, and confirm persistence', async () => {
      await page.evaluate(async (id) => {
        await window.__BIZLEAD_ACTIONS__.updateContact(id, {
          title: 'Chief Technology Officer',
          email: 'suresh.raina@raina.in',
        });
      }, createdContactId);

      await page.reload({ waitUntil: 'networkidle2' });
      await sleep(600);

      const stored = await page.evaluate((id) => {
        const raw = localStorage.getItem('bizlead_crm_contacts_v1');
        if (!raw) return null;
        const list = JSON.parse(raw);
        return list.find((c) => c.id === id);
      }, createdContactId);

      assert(stored, 'Contact must persist after reload');
      assert.strictEqual(stored.title, 'Chief Technology Officer');
      assert.strictEqual(stored.email, 'suresh.raina@raina.in');
    });

    await test('Contact: Delete entity, reload, and confirm removal', async () => {
      await page.evaluate(async (id) => {
        await window.__BIZLEAD_ACTIONS__.deleteContact(id);
      }, createdContactId);

      await page.reload({ waitUntil: 'networkidle2' });
      await sleep(500);

      const existsInStorage = await page.evaluate((id) => {
        const raw = localStorage.getItem('bizlead_crm_contacts_v1');
        if (!raw) return false;
        const list = JSON.parse(raw);
        return list.some((c) => c.id === id);
      }, createdContactId);

      assert.strictEqual(existsInStorage, false, 'Contact must be deleted from storage');
    });

    // ------------------ COMPANY CRUD ------------------
    let createdCompanyId = null;
    await test('Company: Create entity via action and verify companies list', async () => {
      await page.goto(`${BASE_URL}/companies`, { waitUntil: 'networkidle2' });
      await sleep(400);
      const company = await page.evaluate(async () => {
        return await window.__BIZLEAD_ACTIONS__.createCompany({
          name: 'Indus Logistics Pvt Ltd',
          domain: 'induslogistics.in',
          industry: 'Logistics',
          tier: 'mid_market',
        });
      });
      assert(company && company.id, 'Company must have valid ID');
      createdCompanyId = company.id;
    });

    await test('Company: Edit industry/tier, reload, and confirm persistence', async () => {
      await page.evaluate(async (id) => {
        await window.__BIZLEAD_ACTIONS__.updateCompany(id, {
          industry: 'Supply Chain Tech',
          tier: 'enterprise',
        });
      }, createdCompanyId);

      await page.reload({ waitUntil: 'networkidle2' });
      await sleep(600);

      const stored = await page.evaluate((id) => {
        const raw = localStorage.getItem('bizlead_crm_companies_v1');
        if (!raw) return null;
        const list = JSON.parse(raw);
        return list.find((c) => c.id === id);
      }, createdCompanyId);

      assert(stored, 'Company must persist after reload');
      assert.strictEqual(stored.industry, 'Supply Chain Tech');
      assert.strictEqual(stored.tier, 'enterprise');
    });

    await test('Company: Delete entity, reload, and confirm removal', async () => {
      await page.evaluate(async (id) => {
        await window.__BIZLEAD_ACTIONS__.deleteCompany(id);
      }, createdCompanyId);

      await page.reload({ waitUntil: 'networkidle2' });
      await sleep(500);

      const existsInStorage = await page.evaluate((id) => {
        const raw = localStorage.getItem('bizlead_crm_companies_v1');
        if (!raw) return false;
        const list = JSON.parse(raw);
        return list.some((c) => c.id === id);
      }, createdCompanyId);

      assert.strictEqual(existsInStorage, false, 'Company must be removed from storage');
    });

    // ------------------ TASK CRUD ------------------
    let createdTaskId = null;
    await test('Task: Create entity via action and verify tasks state', async () => {
      await page.goto(`${BASE_URL}/tasks`, { waitUntil: 'networkidle2' });
      await sleep(400);
      const task = await page.evaluate(async () => {
        return await window.__BIZLEAD_ACTIONS__.createTask({
          title: 'Review Q4 Forecast Presentation',
          type: 'follow_up',
          priority: 'high',
          status: 'pending',
          dueDate: '2026-12-01',
        });
      });
      assert(task && task.id, 'Task must have valid ID');
      createdTaskId = task.id;
    });

    await test('Task: Toggle completed state, reload, and confirm persistence', async () => {
      await page.evaluate(async (id) => {
        await window.__BIZLEAD_ACTIONS__.updateTask(id, {
          status: 'completed',
        });
      }, createdTaskId);

      await page.reload({ waitUntil: 'networkidle2' });
      await sleep(600);

      const stored = await page.evaluate((id) => {
        const raw = localStorage.getItem('bizlead_crm_tasks_v1');
        if (!raw) return null;
        const list = JSON.parse(raw);
        return list.find((t) => t.id === id);
      }, createdTaskId);

      assert(stored, 'Task must persist after reload');
      assert.strictEqual(stored.status, 'completed', 'Task completed status must persist');
    });

    await test('Task: Delete entity, reload, and confirm removal', async () => {
      await page.evaluate(async (id) => {
        await window.__BIZLEAD_ACTIONS__.deleteTask(id);
      }, createdTaskId);

      await page.reload({ waitUntil: 'networkidle2' });
      await sleep(500);

      const existsInStorage = await page.evaluate((id) => {
        const raw = localStorage.getItem('bizlead_crm_tasks_v1');
        if (!raw) return false;
        const list = JSON.parse(raw);
        return list.some((t) => t.id === id);
      }, createdTaskId);

      assert.strictEqual(existsInStorage, false, 'Task must be removed from storage');
    });

    // ------------------ MEETING CRUD ------------------
    let createdMeetingId = null;
    await test('Meeting: Create entity via action and verify meetings state', async () => {
      await page.goto(`${BASE_URL}/meetings`, { waitUntil: 'networkidle2' });
      await sleep(400);
      const meeting = await page.evaluate(async () => {
        return await window.__BIZLEAD_ACTIONS__.createMeeting({
          title: 'Strategic Contract Review',
          date: '2026-11-25',
          startTime: '14:00',
          endTime: '15:00',
          platform: 'google_meet',
          location: 'Online',
        });
      });
      assert(meeting && meeting.id, 'Meeting must have valid ID');
      createdMeetingId = meeting.id;
    });

    await test('Meeting: Edit title/outcome, reload, and confirm persistence', async () => {
      await page.evaluate(async (id) => {
        await window.__BIZLEAD_ACTIONS__.updateMeeting(id, {
          title: 'Final Executed Contract Review',
          status: 'completed',
        });
      }, createdMeetingId);

      await page.reload({ waitUntil: 'networkidle2' });
      await sleep(600);

      const stored = await page.evaluate((id) => {
        const raw = localStorage.getItem('bizlead_crm_meetings_v1');
        if (!raw) return null;
        const list = JSON.parse(raw);
        return list.find((m) => m.id === id);
      }, createdMeetingId);

      assert(stored, 'Meeting must persist after reload');
      assert.strictEqual(stored.title, 'Final Executed Contract Review');
      assert.strictEqual(stored.status, 'completed');
    });

    await test('Meeting: Delete entity, reload, and confirm removal', async () => {
      await page.evaluate(async (id) => {
        await window.__BIZLEAD_ACTIONS__.deleteMeeting(id);
      }, createdMeetingId);

      await page.reload({ waitUntil: 'networkidle2' });
      await sleep(500);

      const existsInStorage = await page.evaluate((id) => {
        const raw = localStorage.getItem('bizlead_crm_meetings_v1');
        if (!raw) return false;
        const list = JSON.parse(raw);
        return list.some((m) => m.id === id);
      }, createdMeetingId);

      assert.strictEqual(existsInStorage, false, 'Meeting must be removed from storage');
    });

    // =========================================================================
    // SECTION 2: Form Required-Field Validation
    // =========================================================================
    console.log('\n--- SECTION 2: Form Required-Field Validation ---');

    await test('Lead Form: Open modal and assert required fields validation', async () => {
      await page.goto(`${BASE_URL}/leads`, { waitUntil: 'networkidle2' });
      await sleep(400);

      // Click Add Lead button
      const buttons = await page.$$('button');
      let addBtn = null;
      for (const b of buttons) {
        const txt = await b.evaluate((el) => el.innerText || '');
        if (txt.toLowerCase().includes('add lead')) {
          addBtn = b;
          break;
        }
      }
      assert(addBtn, 'Add lead button must exist');
      await addBtn.click();
      await sleep(400);

      // Check required attributes on form inputs
      const validationState = await page.evaluate(() => {
        const nameInput = document.querySelector('input[required]');
        return {
          hasNameInput: !!nameInput,
          isRequired: nameInput ? nameInput.hasAttribute('required') : false,
          isEmptyInvalid: nameInput ? !nameInput.checkValidity() : false,
        };
      });

      assert(validationState.hasNameInput, 'Lead form name input must exist');
      assert(validationState.isRequired, 'Lead name input must be marked as required');
      assert(validationState.isEmptyInvalid, 'Empty required field must fail checkValidity()');
    });

    await test('Company Form: Assert required name validation', async () => {
      await page.goto(`${BASE_URL}/companies`, { waitUntil: 'networkidle2' });
      await sleep(400);

      const buttons = await page.$$('button');
      let addBtn = null;
      for (const b of buttons) {
        const txt = await b.evaluate((el) => el.innerText || '');
        if (txt.toLowerCase().includes('add company')) {
          addBtn = b;
          break;
        }
      }
      assert(addBtn, 'Add company button must exist');
      await addBtn.click();
      await sleep(400);

      const validationState = await page.evaluate(() => {
        const nameInput = document.querySelector('.bl-modal-content input[required]');
        return {
          hasNameInput: !!nameInput,
          isRequired: nameInput ? nameInput.hasAttribute('required') : false,
          isEmptyInvalid: nameInput ? !nameInput.checkValidity() : false,
        };
      });

      assert(validationState.hasNameInput, 'Company name input must exist');
      assert(validationState.isRequired, 'Company name input must have required attribute');
      assert(validationState.isEmptyInvalid, 'Empty company name must fail checkValidity()');
    });

    // =========================================================================
    // SECTION 3: RBAC Viewer Role Enforcement
    // =========================================================================
    console.log('\n--- SECTION 3: Role-Based Access Control (RBAC) Enforcement ---');

    await test('RBAC: Switch testing active identity to Viewer role (mem-6: Meera Sen)', async () => {
      await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle2' });
      await page.evaluate(() => {
        localStorage.setItem('bizlead_active_member_id_v1', JSON.stringify('mem-6'));
      });
      await page.reload({ waitUntil: 'networkidle2' });
      await sleep(600);

      const activeRoleText = await page.evaluate(() => {
        const el = document.querySelector('.bl-role-pill-role, .bl-role-switcher-badge');
        return el ? el.innerText.trim().toLowerCase() : '';
      });

      assert(activeRoleText.includes('viewer'), `Active role must be Viewer, got "${activeRoleText}"`);
    });

    await test('RBAC UI: Viewer cannot see Create buttons on CRM routes', async () => {
      // 1. Leads route
      await page.goto(`${BASE_URL}/leads`, { waitUntil: 'networkidle2' });
      await sleep(300);
      const leadAddBtn = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.some((b) => {
          const t = (b.innerText || '').toLowerCase();
          return t.includes('add lead') || t.includes('new lead');
        });
      });
      assert.strictEqual(leadAddBtn, false, 'Viewer must not see "Add Lead" button');

      // 2. Pipeline route
      await page.goto(`${BASE_URL}/pipeline`, { waitUntil: 'networkidle2' });
      await sleep(300);
      const dealAddBtn = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.some((b) => {
          const t = (b.innerText || '').toLowerCase();
          return t.includes('new deal') || t.includes('add deal');
        });
      });
      assert.strictEqual(dealAddBtn, false, 'Viewer must not see "New Deal" button');

      // 3. Contacts route
      await page.goto(`${BASE_URL}/contacts`, { waitUntil: 'networkidle2' });
      await sleep(300);
      const contactAddBtn = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.some((b) => {
          const t = (b.innerText || '').toLowerCase();
          return t.includes('add contact') || t.includes('new contact');
        });
      });
      assert.strictEqual(contactAddBtn, false, 'Viewer must not see "Add Contact" button');

      // 4. Companies route
      await page.goto(`${BASE_URL}/companies`, { waitUntil: 'networkidle2' });
      await sleep(300);
      const companyAddBtn = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.some((b) => {
          const t = (b.innerText || '').toLowerCase();
          return t.includes('add company') || t.includes('new company');
        });
      });
      assert.strictEqual(companyAddBtn, false, 'Viewer must not see "Add Company" button');
    });

    await test('RBAC Enforcement: Direct handler invocation as Viewer is strictly blocked', async () => {
      await page.goto(`${BASE_URL}/leads`, { waitUntil: 'networkidle2' });
      await sleep(300);

      // Attempt to call createLead directly as Viewer
      const leadResult = await page.evaluate(async () => {
        try {
          await window.__BIZLEAD_ACTIONS__.createLead({
            name: 'Malicious Injected Lead',
            company: 'Unauthorized Corp',
            email: 'hacker@unauth.io',
            value: 999999,
          });
          return { blocked: false };
        } catch (err) {
          return { blocked: true, message: err.message };
        }
      });
      assert.strictEqual(leadResult.blocked, true, 'createLead must reject when invoked by Viewer');
      assert(leadResult.message.includes('Unauthorized'), `Error must mention Unauthorized: ${leadResult.message}`);

      // Attempt to call deleteLead directly as Viewer
      const deleteLeadResult = await page.evaluate(async () => {
        try {
          await window.__BIZLEAD_ACTIONS__.deleteLead('lead-1');
          return { blocked: false };
        } catch (err) {
          return { blocked: true, message: err.message };
        }
      });
      assert.strictEqual(deleteLeadResult.blocked, true, 'deleteLead must reject when invoked by Viewer');

      // Attempt to call createDeal directly as Viewer
      const dealResult = await page.evaluate(async () => {
        try {
          await window.__BIZLEAD_ACTIONS__.createDeal({
            title: 'Unauthorized Injected Deal',
            value: 1000000,
            stage: 'proposal',
          });
          return { blocked: false };
        } catch (err) {
          return { blocked: true, message: err.message };
        }
      });
      assert.strictEqual(dealResult.blocked, true, 'createDeal must reject when invoked by Viewer');

      // Attempt to call createContact directly as Viewer
      const contactResult = await page.evaluate(async () => {
        try {
          await window.__BIZLEAD_ACTIONS__.createContact({
            name: 'Unauthorized Contact',
            email: 'unauth@test.in',
          });
          return { blocked: false };
        } catch (err) {
          return { blocked: true, message: err.message };
        }
      });
      assert.strictEqual(contactResult.blocked, true, 'createContact must reject when invoked by Viewer');

      // Attempt to call createCompany directly as Viewer
      const companyResult = await page.evaluate(async () => {
        try {
          await window.__BIZLEAD_ACTIONS__.createCompany({
            name: 'Unauthorized Company',
            domain: 'unauth.in',
          });
          return { blocked: false };
        } catch (err) {
          return { blocked: true, message: err.message };
        }
      });
      assert.strictEqual(companyResult.blocked, true, 'createCompany must reject when invoked by Viewer');

      // Attempt to call createTask directly as Viewer
      const taskResult = await page.evaluate(async () => {
        try {
          await window.__BIZLEAD_ACTIONS__.createTask({
            title: 'Unauthorized Task',
          });
          return { blocked: false };
        } catch (err) {
          return { blocked: true, message: err.message };
        }
      });
      assert.strictEqual(taskResult.blocked, true, 'createTask must reject when invoked by Viewer');

      // Attempt to call createMeeting directly as Viewer
      const meetingResult = await page.evaluate(async () => {
        try {
          await window.__BIZLEAD_ACTIONS__.createMeeting({
            title: 'Unauthorized Meeting',
            date: '2026-12-01',
            startTime: '10:00',
            endTime: '11:00',
          });
          return { blocked: false };
        } catch (err) {
          return { blocked: true, message: err.message };
        }
      });
      assert.strictEqual(meetingResult.blocked, true, 'createMeeting must reject when invoked by Viewer');
    });

    // Reset identity back to mem-1 (Owner)
    await page.evaluate(() => {
      localStorage.setItem('bizlead_active_member_id_v1', JSON.stringify('mem-1'));
    });

    console.log('\n========================================================================');
    console.log(`  ALL ${total} BEHAVIORAL LOGIC & RBAC AUDIT TESTS PASSED (${passed}/${total})`);
    console.log('========================================================================\n');
  } catch (err) {
    console.error('\n❌ Logic Audit Suite encountered an error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runLogicAudit().catch((err) => {
  console.error('Fatal Logic Audit Error:', err);
  process.exit(1);
});
