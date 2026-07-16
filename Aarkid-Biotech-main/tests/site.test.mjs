import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import test from 'node:test';

const { findMedicineMatch } = createRequire(import.meta.url)('../medicine-matcher.js');

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('the page exposes the core sections through navigation', async () => {
  const html = await readProjectFile('index.html');

  for (const section of ['home', 'about', 'products', 'contact']) {
    assert.match(html, new RegExp(`href=["']#${section}["']`));
    assert.match(html, new RegExp(`id=["']${section}["']`));
  }
});

test('company details from the source site are preserved', async () => {
  const html = await readProjectFile('index.html');

  for (const detail of [
    'Aarkid Biotech Pvt. Ltd.',
    'Caring for life',
    '9359935292',
    '8958742354',
    '9997945769',
    '9412869171',
    'B-1/639 A',
    'B-1, West Delhi',
  ]) {
    assert.ok(html.toLowerCase().includes(detail.toLowerCase()), `Missing: ${detail}`);
  }
});

test('the mobile menu and motion preferences are accessible', async () => {
  const [html, baseCss, responsiveCss, js] = await Promise.all([
    readProjectFile('index.html'),
    readProjectFile('styles.css'),
    readProjectFile('contact-responsive.css'),
    readProjectFile('script.js'),
  ]);
  const css = `${baseCss}\n${responsiveCss}`;

  assert.match(html, /aria-controls=["']site-navigation["']/);
  assert.match(html, /aria-expanded=["']false["']/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(js, /aria-expanded/);
  assert.match(js, /Escape/);
});

test('only local project imagery is referenced', async () => {
  const html = await readProjectFile('index.html');

  assert.doesNotMatch(html, /canva\.site\/_assets|blob:https:/);
  assert.match(html, /assets\/aarkid-logo-transparent\.png/);
  assert.match(html, /assets\/lab-scientist\.jpg/);
  assert.match(html, /assets\/pharmaceutical-formulation\.jpg/);
});

test('the source product catalogue is preserved as HTML', async () => {
  const html = await readProjectFile('index.html');

  for (const product of [
    'AARCID-DSR',
    'AARCLAV 625',
    'AARFIX-CV 200',
    'AARGESIC-SP',
    'AARVITAL',
    'CEFORID 500',
    'COUGHRID DX',
    'COUGHRID LS',
    'MUCIRID 600',
    'POLARID Drops',
    'SULTARID 375',
    'SULTARID-KID 250',
  ]) {
    assert.ok(html.includes(product), `Missing product: ${product}`);
  }
});

test('the medicine finder returns catalogue matches and defers unsafe requests', () => {
  const acidity = findMedicineMatch('I have acidity and heartburn');
  const mucusCough = findMedicineMatch('cough with mucus');

  assert.equal(acidity.medicine.name, 'AARCID-DSR');
  assert.equal(acidity.results[0].medicine.name, 'AARCID-DSR');
  assert.equal(mucusCough.medicine.name, 'COUGHRID LS');
  assert.ok(mucusCough.results.some((result) => result.medicine.name === 'MUCIRID 600'));
  assert.equal(findMedicineMatch('I need an antibiotic for an infection').type, 'clinician');
  assert.equal(findMedicineMatch('chest pain and trouble breathing').type, 'urgent');
});

test('the medicine finder gives Google-like related catalogue context for stomach ache', () => {
  const result = findMedicineMatch('stomach ache after meals with gas');

  assert.equal(result.type, 'match');
  assert.equal(result.results[0].medicine.name, 'AARCID-DSR');
  assert.ok(result.relatedInfo.some((info) => info.toLowerCase().includes('stomach ache')));
  assert.ok(result.careAdvice.some((advice) => advice.toLowerCase().includes('severe abdominal pain')));
  assert.ok(result.results[0].medicine.caution.toLowerCase().includes('severe'));
});

test('the Medicines navigation item leads to the catalogue finder', async () => {
  const html = await readProjectFile('index.html');

  assert.match(html, /href=["']#medicines["'][^>]*data-nav-link[^>]*>Medicines</);
  assert.match(html, /id=["']medicines["']/);
  assert.match(html, /data-medicine-search/);
  assert.match(html, /data-medicine-result/);
  assert.match(html, /Search catalogue/);
  assert.match(html, /src=["']medicine-matcher\.js["']\s+defer/);
  assert.match(html, /src=["']medicine-search\.js["']\s+defer/);
  assert.doesNotMatch(html, /type=["']module["'][^>]+medicine-search/);
});
