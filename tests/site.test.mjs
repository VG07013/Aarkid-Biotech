import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import test from 'node:test';

const { findMedicineMatch, medicines } = createRequire(import.meta.url)('../medicine-matcher.js');

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const readProjectBytes = (path) => readFile(new URL(`../${path}`, import.meta.url));

const imageSize = (bytes) => {
  if (bytes.readUInt32BE(0) === 0x89504e47) return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  let offset = 2;
  while (offset < bytes.length) {
    const marker = bytes[offset + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
    }
    offset += 2 + bytes.readUInt16BE(offset + 2);
  }
  throw new Error('Unknown image format');
};

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

test('the catalogue HTML and the search data list the same medicines', async () => {
  const html = await readProjectFile('index.html');
  const cards = [...html.matchAll(/<summary>[\s\S]*?<strong>(.*?)<\/strong><small>Salt: (.*?)<\/small>/g)]
    .map((match) => ({ name: match[1], salt: match[2] }));

  assert.deepEqual(cards.map((card) => card.name), medicines.map((medicine) => medicine.name));
  cards.forEach((card, index) => assert.equal(card.salt, medicines[index].contains, `Salt differs for ${card.name}`));
  assert.match(html, new RegExp(`${medicines.length} medicines`));
});

test('the symptom search cannot submit natively before its script is ready', async () => {
  const [html, js] = await Promise.all([readProjectFile('index.html'), readProjectFile('medicine-search.js')]);
  const form = html.match(/<form[^>]*data-medicine-search[^>]*>/)[0];

  assert.match(form, /method=["']post["']/);
  assert.match(html, /<fieldset[^>]*disabled[^>]*data-medicine-fields/);
  assert.match(js, /fields\.disabled = false/);
});

test('fonts are self-hosted and security headers are configured', async () => {
  const [html, css, headers] = await Promise.all([
    readProjectFile('index.html'),
    readProjectFile('styles.css'),
    readProjectFile('_headers'),
  ]);

  assert.doesNotMatch(html, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
  assert.doesNotMatch(css, /DM Sans/);
  for (const font of ['manrope-latin.woff2', 'newsreader-latin.woff2']) {
    assert.match(css, new RegExp(`assets/fonts/${font.replace('.', '\\.')}`));
    assert.ok((await stat(new URL(`../assets/fonts/${font}`, import.meta.url))).size > 0);
  }
  for (const header of [
    'X-Content-Type-Options: nosniff',
    'X-Frame-Options: DENY',
    'Referrer-Policy:',
    'Permissions-Policy:',
    'Strict-Transport-Security:',
    'Content-Security-Policy-Report-Only:',
  ]) {
    assert.ok(headers.includes(header), `Missing header: ${header}`);
  }
});

test('image dimensions match the files and responsive variants exist', async () => {
  const html = await readProjectFile('index.html');
  const images = [...html.matchAll(/<img\b[^>]*>/g)].map(([tag]) => ({
    src: tag.match(/src="([^"]+)"/)[1],
    width: tag.match(/width="(\d+)"/)[1],
    height: tag.match(/height="(\d+)"/)[1],
  }));

  assert.equal(images.length, 8);
  for (const { src, width, height } of images) {
    const size = imageSize(await readProjectBytes(src));
    assert.deepEqual(size, { width: Number(width), height: Number(height) }, `Dimensions differ for ${src}`);
  }

  for (const [, srcset] of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const candidate of srcset.split(',')) {
      const file = candidate.trim().split(' ')[0];
      assert.ok((await stat(new URL(`../${file}`, import.meta.url))).size > 0, `Missing ${file}`);
    }
  }

  assert.ok((await stat(new URL('../assets/aarkid-logo-footer-transparent.png', import.meta.url))).size < 100000);
});
