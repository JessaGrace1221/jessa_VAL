#!/usr/bin/env node
'use strict';

const path = require('node:path');

const drawerContracts = [
  {name:'Relationships', button:'.relationship-drawer-link', open:'relationship-open', detail:'#relationship-detail', packet:'relationship_packet', contract:'drawer.relationships'},
  {name:'Projects', button:'.project-drawer-link', open:'project-open', detail:'#project-detail', packet:'project_packet', contract:'drawer.projects'},
  {name:'Transcripts', button:'.timeline-drawer-link', open:'timeline-open', detail:'#timeline-detail', packet:'timeline_packet', contract:'drawer.timeline'},
  {name:'Executive Inbox', button:'.correspondence-drawer-link', open:'correspondence-open', detail:'#correspondence-detail', packet:'email_packet', contract:'drawer.executive_inbox'},
  {name:'Commitments', button:'.commitment-drawer-link', open:'commitment-open', detail:'#commitment-detail', packet:'commitment_packet', contract:'drawer.commitments'},
  {name:'Documents', button:'.document-drawer-link', open:'document-open', detail:'#document-detail', packet:'document_packet', contract:'drawer.documents'},
  {name:'Lead Intelligence', button:'.source-drawer-link', open:'source-open', detail:'#source-detail', packet:'lead_intelligence_packet', contract:'drawer.lead_intelligence'},
  {name:'VAL OS', button:'.val-drawer-link', open:'val-open', detail:'#val-detail', packet:'val_os_packet', contract:'drawer.val_os'}
];

function loadPlaywright(){
  for(const candidate of [
    'playwright',
    '/tmp/val-playwright-inspect/node_modules/playwright'
  ]){
    try{
      return require(candidate);
    }catch(error){
      if(candidate === 'playwright') continue;
      throw new Error('Playwright is required for this audit. Install it locally or use the Codex inspection runtime.');
    }
  }
}

function browserExecutable(){
  const explicit = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  if(explicit) return explicit;
  if(process.platform === 'darwin') return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  return undefined;
}

async function main(){
  const targetUrl = process.argv[2] || process.env.HEARTH_URL || 'http://127.0.0.1:5188/hearth-prototype.html';
  const {chromium} = loadPlaywright();
  const launchOptions = {headless:process.env.HEARTH_AUDIT_HEADLESS !== '0'};
  const executablePath = browserExecutable();
  if(executablePath) launchOptions.executablePath = executablePath;
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  await page.goto(targetUrl, {waitUntil:'networkidle', timeout:60000});
  await page.evaluate(() => document.querySelector('.drawer-pull')?.click());
  await page.waitForTimeout(500);

  const results = [];
  for(const drawer of drawerContracts){
    await page.evaluate((selector) => document.querySelector(selector)?.click(), drawer.button);
    await page.waitForTimeout(800);
    results.push(await page.evaluate((drawer) => {
      const tray = document.querySelector('.drawer-tray');
      const button = document.querySelector(drawer.button);
      const detail = document.querySelector(drawer.detail);
      const firstCard = detail?.querySelector('article, section, .relationship-identity, .project-manager-profile, .correspondence-thread, .commitment-ledger, .document-library, .lead-sourcing-board, .val-witnessing-session');
      const style = (node) => node ? getComputedStyle(node) : null;
      const trayStyle = style(tray);
      const detailStyle = style(detail);
      const cardStyle = style(firstCard);
      const background = [
        trayStyle?.backgroundImage,
        trayStyle?.backgroundColor,
        detailStyle?.backgroundImage,
        detailStyle?.backgroundColor,
        cardStyle?.backgroundImage,
        cardStyle?.backgroundColor
      ].join(' ');
      const muddyPattern = /rgba\((58, 33, 27|79, 48, 38|88, 48, 37|120, 86, 72|227, 204, 177|235, 220, 196)/i;
      const frostPattern = /rgba\(255, 255, 252|rgba\(248, 250, 244|rgba\(255, 255, 255|rgba\(248, 248, 247|linear-gradient/i;
      const whiteGlassPattern = /rgba\(255, 255, 255, 0\.(9[0-9]|8[2-9])\)/i;
      const trayBackground = `${trayStyle?.backgroundImage || ''} | ${trayStyle?.backgroundColor || ''}`;
      return {
        name: drawer.name,
        expectedPacket: drawer.packet,
        packetAttr: button?.getAttribute('data-val-variable-packet') || '',
        expectedContract: drawer.contract,
        clickContract: button?.getAttribute('data-val-click-contract') || '',
        openedClass: !!tray?.classList.contains(drawer.open),
        visible: detail?.getAttribute('aria-hidden') === 'false',
        frost: frostPattern.test(background),
        whiteGlass: whiteGlassPattern.test(trayBackground),
        muddy: muddyPattern.test(background),
        excerpt: (detail?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 180),
        trayBackground,
        cardBackground: `${cardStyle?.backgroundImage || ''} | ${cardStyle?.backgroundColor || ''}`
      };
    }, drawer));
  }

  await browser.close();
  const failures = results.filter((result) => (
    result.packetAttr !== result.expectedPacket ||
    result.clickContract !== result.expectedContract ||
    !result.openedClass ||
    !result.visible ||
    !result.frost ||
    !result.whiteGlass ||
    result.muddy
  ));
  console.log(JSON.stringify({ok:failures.length === 0, targetUrl, checkedAt:new Date().toISOString(), results, failures}, null, 2));
  if(failures.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
