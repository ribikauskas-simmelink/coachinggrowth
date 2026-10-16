// Analytics (Umami): as visitas são contadas automaticamente pelo script do Umami.
// Aqui registramos os cliques que importam: WhatsApp, Instagram, inscrições e PDFs.
(function () {
  function track(name, data) {
    if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data);
  }
  window.cgTrack = track;

  function label(el) { return (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60); }

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('a, button');
    if (!el || el.hasAttribute('data-no-track')) return;
    var href = el.getAttribute('href') || '';
    var data = { botao: label(el), pagina: location.pathname };
    if (el.dataset.trackEvento) data.evento = el.dataset.trackEvento;

    if (el.dataset.track) track(el.dataset.track, data);
    else if (href.indexOf('wa.me/') !== -1) track('WhatsApp', data);
    else if (href.indexOf('instagram.com') !== -1) track('Instagram', data);
    else if (/\.pdf($|\?)/i.test(href)) track('Download PDF', { artigo: document.title.replace(/ · Coaching Growth$/, ''), pagina: location.pathname });
  }, true);
})();
