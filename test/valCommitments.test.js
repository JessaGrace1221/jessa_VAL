const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createValCommitmentsService,
  normalizeCommitment,
  ownerFromText,
  parseDueHint
} = require('../services/valCommitments');

test('commitment owner and due-date helpers classify executive promises', () => {
  assert.equal(ownerFromText('I will send Michele chapter feedback tomorrow', 'outbound'), 'user');
  assert.equal(ownerFromText('Can you send the signed proposal Friday?', 'inbound'), 'user');
  assert.equal(ownerFromText("We'll approve after legal reviews it", 'inbound'), 'contact');

  const due = new Date(parseDueHint('please follow up Friday', new Date('2026-07-05T12:00:00Z')));
  assert.equal(due.getUTCDay(), 5);
});

test('unknown contact-owned commitments are held for resolution', () => {
  const commitment = normalizeCommitment({
    title: 'Allen owes assessment notes',
    evidence_quote: 'Allen will send the assessment notes after the call.',
    owner_type: 'contact',
    owner_name: 'Allen'
  }, [], {});

  assert.equal(commitment.status, 'needs_resolution');
  assert.equal(commitment.owner_name, 'Allen');
});

test('commitments ledger normalizes transcript and email commitments into one accountable list', async () => {
  let store = {
    transcriptIntelligenceRuns: [{
      id: 'run_1',
      tenantId: 'tenant_1',
      userId: 'user_1',
      transcriptId: 'transcript_1',
      commitmentsJson: [{
        id: 'chapter-feedback',
        title: 'Send Michele chapter feedback',
        summary: 'Jessa promised to send Michele chapter feedback tomorrow.',
        source_quote: 'I will send Michele chapter feedback tomorrow.',
        owner: 'user_or_team',
        due_hint: 'tomorrow',
        confidence: 0.91
      }],
      linkageJson: {linked_people: [{name: 'Michele', contactId: 'contact_michele'}]},
      createdAt: '2026-07-05T12:00:00Z',
      updatedAt: '2026-07-05T12:00:00Z'
    }],
    conversationClassifications: [{
      id: 'classification_1',
      tenantId: 'tenant_1',
      userId: 'user_1',
      unifiedConversationId: 'conversation_1',
      commitmentsJson: [{
        text: "We'll approve this after legal reviews it.",
        messageId: 'message_1',
        direction: 'inbound'
      }],
      contextJson: {
        latest_inbound: {
          from: {name: 'Greg', email: 'greg@example.com'},
          subject: 'Proposal approval'
        }
      },
      createdAt: '2026-07-05T13:00:00Z',
      updatedAt: '2026-07-05T13:00:00Z'
    }],
    valCommitmentOverrides: []
  };

  const savedDrafts = [];
  const savedTasks = [];
  const service = createValCommitmentsService({
    getStore: () => store,
    saveStore: (nextStore) => { store = nextStore; },
    tenantId: () => 'tenant_1',
    userId: () => 'user_1',
    listRelationshipContacts: async () => [
      {name: 'Michele', contactId: 'contact_michele'},
      {name: 'Greg', email: 'greg@example.com', contactId: 'contact_greg'}
    ],
    uuid: (prefix) => prefix + '_123',
    saveDraft: async (draft) => {
      const saved = {id: 'draft_123', ...draft};
      savedDrafts.push(saved);
      return saved;
    },
    saveTask: async (task) => {
      savedTasks.push(task);
      return task;
    }
  });

  const result = await service.list();
  assert.equal(result.ok, true);
  assert.equal(result.commitments.length, 2);
  assert.equal(result.summary.you_owe, 1);
  assert.equal(result.summary.others_owe_you, 1);

  const transcriptCommitment = result.commitments.find((item) => item.source_type === 'transcript');
  const emailCommitment = result.commitments.find((item) => item.source_type === 'email');
  assert.equal(transcriptCommitment.owner_type, 'user');
  assert.equal(emailCommitment.owner_type, 'contact');
  assert.equal(emailCommitment.owner_contact_id, 'contact_greg');

  const draftResult = await service.draftEmail(transcriptCommitment.id);
  assert.equal(draftResult.no_external_action, true);
  assert.equal(draftResult.commitment.status, 'drafted');
  assert.equal(savedDrafts[0].sourceContext.noExternalAction, true);

  const taskResult = await service.createTask(transcriptCommitment.id);
  assert.equal(taskResult.no_external_action, true);
  assert.equal(taskResult.commitment.task_id, 'task_123');
  assert.equal(savedTasks[0].source, 'commitments_ledger');

  const completed = await service.updateStatus(transcriptCommitment.id, {status: 'complete'});
  assert.equal(completed.commitment.status, 'complete');
});
