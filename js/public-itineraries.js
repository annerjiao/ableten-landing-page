(function () {
  const list = document.getElementById('public-itinerary-list');
  const empty = document.getElementById('public-itinerary-empty');
  if (!list) return;

  const isLocal = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  const appOrigin = isLocal ? 'http://localhost:3001' : 'https://app.ableten.xyz';
  const PREVIEW = 12;

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

  fetch(appOrigin + '/api/public-itineraries?q=')
    .then((res) => (res.ok ? res.json() : { itineraries: [] }))
    .catch(() => ({ itineraries: [] }))
    .then((data) => {
      const rows = Array.isArray(data.itineraries) ? data.itineraries : [];
      if (!rows.length) return;
      if (empty) empty.hidden = true;
      list.innerHTML = rows.slice(0, PREVIEW).map(renderCard).join('');
    });
})();
