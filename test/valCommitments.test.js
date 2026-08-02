const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createValCommitmentsService,
  actionItemLinesFromBlob,
  commitmentSeedVariants,
  hasExecutiveCommitmentShape,
  normalizeCommitment,
  ownerFromText,
  parseDueHint
} = require('../services/valCommitments');

test('commitment owner and due-date helpers classify executive promises', () => {
  assert.equal(ownerFromText('I will send Michele chapter feedback tomorrow', 'outbound'), 'user');
  assert.equal(ownerFromText('Can you send the signed proposal Friday?', 'inbound'), 'user');
  assert.equal(ownerFromText("We'll approve after legal reviews it", 'inbound'), 'contact');
  assert.equal(ownerFromText('Greg to compile member asks before Tuesday', 'inbound'), 'contact');

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

test('commitment admission rejects transcript noise and keeps accountable follow-through', () => {
  assert.equal(hasExecutiveCommitmentShape({
    title: 'Your calendar has a restraining order, and even your coffee takes a deep breath before dealing with your morning face.',
    confidence: 0.72
  }), false);
  assert.equal(hasExecutiveCommitmentShape({
    title: 'I want you to not hold back and be as vulgar as you need to be.',
    confidence: 0.72
  }), false);
  assert.equal(hasExecutiveCommitmentShape({
    title: 'Before we get started, I have to say that this is not legal advice, and I strongly recommend against you doing any of the things I am about to tell you.',
    confidence: 0.72
  }), false);
  assert.equal(hasExecutiveCommitmentShape({
    title: 'We will have a meeting of the minds, and if it is still a good fit, I will try again.',
    confidence: 0.72
  }), false);
  assert.equal(hasExecutiveCommitmentShape({
    title: 'Can you share screen for.',
    confidence: 0.72
  }), false);
  assert.equal(hasExecutiveCommitmentShape({
    title: 'And it will do the things and will say, I got this far into this proposal, I need you to answer these questions.',
    confidence: 0.72
  }), false);
  assert.equal(hasExecutiveCommitmentShape({
    title: "We'll email you when it's ready.",
    confidence: 0.72
  }), false);
  assert.equal(hasExecutiveCommitmentShape({
    title: "You'll see everything that has happened, every workflow that they're in, and you can just click to make a write an email.",
    confidence: 0.72
  }), false);
  assert.equal(hasExecutiveCommitmentShape({
    title: "So if they call, nobody answers, they'll get a text, and then we'll wait 24 hours.",
    confidence: 0.72
  }), false);
  assert.equal(hasExecutiveCommitmentShape({
    title: 'Jessa to finish the projections dashboard handoff with Mike before Monday.',
    source_quote: 'Jessa to finish the projections dashboard handoff with Mike before Monday.',
    confidence: 0.91
  }), true);
});

test('commitment service splits transcript action-item blobs before they reach Home', () => {
  const blob = `Hi everyone, Here are the Action Items from Aric/Jessa: business planning - Jul 20, 2026: Action Items 1. Aric to reach out to Dennis to set up a Zoom call with Scotty about working with NovaCast. 2. Jessa to go back into the NovaCast platform this afternoon to review signup and figure out what went wrong. 3. Jessa to send the video of Jake's recent event after the call. Key Points Purpose of the meeting: this should not be a task.`;
  const lines = actionItemLinesFromBlob(blob);
  assert.deepEqual(lines.slice(0, 3), [
    'Aric to reach out to Dennis to set up a Zoom call with Scotty about working with NovaCast.',
    'Jessa to go back into the NovaCast platform this afternoon to review signup and figure out what went wrong.',
    "Jessa to send the video of Jake's recent event after the call."
  ]);
  const variants = commitmentSeedVariants({
    id: 'blob',
    title: blob,
    summary: blob,
    source_quote: blob,
    confidence: 0.9
  });
  assert.equal(variants.length, 3);
  assert.ok(variants.every((item) => item.title.length < 220));
  assert.equal(variants.some((item) => /Key Points Purpose/i.test(item.title)), false);
});

test('commitment service cleans checkbox action items from transcript recaps', () => {
  const blob = `Action Items - [ ] Jessa to fix the tags to match the pipeline columns so that automation moves leads forward correctly. - Jessa Grace - Due:. - [ ] Mike to send dashboard access before Friday. - Mike Lane - Due: Friday.`;
  const lines = actionItemLinesFromBlob(blob);
  assert.deepEqual(lines, [
    'Jessa to fix the tags to match the pipeline columns so that automation moves leads forward correctly.',
    'Mike to send dashboard access before Friday.'
  ]);
  const variants = commitmentSeedVariants({
    id: 'checkbox-blob',
    title: blob,
    summary: blob,
    source_quote: blob,
    confidence: 0.91
  });
  assert.equal(variants.length, 2);
  assert.equal(variants.some((item) => /\[ \]|Due|Jessa Grace/i.test(item.title)), false);
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
	  assert.equal(transcriptCommitment.workingBrief.relationshipName, 'Michele');
	  assert.equal(transcriptCommitment.workingBrief.sourceContext.transcriptId, 'transcript_1');
	  assert.ok(transcriptCommitment.workingBrief.sourceRefs.some((ref) => /chapter feedback/i.test(ref.quote_or_summary)));
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

test('commitment status overrides persist through postgres-backed storage', async () => {
  const overrides = [];
  const dbQuery = async (sql, params = []) => {
    if (/from transcript_intelligence_runs/i.test(sql)) {
      return {
        rows: [{
          id: 'run_pg',
          tenant_id: 'tenant_pg',
          user_id: 'user_pg',
          transcript_id: 'transcript_pg',
          commitments_json: [{
            id: 'dashboard-handoff',
            title: 'Finish the GOALL dashboard handoff with Mike',
            summary: 'Jessa to finish the GOALL dashboard handoff with Mike before Monday.',
            source_quote: 'Jessa to finish the GOALL dashboard handoff with Mike before Monday.',
            owner: 'user_or_team',
            confidence: 0.92
          }],
          linkage_json: {linked_people: [{name: 'Mike', contactId: 'contact_mike'}]},
          created_at: '2026-07-24T10:00:00Z',
          updated_at: '2026-07-24T10:00:00Z'
        }]
      };
    }
    if (/from conversation_classifications/i.test(sql)) return {rows: []};
    if (/from val_commitment_overrides/i.test(sql)) {
      return {rows: overrides.filter((row) => row.tenant_id === params[0] && row.user_id === params[1])};
    }
    if (/insert into val_commitment_overrides/i.test(sql)) {
      const row = {
        id: params[0],
        tenant_id: params[1],
        user_id: params[2],
        status: params[3],
        owner_type: params[4],
        owner_name: params[5],
        owner_contact_id: params[6],
        task_id: params[7],
        draft_id: params[8],
        dismissal_reason: params[9],
        last_touched_at: params[10],
        updated_at: params[11]
      };
      const index = overrides.findIndex((item) => item.id === row.id && item.tenant_id === row.tenant_id && item.user_id === row.user_id);
      if (index >= 0) overrides[index] = {...overrides[index], ...Object.fromEntries(Object.entries(row).filter(([, value]) => value != null))};
      else overrides.push(row);
      return {rows: [overrides[index >= 0 ? index : overrides.length - 1]]};
    }
    return {rows: []};
  };

  const service = createValCommitmentsService({
    hasPg: () => true,
    dbQuery,
    tenantId: () => 'tenant_pg',
    userId: () => 'user_pg',
    listRelationshipContacts: async () => [{name: 'Mike', contactId: 'contact_mike'}]
  });

	  const before = await service.list();
	  const item = before.commitments.find((commitment) => /GOALL dashboard/i.test(commitment.title));
	  assert.ok(item);
	  assert.equal(item.workingBrief.envelope.envelopeType, 'project');
	  assert.equal(item.workingBrief.projectName, 'GOALL');
	  assert.equal(item.workingBrief.envelope.managerColorName, 'Taffy');
	  assert.equal(item.workingBrief.suggestedPrompt, 'How can I help you finish this dashboard?');
	  assert.ok(item.sourceRefs.some((ref) => /dashboard handoff/i.test(ref.quote_or_summary)));

	  await service.updateStatus(item.id, {status: 'complete'});

  const after = await service.list();
  const completed = after.commitments.find((commitment) => commitment.id === item.id);
  assert.equal(completed.status, 'complete');
  assert.equal(after.summary.total, 0);
});
