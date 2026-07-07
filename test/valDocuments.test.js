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
  assert.ok(all.documents.some(doc => doc.sourceType === 'google_docs'));
  assert.equal(all.summary.projects, 1);

  const relationship = await service.list({relationship: 'Greg'});
  assert.ok(relationship.documents.every(doc => documentMatches(doc, {relationship: 'Greg'})));

  const reference = await service.referenceFor({project: 'Atlas'});
  assert.match(reference.referenceRule, /must use linked documents/);
});
