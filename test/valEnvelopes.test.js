const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createValEnvelopesService,envelopeTargetFromPacket} = require('../services/valEnvelopes');
const {createValBoardPacketsService} = require('../services/valBoardPackets');
const {VAL_ENVELOPES_SQL} = require('../services/valEnvelopesSchema');

const root = path.join(__dirname,'..');
const server = fs.readFileSync(path.join(root,'server.js'),'utf8');

test('Envelope schema and routes are mounted', () => {
  assert.match(VAL_ENVELOPES_SQL,/create table if not exists val_envelopes/);
  assert.match(VAL_ENVELOPES_SQL,/create table if not exists val_envelope_packets/);
  assert.match(server,/ensureValEnvelopeTables/);
  assert.match(server,/registerValEnvelopesRoutes/);
  assert.match(server,/envelopeService:valEnvelopes/);
});

test('Envelope target uses project first, relationship second', () => {
  const projectTarget = envelopeTargetFromPacket({
    title:'Dashboard handoff',
    summary:'Mike is part of this relationship, but the work belongs to GOALL.',
    payloadJson:{relationshipName:'Mike',projectName:'GOALL'}
  });
  assert.equal(projectTarget.envelopeType,'project');
  assert.equal(projectTarget.projectName,'GOALL');
  assert.equal(projectTarget.relationshipName,'');
  assert.equal(projectTarget.managerColorName,'Taffy');

  const relationshipTarget = envelopeTargetFromPacket({
    title:'Follow up with Michele',
    summary:'No project exists here.',
    payloadJson:{relationshipName:'Michele'}
  });
  assert.equal(relationshipTarget.envelopeType,'relationship');
  assert.equal(relationshipTarget.relationshipName,'Michele');
});

test('Board packets automatically land in growing Envelopes', async () => {
  let store = {};
  const envelopeService = createValEnvelopesService({
    hasPg: () => false,
    getStore: () => store,
    saveStore: (next) => { store = next; },
    tenantId: () => 'tenant',
    userId: () => 'user',
    uuid: (prefix) => `${prefix}_test`
  });
  const board = createValBoardPacketsService({
    hasPg: () => false,
    getStore: () => store,
    saveStore: (next) => { store = next; },
    tenantId: () => 'tenant',
    userId: () => 'user',
    uuid: (prefix) => `${prefix}_test_${Math.random().toString(36).slice(2,6)}`,
    envelopeService,
    logger:{log(){},warn(){}}
  });

  const packet = await board.createPacket({
    sourceType:'transcript',
    sourceId:'tr_goall_mike',
    packetType:'meeting_evidence_packet',
    title:'GOALL dashboard handoff with Mike',
    summary:'Jessa and Mike discussed the GOALL dashboard handoff.',
    payload:{projectName:'GOALL',relationshipName:'Mike'}
  });

  assert.equal(packet.envelope.envelopeType,'project');
  assert.equal(packet.envelope.projectName,'GOALL');

  await board.createPacket({
    sourceType:'email',
    sourceId:'email_goall_mike',
    packetType:'reply_pressure_packet',
    title:'Mike follow-up',
    summary:'Mike asked about GOALL dashboard timing.',
    payload:{projectName:'GOALL',relationshipName:'Mike'}
  });

  const envelopes = await envelopeService.list();
  assert.equal(envelopes.length,1);
  assert.equal(envelopes[0].displayName,'GOALL');
  assert.equal(envelopes[0].packetCount,2);
});
