import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import test from 'node:test';

const { findMedicineMatch } = createRequire(import.meta.url)('../medicine-matcher.js');

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('the page exposes the core sections through navigation', async () => {
  const html = await readProjectFile('index.html');

  for (const section of ['home', 'about', 'leadership', 'products', 'contact']) {
    assert.match(html, new RegExp(`href=["']#${section}["']`));
    assert.match(html, new RegExp(`id=["']${section}["']`));
  }
});

test('company details from the source site are preserved', async () => {
  const html = await readProjectFile('index.html');

  for (const detail of [
    'Aarkid Biotech Private Limited',
    'Caring for life',
    'aarkidbiotech@gmail.com',
    'Chairman',
    'Dr. Mudit Mittal',
    'Executive Director',
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
  assert.match(html, /assets\/aarkid-logo-footer-transparent\.png/);
  assert.match(html, /assets\/lab-scientist\.jpg/);
  assert.match(html, /assets\/pharmaceutical-formulation\.jpg/);
});

test('the source product catalogue is preserved as HTML', async () => {
  const html = await readProjectFile('index.html');
  const productNames = [...html.matchAll(/<details class="product-card reveal">[\s\S]*?<summary>[\s\S]*?<strong>(.*?)<\/strong>/g)].map((match) => match[1]);
  const expectedProducts = [
    'AARCID 40',
    'AARCID-DSR',
    'AARCLAV 228.5 DS',
    'AARCLAV 625',
    'COUGHRID DX',
    'COUGHRID LS',
    'POLARID DROP',
    'POLARID SYRUP',
    'SULTARID 375',
    'AARFIX-CV 200',
    'AARGESIC-SP',
    'CEFORID 500',
    'AARVITAL',
    'AARLAC',
    'DIARHERID-M',
    'FEVERRID',
  ];

  assert.deepEqual(productNames, expectedProducts);
  for (const product of expectedProducts) {
    assert.ok(html.includes(product), `Missing product: ${product}`);
  }

  assert.match(html, /16 medicines/);
  assert.doesNotMatch(html, /SULTARID-KID 250/);
  assert.doesNotMatch(html, /MUCIRID 600/);
  assert.doesNotMatch(html, /<strong>ARCID-DSR<\/strong>/);
  assert.doesNotMatch(html, /<strong>ARCLAV 625<\/strong>/);
});

test('the medicine finder returns catalogue matches and defers unsafe requests', () => {
  const acidity = findMedicineMatch('I have acidity and heartburn');
  const mucusCough = findMedicineMatch('cough with mucus');

  assert.equal(acidity.results[0].medicine.name, 'AARCID 40');
  assert.ok(acidity.results.some((result) => result.medicine.name === 'AARCID-DSR'));
  assert.equal(mucusCough.medicine.name, 'COUGHRID LS');
  assert.ok(findMedicineMatch('loose motion probiotic').results.some((result) => result.medicine.name === 'AARLAC'));
  assert.ok(findMedicineMatch('diarrhoea stomach infection').results.some((result) => result.medicine.name === 'DIARHERID-M'));
  assert.equal(findMedicineMatch('I need an antibiotic for an infection').type, 'clinician');
  assert.equal(findMedicineMatch('chest pain and trouble breathing').type, 'urgent');
});

test('the medicine finder gives Google-like related catalogue context for stomach ache', () => {
  const result = findMedicineMatch('stomach ache after meals with gas');

  assert.equal(result.type, 'match');
  assert.equal(result.results[0].medicine.name, 'AARCID 40');
  assert.ok(result.results.some((item) => item.medicine.name === 'AARCID-DSR'));
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
  assert.match(html, /src=["']medicine-matcher\.js\?v=\d+["']\s+defer/);
  assert.match(html, /src=["']medicine-search\.js\?v=\d+["']\s+defer/);
  assert.doesNotMatch(html, /type=["']module["'][^>]+medicine-search/);
});

test('the about and leadership sections focus on care and delivery', async () => {
  const html = await readProjectFile('index.html');

  assert.match(html, /Aarkid Biotech Private Limited is a medicine-focused company/);
  assert.match(html, /focuses on specific healthcare needs/);
  assert.doesNotMatch(html, /We do not present ourselves as a manufacturing unit/);
  assert.doesNotMatch(html, /Our approach/);
  assert.match(html, /Leadership testimonials/);
  assert.match(html, /data-scroll-rail-section/);
  assert.match(html, /data-scroll-rail/);
  assert.match(html, /leader-photo-frame/);
  assert.doesNotMatch(html, /leader-photo-placeholder/);
  assert.match(html, /our vision is built on trust, integrity/);
  assert.match(html, /operational excellence, timely delivery/);
  assert.match(html, /Healthcare is constantly evolving/);
  assert.match(html, /Success in healthcare is built on consistency/);
  assert.match(html, /Manik Mittal/);
  assert.match(html, /assets\/manik-mittal\.jpg/);
  assert.match(html, /assets\/mudit-mittal\.jpg/);
  assert.match(html, /Dr\. Mudit Mittal/);
  assert.match(html, /Namit Mittal/);
  assert.match(html, /Ashok Sharma/);
  assert.match(html, /assets\/ashok-sharma\.jpg/);
  assert.match(html, /assets\/namit-mittal\.jpg/);
  assert.doesNotMatch(html, /href=["']tel:/);
  assert.match(html, /href=["']mailto:aarkidbiotech@gmail\.com["']/);
  assert.doesNotMatch(html, /research,\s*develop/i);
  assert.doesNotMatch(html, /To develop and deliver/i);
});
