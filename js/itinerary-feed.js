(function () {
  const list = document.getElementById('feed-list');
  if (!list) return;
  const form = document.getElementById('feed-search');
  const input = document.getElementById('feed-search-input');
  const status = document.getElementById('feed-status');
  const empty = document.getElementById('feed-empty');
  const more = document.getElementById('feed-more');

  const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  const appOrigin = isLocal ? 'http://localhost:3001' : 'https://app.ableten.xyz';
  const PAGE_SIZE = 24;

  let query = '';
  let offset = 0;
  let requestId = 0;
  let debounce = null;

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[ch]));
  }

  function copyPriceText(cents) {
    const amount = Number(cents);
    if (!Number.isFinite(amount) || amount < 500) return '';
    const dollars = amount / 100;
    if (Number.isInteger(dollars)) return '$' + dollars;
    return dollars.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  function copyCtaLabel(row) {
    const price = copyPriceText(row && row.price_cents);
    if (price) return 'Make it yours for ' + price;
    return row && row.duplicate ? 'Make it yours' : '';
  }

  function renderCard(row) {
    const slug = encodeURIComponent(row.slug || '');
    const href = appOrigin + '/c/' + slug;
    const title = escapeHtml(row.title || 'Itinerary');
    const meta = [];
    if (row.destination) meta.push(escapeHtml(row.destination));
    if (row.day_count > 0) meta.push(row.day_count + (row.day_count === 1 ? ' day' : ' days'));
    const places = row.place_count == null ? null : Number(row.place_count);
    const placeLabel = Number.isFinite(places)
      ? '<span class="feed-card-places">' + places + (places === 1 ? ' place' : ' places') + '</span>'
      : '';
    const ctaLabel = copyCtaLabel(row);
    const cta = ctaLabel
      ? '<a class="feed-card-cta" href="' + href + '?duplicate=1">' + ctaLabel + '</a>'
      : '';
    const foot = (placeLabel || cta)
      ? '<div class="feed-card-foot">' + placeLabel + cta + '</div>'
      : '';
    return '<li class="feed-card">'
      + '<a class="feed-card-open" href="' + href + '">'
      + '<span class="feed-card-image"><img src="' + appOrigin + '/c/' + slug + '/photo.png" alt="" loading="lazy" decoding="async" onerror="this.parentNode.hidden=true"></span>'
      + '<span class="feed-card-body">'
      + '<span class="feed-card-title">' + title + '</span>'
      + (meta.length ? '<span class="feed-card-meta">' + meta.join(' · ') + '</span>' : '')
      + '</span>'
      + '</a>'
      + foot
      + '</li>';
  }

  function showEmpty() {
    empty.textContent = query
      ? 'No itineraries for "' + query + '" yet. Be the first: plan it in Ableten and publish it here.'
      : 'The first itineraries are on their way. Plan your trip in Ableten and publish yours.';
    empty.hidden = false;
  }

  function load(append) {
    const id = ++requestId;
    if (!append) offset = 0;
    status.textContent = 'Loading itineraries…';
    more.hidden = true;
    const url = appOrigin + '/api/public-itineraries?q=' + encodeURIComponent(query)
      + (offset ? '&offset=' + offset : '');
    fetch(url)
      .then((res) => (res.ok ? res.json() : { itineraries: [] }))
      .catch(() => ({ itineraries: [] }))
      .then((data) => {
        if (id !== requestId) return;
        const rows = Array.isArray(data.itineraries) ? data.itineraries : [];
        status.textContent = '';
        const html = rows.map(renderCard).join('');
        if (append) {
          list.insertAdjacentHTML('beforeend', html);
        } else {
          list.innerHTML = html;
        }
        empty.hidden = true;
        if (!append && !rows.length) showEmpty();
        offset += rows.length;
        more.hidden = rows.length < PAGE_SIZE;
      });
  }

  function setQuery(next) {
    next = String(next || '').trim().slice(0, 80);
    if (next === query) return;
    query = next;
    const url = new URL(window.location.href);
    if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    load(false);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearTimeout(debounce);
    setQuery(input.value);
    document.getElementById('feed').scrollIntoView({ behavior: 'smooth' });
  });

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => setQuery(input.value), 300);
  });

  more.addEventListener('click', () => load(true));

  const initial = new URLSearchParams(window.location.search).get('q') || '';
  query = initial.trim().slice(0, 80);
  input.value = query;
  load(false);
})();
