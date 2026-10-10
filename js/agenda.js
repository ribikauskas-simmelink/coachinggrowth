// Agenda: mostra só os eventos que ainda não terminaram (comparando com a data
// de hoje no navegador), então datas passadas somem sozinhas, sem novo deploy.
// Os dados vêm de window.CG_AGENDA, embutido pelo build.js.
(function () {
  var data = window.CG_AGENDA || { events: [], others: [], whatsapp: 'https://wa.me/5517991014053' };
  var MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var MON = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  var COURSE = 'Curso de Desenvolvimento';

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var now = new Date();
  var today = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
  var thisYear = now.getFullYear();

  function parts(iso) { var p = iso.split('-'); return { y: +p[0], m: +p[1] - 1, d: +p[2] }; }

  // "21 e 22 de novembro", "21 a 23 de novembro", "30 de novembro a 1 de dezembro"
  function datesText(e) {
    var a = parts(e.inicio), b = parts(e.fim || e.inicio);
    var year = function (p) { return p.y !== thisYear ? ' de ' + p.y : ''; };
    if (e.inicio === (e.fim || e.inicio)) return a.d + ' de ' + MONTHS[a.m] + year(a);
    if (a.m === b.m && a.y === b.y) {
      var sep = b.d - a.d === 1 ? ' e ' : ' a ';
      return a.d + sep + b.d + ' de ' + MONTHS[a.m] + year(a);
    }
    return a.d + ' de ' + MONTHS[a.m] + (a.y !== b.y ? ' de ' + a.y : '') + ' a ' + b.d + ' de ' + MONTHS[b.m] + year(b);
  }

  function signupUrl(e) {
    if (e.link) return e.link;
    return data.whatsapp + '?text=' + encodeURIComponent('Olá! Quero saber mais / me inscrever: ' + e.titulo + ' (' + datesText(e) + ').');
  }
  function contactUrl(text) { return data.whatsapp + '?text=' + encodeURIComponent(text); }

  var PIN = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="flex-shrink:0;margin-top:2px"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>';
  function placeHtml(e, cls) { return e.local ? '<div class="' + cls + '">' + PIN + '<span>' + esc(e.local) + '</span></div>' : ''; }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var upcoming = (data.events || []).filter(function (e) { return (e.fim || e.inicio) >= today; });
  var nextCourse = upcoming.filter(function (e) { return e.tipo === COURSE; })[0];
  var others = data.others || [];

  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll('[data-agenda="' + sel + '"]'), fn); }

  // Home: item "Próximo curso" no topo
  each('news', function (el) {
    var e = upcoming[0];
    if (!e) { el.remove(); return; }
    var k = e.tipo === COURSE ? 'Próximo curso' : (e.tipo || 'Próxima data');
    var v = (e.tipo === COURSE ? datesText(e) : e.titulo + ' · ' + datesText(e)) + (e.local ? ' · ' + e.local : '');
    el.outerHTML = '<a class="cg-news-item" href="/agenda/"><span class="cg-news-k">' + esc(k) + '</span><span class="cg-news-v">' + esc(v) + '</span></a>';
  });

  // Home: caixa "Próximo curso" da seção do curso
  each('course', function (el) {
    if (!nextCourse) return; // mantém o texto padrão
    el.innerHTML =
      '<div style="font-family:\'Anton\',sans-serif;font-size:30px;line-height:1.05;text-transform:uppercase;color:#fff;margin:0 0 8px">' + esc(datesText(nextCourse)) + '</div>' +
      (nextCourse.local ? '<div style="font-size:15px;color:#dcdcdc;margin:0 0 10px;display:flex;gap:6px;align-items:flex-start">' + PIN + '<span>' + esc(nextCourse.local) + '</span></div>' : '') +
      '<p style="font-size:17px;color:#b3b3b3;line-height:1.7;margin:0 0 14px">Chama no WhatsApp para garantir sua vaga — grupos têm desconto. <a href="/agenda/" style="color:#ff5a63;font-weight:700">Ver agenda completa →</a></p>';
  });

  // Artigo: faixa no celular
  each('strip', function (el) {
    var e = upcoming[0];
    if (!e) { el.remove(); return; }
    el.outerHTML = '<a class="cg-astrip" href="#agenda"><span class="cg-astrip-k">' + (e.tipo === COURSE ? 'Próximo curso' : 'Próxima data') + '</span>' +
      '<span class="cg-astrip-v">' + esc(datesText(e)) + '</span><span class="cg-astrip-go">Ver agenda ↓</span></a>';
  });

  function othersBlock(title) {
    if (!others.length) return '';
    return '<div class="cg-agenda-others"><span class="cg-agenda-k cg-agenda-k--dark">' + title + '</span><ul>' +
      others.map(function (o) { return '<li><span>' + esc(o.nome) + '</span><em>' + esc(o.info) + '</em></li>'; }).join('') +
      '</ul><a class="cg-agenda-link" href="' + contactUrl('Olá! Quero saber mais sobre as formações da Coaching Growth.') + '" target="_blank" rel="noopener">Consultar pelo WhatsApp →</a></div>';
  }

  // Artigo: agenda ao lado do texto
  each('aside', function (el) {
    var first = upcoming[0];
    var html = '<div class="cg-agenda-card">';
    if (first) {
      html += '<span class="cg-agenda-k">' + (first.tipo === COURSE ? 'Próximo curso' : esc(first.tipo || 'Próxima data')) + '</span>' +
        '<div class="cg-agenda-title">' + esc(first.titulo) + '</div>' +
        '<div class="cg-agenda-date">' + esc(datesText(first)) + '</div>' +
        placeHtml(first, 'cg-agenda-local') +
        '<a class="cg-btn cg-agenda-btn" href="' + esc(signupUrl(first)) + '" target="_blank" rel="noopener">Quero me inscrever</a>';
    } else {
      html += '<span class="cg-agenda-k">Curso de Desenvolvimento</span><p class="cg-agenda-soon">Novas datas em breve. Chama no WhatsApp para entrar na lista.</p>' +
        '<a class="cg-btn cg-agenda-btn" href="' + contactUrl('Olá! Quero entrar na lista do próximo Curso de Desenvolvimento.') + '" target="_blank" rel="noopener">Falar no WhatsApp</a>';
    }
    html += '</div>';
    var more = upcoming.slice(1, 4);
    if (more.length) {
      html += '<div class="cg-agenda-others"><span class="cg-agenda-k cg-agenda-k--dark">Também na agenda</span><ul>' +
        more.map(function (e) { return '<li><span>' + esc(e.titulo) + (e.local ? '<small>' + esc(e.local) + '</small>' : '') + '</span><em>' + esc(datesText(e)) + '</em></li>'; }).join('') +
        '</ul><a class="cg-agenda-link" href="/agenda/">Ver agenda completa →</a></div>';
    }
    html += othersBlock('Outras formações');
    el.innerHTML = html;
  });

  // Página /agenda
  each('page', function (el) {
    var html = '';
    if (upcoming.length) {
      html += '<div class="cg-events">' + upcoming.map(function (e) {
        var a = parts(e.inicio), b = parts(e.fim || e.inicio);
        var days = e.inicio === (e.fim || e.inicio) ? a.d : (a.m === b.m ? a.d + '–' + b.d : a.d + '/' + MON[a.m].toLowerCase() + '–' + b.d);
        return '<article class="cg-event">' +
          '<div class="cg-event-date"><span class="cg-event-days">' + days + '</span><span class="cg-event-mon">' + MON[b.m] + (b.y !== thisYear ? ' ' + b.y : '') + '</span></div>' +
          '<div class="cg-event-body">' +
            (e.tipo ? '<span class="cg-tag">' + esc(e.tipo) + '</span>' : '') +
            '<h2>' + esc(e.titulo) + '</h2>' +
            '<div class="cg-event-meta">' + esc(datesText(e)) + '</div>' +
            placeHtml(e, 'cg-event-local') +
            (e.obs ? '<p>' + esc(e.obs) + '</p>' : '') +
          '</div>' +
          '<a class="cg-btn cg-event-btn" href="' + esc(signupUrl(e)) + '" target="_blank" rel="noopener">Quero participar</a>' +
        '</article>';
      }).join('') + '</div>';
    } else {
      html += '<p class="cg-empty">Novas datas em breve.</p>';
    }
    if (others.length) {
      html += '<div class="cg-consult"><span class="cg-kicker">Sob consulta</span><h2>Também levamos até você.</h2>' +
        '<div class="cg-consult-grid">' + others.map(function (o) {
          return '<div class="cg-consult-item"><span>' + esc(o.nome) + '</span><em>' + esc(o.info) + '</em></div>';
        }).join('') + '</div>' +
        '<a class="cg-btn" href="' + contactUrl('Olá! Quero consultar datas de uma formação da Coaching Growth.') + '" target="_blank" rel="noopener">Consultar pelo WhatsApp</a></div>';
    }
    el.innerHTML = html;
  });
})();
