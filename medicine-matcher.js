const medicines = [
  {
    name: 'AARCID-DSR',
    use: 'acidity, heartburn, indigestion, and reflux-like symptoms',
    contains: 'Pantoprazole + Domperidone',
    caution: 'Useful only when the discomfort sounds acidity-related. New, severe, or persistent stomach pain needs a clinician.',
    terms: ['acidity', 'acidic', 'heartburn', 'reflux', 'indigestion', 'gastric', 'burning', 'gas', 'bloating', 'stomach burning', 'sour burp', 'after meals'],
  },
  {
    name: 'AARCLAV 228.5 DS',
    use: 'bacterial infections in children, as decided by a doctor',
    contains: 'Amoxicillin + Clavulanate',
    caution: 'Antibiotics should be selected only by a qualified clinician.',
    terms: ['bacterial infection', 'antibiotic', 'child infection', 'throat infection', 'ear infection'],
    requiresClinician: true,
  },
  {
    name: 'AARCLAV 625',
    use: 'bacterial infections, as decided by a doctor',
    contains: 'Amoxicillin + Clavulanate',
    caution: 'Antibiotics should be selected only by a qualified clinician.',
    terms: ['bacterial infection', 'antibiotic', 'throat infection', 'ear infection', 'chest infection'],
    requiresClinician: true,
  },
  {
    name: 'AARFIX-CV 200',
    use: 'bacterial infections, as decided by a doctor',
    contains: 'Cefixime + Clavulanate',
    caution: 'Antibiotics should be selected only by a qualified clinician.',
    terms: ['bacterial infection', 'antibiotic', 'infection'],
    requiresClinician: true,
  },
  {
    name: 'AARGESIC-SP',
    use: 'pain, swelling, and inflammation',
    contains: 'Aceclofenac + Paracetamol + Serratiopeptidase',
    caution: 'Do not use this to self-treat stomach pain; some pain medicines can worsen certain stomach problems.',
    terms: ['pain', 'swelling', 'inflammation', 'body ache', 'joint pain', 'muscle pain', 'sprain'],
  },
  {
    name: 'AARVITAL',
    use: 'nutritional and nerve-health support',
    contains: 'Mecobalamin + Alpha Lipoic Acid + vitamins',
    caution: 'Supportive supplement use should still match a clinician recommendation.',
    terms: ['nerve', 'tingling', 'nutrition', 'nutritional', 'vitamin support', 'weakness', 'numbness'],
  },
  {
    name: 'CEFORID 500',
    use: 'bacterial infections, as decided by a doctor',
    contains: 'Cefuroxime Axetil',
    caution: 'Antibiotics should be selected only by a qualified clinician.',
    terms: ['bacterial infection', 'antibiotic', 'infection'],
    requiresClinician: true,
  },
  {
    name: 'COUGHRID DX',
    use: 'dry cough and common cold symptoms',
    contains: 'Dextromethorphan + Phenylephrine + CPM',
    caution: 'Cough with breathing trouble, chest pain, blood, or high fever needs medical care.',
    terms: ['dry cough', 'dry', 'cough', 'cold', 'common cold', 'runny nose', 'sneezing'],
  },
  {
    name: 'COUGHRID LS',
    use: 'cough with mucus and chest congestion',
    contains: 'Ambroxol + Levosalbutamol + Guaiphenesin',
    caution: 'Cough with breathing trouble, chest pain, blood, or high fever needs medical care.',
    terms: ['cough with mucus', 'mucus', 'phlegm', 'wet cough', 'chest congestion', 'congestion', 'productive cough'],
  },
  {
    name: 'MUCIRID 600',
    use: 'loosening mucus in the chest',
    contains: 'Acetylcysteine',
    caution: 'Best discussed with a clinician if symptoms are persistent or breathing feels difficult.',
    terms: ['mucus', 'phlegm', 'chest congestion', 'chest mucus', 'thick mucus'],
  },
  {
    name: 'POLARID Drops',
    use: 'fever and common cold symptoms in children',
    contains: 'Paracetamol + Phenylephrine + CPM',
    caution: 'Children, infants, high fever, or persistent fever should be assessed by a clinician.',
    terms: ['child fever', 'baby fever', 'children fever', 'child cold', 'kids cold', 'kids fever'],
  },
  {
    name: 'POLARID Syrup',
    use: 'fever and common cold symptoms',
    contains: 'Paracetamol + Phenylephrine + CPM',
    caution: 'High fever, persistent fever, or fever with severe symptoms needs medical advice.',
    terms: ['fever', 'cold symptoms', 'cold', 'flu', 'body temperature'],
  },
  {
    name: 'SULTARID 375',
    use: 'bacterial infections, as decided by a doctor',
    contains: 'Sultamicillin',
    caution: 'Antibiotics should be selected only by a qualified clinician.',
    terms: ['bacterial infection', 'antibiotic', 'infection'],
    requiresClinician: true,
  },
  {
    name: 'SULTARID-KID 250',
    use: 'bacterial infections in children, as decided by a doctor',
    contains: 'Sultamicillin',
    caution: 'Antibiotics for children should be selected only by a qualified clinician.',
    terms: ['bacterial infection', 'antibiotic', 'child infection', 'kids infection'],
    requiresClinician: true,
  },
];

const symptomTopics = [
  {
    id: 'stomach',
    label: 'Stomach ache / abdominal pain',
    aliases: ['stomach ache', 'stomach pain', 'belly ache', 'belly pain', 'abdominal pain', 'tummy ache', 'gastric pain', 'gas pain', 'indigestion', 'gas', 'bloating'],
    catalogueTerms: ['acidity', 'heartburn', 'indigestion', 'gas', 'bloating', 'stomach burning'],
    info: [
      'Stomach ache can come from gas, indigestion, acidity, infection, food intolerance, or other abdominal causes.',
      'If the discomfort feels like burning, sour burps, reflux, or after-meal acidity, the closest catalogue area is acidity and heartburn.',
      'Do not self-select pain medicines for stomach pain; some pain medicines can irritate the stomach or hide a serious problem.',
    ],
    careAdvice: [
      'Seek urgent care for sudden or severe abdominal pain, chest pain, a hard or swollen abdomen, blood in vomit or stool, breathing difficulty, pregnancy, or pain with persistent vomiting or fever.',
      'Contact a clinician if stomach pain lasts more than 24 to 48 hours, keeps returning, affects sleep, or is not clearly mild acidity or gas.',
    ],
  },
  {
    id: 'cough',
    label: 'Cough and congestion',
    aliases: ['cough', 'dry cough', 'wet cough', 'cough with mucus', 'phlegm', 'mucus', 'chest congestion', 'cold'],
    catalogueTerms: ['dry cough', 'cough with mucus', 'mucus', 'phlegm', 'cold', 'chest congestion'],
    info: [
      'Dry cough and cough with mucus point to different catalogue options.',
      'Mucus, phlegm, or chest congestion usually relates more closely to expectorant or mucolytic catalogue entries.',
    ],
    careAdvice: [
      'Seek medical care for breathing trouble, chest pain, blood in cough, high fever, or symptoms that persist or worsen.',
    ],
  },
  {
    id: 'fever',
    label: 'Fever and cold symptoms',
    aliases: ['fever', 'temperature', 'high fever', 'cold symptoms', 'flu', 'body temperature'],
    catalogueTerms: ['fever', 'cold symptoms', 'cold'],
    info: [
      'Fever can have many causes, so the catalogue can only surface fever/cold support products, not diagnose the cause.',
    ],
    careAdvice: [
      'High fever, fever in infants, fever with severe pain, breathing trouble, rash, confusion, dehydration, or persistent vomiting needs medical care.',
    ],
  },
  {
    id: 'pain',
    label: 'Pain, swelling, and inflammation',
    aliases: ['pain', 'swelling', 'inflammation', 'body ache', 'joint pain', 'muscle pain', 'sprain'],
    catalogueTerms: ['pain', 'swelling', 'inflammation', 'body ache', 'joint pain', 'muscle pain'],
    info: [
      'Pain with swelling or inflammation can match pain-relief catalogue entries, depending on the cause and patient history.',
    ],
    careAdvice: [
      'Severe pain, injury, chest pain, abdominal pain, pregnancy, ulcers, kidney disease, or blood-thinner use should be discussed with a clinician before medicine selection.',
    ],
  },
  {
    id: 'nerve',
    label: 'Nerve and nutrition support',
    aliases: ['nerve', 'tingling', 'numbness', 'weakness', 'vitamin', 'nutrition'],
    catalogueTerms: ['nerve', 'tingling', 'numbness', 'vitamin support', 'nutrition'],
    info: [
      'Tingling, numbness, or weakness can have several causes; vitamin and nerve-support products are supportive, not diagnostic.',
    ],
    careAdvice: [
      'Sudden weakness, one-sided symptoms, severe pain, or symptoms with diabetes should be assessed by a clinician.',
    ],
  },
];

const urgentTerms = [
  'blood in stool',
  'bloody stool',
  'vomiting blood',
  'blood in vomit',
  'black stool',
  'chest pain',
  'trouble breathing',
  'difficulty breathing',
  'shortness of breath',
  'severe pain',
  'sudden pain',
  'hard abdomen',
  'swollen abdomen',
  'unconscious',
  'blood in cough',
  'persistent vomiting',
];

const clinicianTerms = ['infection', 'bacterial', 'antibiotic', 'pregnant', 'pregnancy', 'infant', 'newborn', 'ulcer'];

const normalize = (query) => String(query).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const termScore = (normalized, term) => {
  if (normalized.includes(term)) return term.split(' ').length + 2;
  return term.split(' ').filter((word) => word.length > 2 && normalized.includes(word)).length;
};

const findTopics = (normalized) => symptomTopics
  .map((topic) => ({
    ...topic,
    score: topic.aliases.reduce((score, term) => score + termScore(normalized, term), 0),
  }))
  .filter((topic) => topic.score > 0)
  .sort((a, b) => b.score - a.score);

const uniqueValues = (items) => items.filter((item, index) => items.indexOf(item) === index);

const collectTopicItems = (topics, key) => {
  const items = [];
  topics.forEach((topic) => {
    topic[key].forEach((item) => items.push(item));
  });
  return uniqueValues(items);
};

const findMedicineMatch = (query) => {
  const normalized = normalize(query);
  if (!normalized) return { type: 'empty', query: '', results: [], relatedInfo: [], careAdvice: [] };

  const urgent = urgentTerms.some((term) => normalized.includes(term));
  const clinician = clinicianTerms.some((term) => normalized.includes(term));
  const topics = findTopics(normalized);
  const expandedTerms = collectTopicItems(topics, 'catalogueTerms');
  const searchTerms = [...new Set([...normalized.split(' '), ...expandedTerms])].filter((term) => term.length > 2);

  const results = medicines
    .map((medicine) => {
      const matchedTerms = medicine.terms.filter((term) => termScore(normalized, term) > 0 || expandedTerms.includes(term));
      const looseMatches = medicine.terms.filter((term) => searchTerms.some((searchTerm) => term.includes(searchTerm) || searchTerm.includes(term)));
      const allMatches = [...new Set([...matchedTerms, ...looseMatches])];
      const score = allMatches.reduce((total, term) => total + termScore(normalized, term), 0) + allMatches.length + (medicine.requiresClinician ? -2 : 0);

      return {
        medicine,
        score,
        reason: allMatches.length ? `Matched: ${allMatches.slice(0, 4).join(', ')}` : '',
      };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const relatedInfo = collectTopicItems(topics, 'info');
  const careAdvice = collectTopicItems(topics, 'careAdvice');
  const type = urgent ? 'urgent' : clinician && !results.some((result) => !result.medicine.requiresClinician) ? 'clinician' : results.length ? 'match' : clinician ? 'clinician' : 'none';

  return {
    type,
    query: normalized,
    topics: topics.map(({ id, label }) => ({ id, label })),
    results,
    medicine: results.length ? results[0].medicine : undefined,
    relatedInfo,
    careAdvice,
  };
};

const medicineSearchApi = {
  findMedicineMatch,
  medicines,
};

const medicineSearchTarget = typeof window !== 'undefined' ? window : globalThis;
medicineSearchTarget.AarkidMedicineSearch = medicineSearchApi;

if (typeof module !== 'undefined') {
  module.exports = medicineSearchApi;
}
