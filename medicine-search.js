(function () {
  const form = document.querySelector('[data-medicine-search]');
  const result = document.querySelector('[data-medicine-result]');
  const fields = document.querySelector('[data-medicine-fields]');
  const status = document.querySelector('[data-medicine-status]');

  if (!form || !result || !fields) return;

  const clearNode = (node) => {
    while (node.firstChild) node.removeChild(node.firstChild);
  };

  const getMatcher = () => window.AarkidMedicineSearch && window.AarkidMedicineSearch.findMedicineMatch;

  const openCatalogueItem = (medicineName) => {
    const cards = Array.prototype.slice.call(document.querySelectorAll('.product-card'));
    const card = cards.find((item) => {
      const name = item.querySelector('summary strong');
      return name && name.textContent === medicineName;
    });

    if (!card) return;
    card.open = true;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const addList = (parent, title, items, className) => {
    if (!items || !items.length) return;

    const section = document.createElement('section');
    section.className = className;

    const heading = document.createElement('h4');
    heading.textContent = title;
    section.appendChild(heading);

    const list = document.createElement('ul');
    items.forEach((item) => {
      const listItem = document.createElement('li');
      listItem.textContent = item;
      list.appendChild(listItem);
    });

    section.appendChild(list);
    parent.appendChild(section);
  };

  const addResultCard = (parent, resultItem, index) => {
    const medicine = resultItem.medicine;
    const article = document.createElement('article');
    article.className = 'medicine-result-card';

    const rank = document.createElement('span');
    rank.className = 'medicine-result-rank';
    rank.textContent = index === 0 ? 'Best catalogue match' : `Related match ${index + 1}`;

    const name = document.createElement('h4');
    name.textContent = medicine.name;

    const use = document.createElement('p');
    use.textContent = medicine.use;

    const meta = document.createElement('small');
    meta.textContent = `${medicine.contains}. ${resultItem.reason}`;

    const caution = document.createElement('p');
    caution.className = 'medicine-result-caution';
    caution.textContent = medicine.caution;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'medicine-result-link';
    button.textContent = `View ${medicine.name} in the catalogue`;
    button.addEventListener('click', () => openCatalogueItem(medicine.name));

    article.appendChild(rank);
    article.appendChild(name);
    article.appendChild(use);
    article.appendChild(meta);
    article.appendChild(caution);
    article.appendChild(button);
    parent.appendChild(article);
  };

  const showSearchResults = (match) => {
    clearNode(result);
    result.className = `medicine-search-result medicine-search-result-${match.type}`;

    const summary = document.createElement('div');
    summary.className = 'medicine-result-summary';

    const title = document.createElement('h4');
    const copy = document.createElement('p');

    if (match.type === 'urgent') {
      title.textContent = 'Please seek medical help';
      copy.textContent = 'Your search includes symptoms that can need urgent assessment. The catalogue can still show related context, but it should not be used for self-selection here.';
    } else if (match.type === 'clinician') {
      title.textContent = 'A clinician should choose this medicine';
      copy.textContent = 'This search points to an area where diagnosis or prescription choice matters, especially antibiotics, pregnancy, infants, or infections.';
    } else if (match.type === 'empty') {
      title.textContent = 'Search the medicine catalogue';
      copy.textContent = 'Type a symptom or health need, such as stomach ache, acidity, dry cough, fever, or pain and swelling.';
    } else if (match.type === 'none') {
      title.textContent = 'No close catalogue match found';
      copy.textContent = 'Try a simpler symptom phrase, or contact a qualified clinician if the problem is new, severe, persistent, or unclear.';
    } else {
      title.textContent = `${match.results.length} catalogue ${match.results.length === 1 ? 'result' : 'results'} found`;
      copy.textContent = 'Results are ranked by how closely your words match our catalogue uses. This is not a diagnosis or dosage recommendation.';
    }

    summary.appendChild(title);
    summary.appendChild(copy);
    result.appendChild(summary);

    if (match.results && match.results.length) {
      const resultGrid = document.createElement('div');
      resultGrid.className = 'medicine-result-grid';
      match.results.forEach((item, index) => addResultCard(resultGrid, item, index));
      result.appendChild(resultGrid);
    }

    addList(result, 'Related info', match.relatedInfo, 'medicine-related-info');
    addList(result, 'When to seek care', match.careAdvice, 'medicine-care-advice');

    if (match.type !== 'empty') {
      const disclaimer = document.createElement('p');
      disclaimer.className = 'medicine-result-footnote';
      disclaimer.textContent = 'Use medicines only on the advice of a qualified doctor or healthcare professional.';
      result.appendChild(disclaimer);
    }
  };

  const showScriptError = () => {
    showSearchResults({
      type: 'none',
      results: [],
      relatedInfo: ['The medicine search script did not finish loading. Refresh the page with Ctrl + F5, then search again.'],
      careAdvice: [],
    });
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const findMedicineMatch = getMatcher();
    if (!findMedicineMatch) {
      showScriptError();
      return;
    }

    const symptom = new FormData(form).get('symptom');
    showSearchResults(findMedicineMatch(symptom));
  });

  // The fieldset ships disabled so a failed script can never submit symptom text natively.
  if (!getMatcher()) {
    if (status) status.textContent = 'The catalogue search did not load. Refresh the page, or browse the catalogue below.';
    return;
  }

  fields.disabled = false;
  if (status) status.hidden = true;
}());
