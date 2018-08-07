import axios from 'axios';

let searchResultsToHTML = (stores) => {
  return stores.map(store => `
    <a href="/store/${store.slug}" class="search__result">
      <strong>${store.name}</strong>
    </a>
  `).join('');
}

let typeAhead = (search) => {
  if (!search) return;

  let searchInput = search.querySelector('input[name="search"]');
  let searchResults = search.querySelector('.search__results');

  let queries = {};
  let waitingForAnswer = false,
      timerID;

  let renderResults = (results, value) => {
    if (!results.length) {
      let html = `<div class="search__result">No results for "${value}"</div>`;
      searchResults.insertAdjacentHTML('afterbegin', html);
      return;
    }
    let html = searchResultsToHTML(queries[value]);
    searchResults.insertAdjacentHTML('afterbegin', html);
  }
  
  searchInput.on('input', function() {
    clearTimeout(timerID);
    let val = this.value;
    if (!val) {
      searchResults.style.display = 'none';
      return;
    }

    while (searchResults.lastChild) searchResults.removeChild(searchResults.lastChild);
    searchResults.style.display = 'block';

    if (val in queries) {
      renderResults(queries[val], val);
      return;
    }

    timerID = setTimeout(() => {
      axios.get(`/api/v1/search?q=${val}`)
      .then(res => {
        queries[this.value] = res.data;
        if (searchInput.value != val) return;
        renderResults(res.data, val);
    });
    }, 700);
  });

  search.on('keyup', (e) => {
    // return if key is NOT Enter|Arrow Top|Arrow Bottom 
    if (![13, 38, 40].includes(e.keyCode)) return;

    let activeClass = 'search__result--active';
    let current = search.querySelector(`.${activeClass}`);
    let items = search.querySelectorAll('.search__result');
    let next;

    if (e.keyCode === 40 && current) {
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) {
      next = items[0];
    } else if (e.keyCode == 38 && current) {
      next = current.previousElementSibling || items[items.length - 1];
    } else if (e.keyCode == 38) {
      next = items[items.length - 1];
    } else if (e.keyCode == 13 && (current && current.href)) {
      window.location = current.href;
      return;
    }

    if (current) {
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
    
  });
}

export default typeAhead;