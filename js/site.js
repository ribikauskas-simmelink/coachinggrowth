(function () {
  // ── Nav appears after scrolling past the hero ──
  var nav = document.getElementById('top-nav');
  function onScroll() { nav.classList.toggle('is-visible', window.scrollY > 120); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Inline hover styles (style-hover="prop:value;...") ──
  document.querySelectorAll('[style-hover]').forEach(function (el) {
    var base = el.getAttribute('style') || '';
    var hover = el.getAttribute('style-hover');
    el.addEventListener('mouseenter', function () { el.setAttribute('style', base + ';' + hover); });
    el.addEventListener('mouseleave', function () { el.setAttribute('style', base); });
  });

  // ── Red corner brackets on card hover ──
  function addCorners(el) {
    ['tl', 'tr', 'bl', 'br'].forEach(function (pos) {
      var s = document.createElement('span');
      s.className = 'cg-corner cg-corner--' + pos;
      el.insertBefore(s, el.firstChild);
    });
  }
  document.querySelectorAll('[data-corners]').forEach(addCorners);

  // ── Boneco: flips upright once the section is well in view ──
  var boneco = document.getElementById('boneco');
  if (boneco && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { boneco.classList.toggle('is-in', e.isIntersecting); });
    }, { threshold: 0.6 }).observe(boneco);
  } else if (boneco) {
    boneco.classList.add('is-in');
  }

  // ── Services: persona tabs ──
  var personas = [
    {
      key: 'Sou treinador',
      sub: 'Coach de CrossFit',
      line: 'A trilha de quem quer entregar um coaching de mais qualidade — da formação completa ao acompanhamento individual.',
      steps: [
        { n: '01', title: 'Curso de Desenvolvimento', desc: 'Formação completa para treinadores que querem evoluir na prática, aprofundando conhecimentos técnicos, didáticos e profissionais para entregar um coaching de maior qualidade.', cta: 'Ver próxima turma', href: '#course' },
        { n: '02', title: 'Grupo de Estudos', desc: 'Um espaço de aprendizado contínuo, troca de experiências e discussão de temas relevantes para quem quer estudar, se atualizar e evoluir junto com outros treinadores.', cta: 'Entrar na lista', href: '#contact' },
        { n: '03', title: 'Mentoria Individual', desc: 'Acompanhamento personalizado para desenvolver os pontos que mais impactam sua atuação como treinador, com direcionamento de acordo com seus objetivos, desafios e momento profissional.', cta: 'Falar sobre mentoria', href: '#contact' }
      ]
    },
    {
      key: 'Sou aluno',
      sub: 'Atleta ou praticante',
      line: 'Para quem treina e quer destravar movimento: técnica específica em grupo ou acompanhamento individual.',
      steps: [
        { n: '01', title: 'Clínicas', desc: 'Treinamentos específicos e práticos para desenvolver habilidades e movimentos do CrossFit, com orientação técnica, progressões e correções individualizadas.', cta: 'Ver próximas datas', href: '#contact' },
        { n: '02', title: 'Personal Individual', desc: 'Treinamento individualizado e direcionado aos seus objetivos, necessidades e nível atual, com acompanhamento próximo do treinador durante todo o processo.', cta: 'Falar com um treinador', href: '#contact' }
      ]
    },
    {
      key: 'Tenho um box',
      sub: 'Dono ou head coach',
      line: 'Do treino que seus alunos fazem à equipe que entrega esse treino — e o box como palco de formação.',
      steps: [
        { n: '01', title: 'Programação', desc: 'Planejamento de treinos estruturado para boxes, pensado para promover evolução dos alunos, variedade, segurança e uma experiência de treino consistente ao longo do tempo.', cta: 'Pedir uma proposta', href: '#contact' },
        { n: '02', title: 'Mentoria para Equipe', desc: 'Desenvolvimento da equipe de coaches do box, trabalhando aspectos técnicos, didáticos e profissionais para elevar o padrão do coaching e da experiência entregue aos alunos.', cta: 'Falar sobre a equipe', href: '#contact' },
        { n: '03', title: 'Quero sediar um curso', desc: 'Leve uma formação da Coaching Growth para dentro do seu box e proporcione uma experiência de desenvolvimento profissional para sua equipe e treinadores da sua região.', cta: 'Quero sediar', href: '#contact' },
        { n: '04', title: 'Quero sediar uma clínica', desc: 'Receba uma clínica da Coaching Growth no seu box, oferecendo aos seus alunos uma experiência focada no desenvolvimento técnico de habilidades e movimentos específicos.', cta: 'Quero sediar', href: '#contact' }
      ]
    }
  ];

  var tabsEl = document.getElementById('personas');
  var keyEl = document.getElementById('persona-key');
  var lineEl = document.getElementById('persona-line');
  var stepsEl = document.getElementById('persona-steps');

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  var buttons = personas.map(function (p, i) {
    var b = el('button', 'cg-persona');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    var row = el('div', 'cg-persona-row');
    row.appendChild(el('span', 'cg-persona-dot'));
    var txt = el('div');
    txt.style.cssText = 'flex:1;min-width:0';
    txt.appendChild(el('div', 'cg-persona-title', p.key));
    txt.appendChild(el('div', 'cg-persona-sub', p.sub));
    row.appendChild(txt);
    b.appendChild(row);
    b.addEventListener('click', function () { select(i); });
    tabsEl.appendChild(b);
    return b;
  });

  function select(i) {
    var p = personas[i];
    buttons.forEach(function (b, j) { b.setAttribute('aria-selected', String(i === j)); });
    keyEl.textContent = p.key;
    lineEl.textContent = p.line;
    stepsEl.innerHTML = '';
    p.steps.forEach(function (s) {
      var step = el('div', 'cg-step');
      step.appendChild(el('div', 'cg-step-n', s.n));
      var card = el('div', 'cg-step-card');
      card.setAttribute('data-corners', '');
      card.appendChild(el('div', 'cg-step-title', s.title));
      card.appendChild(el('p', 'cg-step-desc', s.desc));
      var a = el('a', 'cg-step-cta', s.cta + ' →');
      a.href = s.href;
      card.appendChild(a);
      addCorners(card);
      step.appendChild(card);
      stepsEl.appendChild(step);
    });
  }
  select(0);
})();

// Netlify Identity: invite / password-recovery links land on the home page;
// after logging in, send the editor to the CMS.
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', function (user) {
    if (!user) {
      window.netlifyIdentity.on('login', function () { document.location.href = '/admin/'; });
    }
  });
}
