const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const routes = fs.readFileSync(path.join(root, 'services/valDocumentsRoutes.js'), 'utf8');

const {
  createValDocumentsService,
  documentMatches
} = require('../services/valDocuments');

test('documents routes expose canonical document index and reference APIs', () => {
  assert.match(server, /registerValDocumentsRoutes/);
  assert.match(server, /const valDocuments = registerValDocumentsRoutes/);
  assert.match(routes, /\/api\/val\/documents'/);
  assert.match(routes, /\/api\/val\/documents\/reference/);
  assert.match(routes, /reference-used/);
  assert.match(routes, /val_document_reference_used/);
});

test('document index normalizes drafts, prepared artifacts, project uploads, memory, attachments, and google docs', async () => {
  const store = {
    transcriptIntelligenceRuns: [{
      id: 'run_1',
      tenantId: 'tenant_1',
      userId: 'user_1',
      readyForYouCandidatesJson: [{
        id: 'prepared_sow',
        category: 'prepared_work',
        type: 'agreement_draft',
        title: 'Agreement draft for Atlas',
        summary: 'SOW prepared from transcript.',
        prepared_artifact: {
          kind: 'agreement_draft',
          title: 'Agreement draft for Atlas',
          sections: ['Parties', 'Scope', 'Terms requiring review'],
          linked_context: {
            project: {id: 'project_atlas', name: 'Atlas'},
            relationships: [{name: 'Priya', contactId: 'crm_priya'}]
          }
        },
        what_only_user_can_do: 'Confirm terms before external use.'
      }],
      createdAt: '2026-07-05T10:00:00Z'
    }],
    memoryItems: [{
      id: 'memory_doc_1',
      tenantId: 'tenant_1',
      userId: 'user_1',
      kind: 'knowledge_document',
      summary: 'Uploaded implementation notes',
      rawText: 'Implementation notes for Atlas.',
      metadata: {source: 'val_file_upload', fileName: 'atlas-notes.md', projectName: 'Atlas'}
    }],
    emailMessages: [{
      id: 'email_1',
      tenantId: 'tenant_1',
      userId: 'user_1',
      messageId: 'msg_1',
      from: {name: 'Greg', email: 'greg@example.com'},
      subject: 'Contract attachment',
      payload: {attachments: [{filename: 'contract.pdf', mimeType: 'application/pdf'}]},
      receivedAt: '2026-07-05T11:00:00Z'
    }],
    sourceProcessingRecords: [{
      id: 'source_atlas_mou',
      tenantId: 'tenant_1',
      userId: 'user_1',
      sourceType: 'gmail_email',
      sourceId: 'msg_atlas_mou',
      sourceTitle: 'MOU for Atlas',
      status: 'processed',
      sourceReceiptJson: {
        sourceType: 'gmail_email',
        sourceId: 'msg_atlas_mou',
        sourceTitle: 'MOU for Atlas',
        relationship: {id: 'rel_greg', name: 'Greg', email: 'greg@example.com'},
        documentCount: 1
      },
      witnessObservationsJson: [{
        observer: 'witness',
        observation: 'Greg sent an MOU document.',
        documents: [{
          id: 'doc_mou',
          title: 'Atlas MOU.pdf',
          type: 'application/pdf',
          sourceType: 'gmail_attachment',
          sourceId: 'msg_atlas_mou:doc_mou',
          summary: 'MOU attached to the relationship email.'
        }]
      }],
      metadataJson: {source: 'relationship_document_email'},
      createdAt: '2026-07-05T11:30:00Z'
    }],
    drafts: []
  };

  const service = createValDocumentsService({
    getStore: () => store,
    tenantId: () => 'tenant_1',
    userId: () => 'user_1',
    listDrafts: async () => [{
      id: 'draft_1',
      draftType: 'proposal_draft',
      subject: 'Proposal for Greg',
      body: 'Proposal body',
      status: 'draft',
      sourceContext: {source: 'browser_draft', recipient: 'Greg', recipientEmail: 'greg@example.com', projectName: 'Atlas'},
      createdAt: '2026-07-05T12:00:00Z'
    }],
    listProjectProfiles: async () => [{
      id: 'profile_project_atlas',
      profileType: 'project',
      projectId: 'project_atlas',
      displayName: 'Atlas',
      metadata: {
        uploadedFiles: [{id: 'file_1', fileName: 'atlas-scope.docx', docType: 'contract', source: 'hearth_project_source_upload', chars: 1400}],
        intake: {documents: 'Contract and implementation notes were supplied.'}
      }
    }],
    searchGoogleDocs: async () => [{id: 'gdoc_1', name: 'Atlas Google Brief', webViewLink: 'https://docs.google.com/document/d/gdoc_1', modifiedTime: '2026-07-05T13:00:00Z'}]
  });

  const all = await service.list({q: 'Atlas', includeGoogle: true, limit: 20});
  assert.equal(all.ok, true);
  assert.ok(all.documents.some(doc => doc.sourceType === 'val_draft'));
  assert.ok(all.documents.some(doc => doc.sourceType === 'transcript_prepared_work'));
  assert.ok(all.documents.some(doc => doc.sourceType === 'val_file_upload'));
  assert.ok(all.documents.some(doc => doc.sourceType === 'hearth_project_source_upload'));
  assert.ok(all.documents.some(doc => doc.sourceType === 'hearth_project_intake'));
  assert.ok(all.documents.some(doc => doc.sourceType === 'gmail_attachment' && doc.title === 'Atlas MOU.pdf'));
  assert.ok(all.documents.some(doc => doc.sourceType === 'google_docs'));
  assert.equal(all.summary.projects, 1);

  const relationship = await service.list({relationship: 'Greg'});
  assert.ok(relationship.documents.every(doc => documentMatches(doc, {relationship: 'Greg'})));
  assert.ok(relationship.documents.some(doc => doc.id.includes('source-processing:source_atlas_mou')));

  const reference = await service.referenceFor({project: 'Atlas'});
  assert.match(reference.referenceRule, /must use linked documents/);
});

test('document index reads durable email message attachments from Postgres raw_json', async () => {
  let emailMessageQueries = 0;
  const service = createValDocumentsService({
    hasPg: () => true,
    tenantId: () => 'tenant_1',
    userId: () => 'user_1',
    listDrafts: async () => [],
    listTranscriptRuns: async () => [],
    listMemoryItems: async () => [],
    listProjectProfiles: async () => [],
    dbQuery: async (sql, params) => {
      if(/source_processing_records/.test(sql)) return {rows: []};
      assert.match(sql, /from email_messages/);
      emailMessageQueries += 1;
      if(emailMessageQueries === 1){
        assert.deepEqual(params, ['tenant_1', 'user_1']);
        return {rows: []};
      }
      assert.deepEqual(params, ['tenant_1']);
      return {rows: [{
        id: 'em_mou',
        provider: 'gmail',
        message_id: 'gmail_mou_1',
        thread_id: 'thread_mou',
        sender_json: {name: 'Aric Soyring', email: 'aric@example.com'},
        subject: 'MOU for Frisson Consulting / Forever Freedom',
        body_preview: 'Everything appears to be accurate in this document attached.',
        has_attachments: true,
        web_link: 'https://mail.google.com/mail/u/0/#inbox/thread_mou',
        received_at: '2026-07-12T15:14:14.000Z',
        raw_json: {
          attachments: [{
            id: 'att_mou',
            filename: 'MOU ForeverFreedom Frisson.pdf',
            mimeType: 'application/pdf',
            size: 67000
          }]
        }
      }]};
    }
  });

  const result = await service.list({q: 'MOU', limit: 20});
  assert.equal(result.ok, true);
  assert.equal(result.count, 1);
  assert.equal(result.documents[0].title, 'MOU ForeverFreedom Frisson.pdf');
  assert.equal(result.documents[0].relationship, 'Aric Soyring');
  assert.equal(result.documents[0].sourceType, 'email_attachment');
  assert.equal(emailMessageQueries, 2);
});
