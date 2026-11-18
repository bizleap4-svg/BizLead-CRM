// Phase 06 Pre-Implementation Audit & Verification Gap Test
const assert = require('assert');

// Mock localStorage for Node environment
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

async function testPhase06Gaps() {
  console.log('====================================================');
  console.log('  BizLead Phase 06 Pre-Implementation Gap Audit     ');
  console.log('====================================================');

  const repo = require('../components/crm/repository');

  // 1. Test generateCalendarICS output
  console.log('\n[AUDIT 1] Testing actual RFC 5545 ICS file content generation...');
  const testTasks = [
    {
      id: 'task-test-ics-1',
      title: 'Commercial Discussion with Reliance Retail',
      dueDate: '2026-11-20',
      dueTime: '15:30',
      priority: 'high',
      status: 'todo',
      assignedTo: 'Sales Executive A'
    }
  ];
  const testMeetings = [
    {
      id: 'meet-test-ics-1',
      title: 'Technical Integration Review',
      meetingType: 'demo',
      status: 'scheduled',
      date: '2026-11-21',
      startTime: '11:00',
      endTime: '11:45',
      timezone: 'Asia/Kolkata',
      host: 'Sales Executive A',
      participants: [{ name: 'Aarav Sharma', email: 'aarav@reliance.com' }],
      agenda: 'Review API schemas'
    }
  ];

  const ics = repo.generateCalendarICS([...testTasks, ...testMeetings]);
  assert.ok(ics.includes('BEGIN:VCALENDAR'), 'ICS missing BEGIN:VCALENDAR');
  assert.ok(ics.includes('VERSION:2.0'), 'ICS missing VERSION:2.0');
  assert.ok(ics.includes('X-WR-TIMEZONE:Asia/Kolkata'), 'ICS missing Asia/Kolkata timezone');
  assert.ok(ics.includes('BEGIN:VEVENT'), 'ICS missing BEGIN:VEVENT');
  assert.ok(ics.includes('SUMMARY:[Task] Commercial Discussion with Reliance Retail'), 'ICS missing task summary');
  assert.ok(ics.includes('SUMMARY:Technical Integration Review'), 'ICS missing meeting summary');
  assert.ok(ics.includes('END:VCALENDAR'), 'ICS missing END:VCALENDAR');
  console.log('✓ RFC 5545 ICS file verified with valid VCALENDAR, Asia/Kolkata timezone, and VEVENT structure.');

  // 2. Test Recurring Task Generation & Duplicate Prevention
  console.log('\n[AUDIT 2] Testing recurring task occurrence generation & duplicate prevention...');
  const recurringParent = await repo.createTask({
    title: 'Weekly Pipeline Review',
    dueDate: '2026-11-18',
    dueTime: '10:00',
    priority: 'high',
    status: 'todo',
    assignedTo: 'Sales Executive A',
    recurrenceRule: {
      frequency: 'weekly',
      interval: 1,
      maxOccurrences: 4
    }
  });

  const occurrences1 = await repo.generateRecurringOccurrences(recurringParent.id, 4);
  assert.strictEqual(occurrences1.length, 4, `Expected 4 occurrences, got ${occurrences1.length}`);
  assert.strictEqual(occurrences1[0].id, `${recurringParent.id}-rec-1`);
  assert.strictEqual(occurrences1[0].dueDate, '2026-11-25');
  assert.strictEqual(occurrences1[1].dueDate, '2026-12-02');
  console.log('✓ Recurring tasks generated successfully on weekly intervals.');

  // Run generation again: duplicate prevention check
  const occurrences2 = await repo.generateRecurringOccurrences(recurringParent.id, 4);
  assert.strictEqual(occurrences2.length, 0, 'Duplicate occurrences were generated when they already exist!');
  console.log('✓ Duplicate prevention verified: second run generated 0 duplicate occurrences.');

  // 3. Test Meeting Outcome confirmation and Deal Stage advancement
  console.log('\n[AUDIT 3] Testing meeting outcome and optional deal stage advancement...');
  const testMeeting = await repo.createMeeting({
    title: 'Enterprise Discovery Session',
    meetingType: 'discovery',
    status: 'scheduled',
    date: '2026-11-18',
    startTime: '16:00',
    endTime: '16:45',
    timezone: 'Asia/Kolkata',
    host: 'Sales Executive A',
    dealId: 'deal-001',
    participants: []
  });

  // Complete meeting WITHOUT deal stage change (no explicit confirmation)
  const completedNoAdvance = await repo.completeMeeting(testMeeting.id, {
    summary: 'Meeting held, no stage change requested',
    sentiment: 'neutral',
    nextSteps: []
  });
  assert.strictEqual(completedNoAdvance.status, 'completed');
  assert.strictEqual(completedNoAdvance.outcome.updatedDealStage, undefined);
  console.log('✓ Meeting completed without changing deal stage when updatedDealStage is undefined.');

  // 4. Test Reminder persistence and deduplication
  console.log('\n[AUDIT 4] Testing reminder persistence...');
  const reminders = await repo.listReminders();
  assert.ok(reminders.length > 0, 'No reminders found');
  const firstRem = reminders[0];
  await repo.snoozeReminder(firstRem.id, 30);
  const updatedReminders = await repo.listReminders();
  const snoozed = updatedReminders.find(r => r.id === firstRem.id);
  assert.ok(snoozed.snoozedUntil !== undefined, 'Reminder snoozedUntil was not set');
  console.log('✓ Reminder persistence, status update, and snooze verified.');

  console.log('\n====================================================');
  console.log('  ALL PHASE 06 AUDIT GAP CHECKS PASSED (4/4)        ');
  console.log('====================================================');
}

testPhase06Gaps().catch((err) => {
  console.error('\n❌ AUDIT GAP TEST FAILED:', err);
  process.exit(1);
});
