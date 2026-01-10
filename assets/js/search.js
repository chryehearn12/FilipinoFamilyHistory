// Simple client-side field search.
// 1) Fetch /search/index.json which Jekyll will generate.
// 2) Listen for form submissions and filter the appropriate dataset.
// 3) Render results under each section.

document.addEventListener('DOMContentLoaded', function () {
  const indexUrl = '/search/index.json';
  let DATA = {};

  fetch(indexUrl)
    .then(resp => {
      if (!resp.ok) throw new Error('Could not load search index: ' + resp.status);
      return resp.json();
    })
    .then(json => {
      DATA = json;
      console.info('Search index loaded:', Object.keys(DATA));
    })
    .catch(err => {
      console.warn(err);
    });

  function textMatches(value, query) {
    if (!query) return true; // empty query matches everything
    if (!value) return false;
    return value.toString().toLowerCase().includes(query.toString().toLowerCase());
  }

  function renderResults(datasetName, results, container) {
    container.innerHTML = '';
    if (!results || results.length === 0) {
      container.innerHTML = '<div class="note">No results</div>';
      return;
    }
    results.slice(0, 50).forEach(item => {
      const row = document.createElement('div');
      row.className = 'result-item';
      const left = document.createElement('div');
      left.className = 'result-left';
      left.textContent = (item.forename ? (item.forename + ' ') : '') + (item.surname || '');
      const right = document.createElement('div');
      right.className = 'result-right';
      right.textContent = (item.year ? item.year : '') + (item.place ? ' — ' + item.place : '');
      row.appendChild(left);
      row.appendChild(right);
      container.appendChild(row);
    });
  }

  document.querySelectorAll('.search-form').forEach(form => {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const dataset = form.dataset.dataset;
      const formData = new FormData(form);
      const filters = {};
      Array.from(formData.entries()).forEach(([k, v]) => {
        filters[k] = v.trim();
      });

      const container = document.querySelector('.results[data-results-for="' + dataset + '"]');
      if (!DATA[dataset]) {
        container.innerHTML = '<div class="note">Search dataset not available yet.</div>';
        return;
      }

      // simple filter: for each field that has content, perform substring match
      let results = DATA[dataset].filter(item => {
        return Object.keys(filters).every(key => {
          const q = filters[key];
          if (!q) return true;
          // custom mapping: some fields may not exist
          const value = item[key] || item.forename || item.surname || '';
          return textMatches(value, q);
        });
      });

      renderResults(dataset, results, container);
    });
  });
});
