// Gera o site final em _site/:
//  - copia os arquivos estáticos (index.html, css, js, assets, admin, uploads)
//  - transforma cada content/artigos/*.md numa página em /artigos/<slug>/
//  - cria a lista /artigos/ e preenche a seção "Conteúdo" da home
// Roda no Netlify a cada publicação (npm run build).

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const ROOT = __dirname;
const OUT = path.join(ROOT, '_site');
const ARTICLES_DIR = path.join(ROOT, 'content', 'artigos');
const STATIC = ['css', 'js', 'assets', 'admin', 'uploads'];
const HOME_CARDS = 3;
const WHATSAPP = 'https://wa.me/55';
const INSTAGRAM = 'https://www.instagram.com/coachingrowth/';

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function toDate(v) {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(String(v).slice(0, 10) + 'T12:00:00Z');
  return isNaN(d) ? null : d;
}

function formatDate(d) {
  return d ? `${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]} de ${d.getUTCFullYear()}` : '';
}

function readingTime(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// O título já aparece no topo da página; se o texto repete o título como
// "# Título" na primeira linha, essa linha é removida.
function stripTitle(md, title) {
  const norm = (t) => String(t || '').replace(/[*_`#]/g, '').trim().toLowerCase();
  return md.replace(/^\s*#\s+(.+)\n/, (line, h) => (norm(h) === norm(title) ? '' : line));
}

function loadArticles() {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs.readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(ARTICLES_DIR, f), 'utf8'));
      const slug = f.replace(/\.md$/, '');
      const date = toDate(data.date);
      const pdf = data.pdf && data.pdf.file ? data.pdf : null;
      return {
        slug,
        url: `/artigos/${slug}/`,
        title: data.title || slug,
        date,
        category: data.category || '',
        author: data.author || '',
        summary: data.summary || '',
        cover: data.cover || '',
        gallery: (data.gallery || []).filter((g) => g && g.image),
        pdf,
        html: marked.parse(stripTitle(content || '', data.title)),
        minutes: readingTime(content || ''),
      };
    })
    .sort((a, b) => (b.date ? b.date.getTime() : 0) - (a.date ? a.date.getTime() : 0));
}

// ── Shared pieces ────────────────────────────────────────────────────────────

const HEAD = (title, description, image) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${image ? `<meta property="og:image" content="${esc(image)}">\n` : ''}<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%230a0a0a'/%3E%3Ctext x='50' y='62' text-anchor='middle' font-family='Impact,sans-serif' font-size='34' fill='%23d81e2c'%3ECG%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&amp;family=Archivo:ital,wght@0,400;0,500;0,600;0,700;1,400&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/site.css">
<link rel="stylesheet" href="/css/article.css">
</head>
<body class="cg-page">
`;

const NAV = `<nav class="cg-nav is-visible">
  <div style="display:flex;align-items:center;justify-content:space-between;height:58px;max-width:1160px;margin:0 auto;padding:0 28px">
    <a href="/" style="height:38px;display:flex;align-items:center"><img src="/assets/logo-cg-white-opt.png" alt="Coaching Growth" style="height:26px;width:auto;display:block"></a>
    <div class="cg-nav-links" style="display:flex;gap:20px;align-items:center;justify-content:flex-end">
      <a class="cg-navlink" href="/#services">Serviços</a>
      <a class="cg-navlink" href="/#course">Curso</a>
      <a class="cg-navlink" href="/#time">Time</a>
      <a class="cg-navlink" href="/artigos/">Artigos</a>
      <a class="cg-btn cg-btn--sm" href="${WHATSAPP}" target="_blank" rel="noopener">WhatsApp</a>
    </div>
  </div>
</nav>
`;

const FOOTER = `<section class="cg-cta">
  <div class="cg-wrap">
    <div class="cg-cta-title">Fazer o comum<br>de forma extraordinária.</div>
    <p>Curso, grupo de estudos, mentoria, clínicas ou programação para o seu box: fala com a gente.</p>
    <div class="cg-cta-actions">
      <a class="cg-btn cg-btn--white" href="${WHATSAPP}" target="_blank" rel="noopener">Falar no WhatsApp</a>
      <a class="cg-btn cg-btn--ghost" href="${INSTAGRAM}" target="_blank" rel="noopener">Instagram</a>
    </div>
  </div>
</section>
<footer class="cg-footer">
  <div class="cg-wrap">
    <img src="/assets/logo-cg-white-opt.png" alt="Coaching Growth" style="width:180px;height:auto;display:block">
    <span>© ${new Date().getFullYear()} Coaching Growth · Henrique Scomparim</span>
  </div>
</footer>
`;

function card(a) {
  return `<a class="cg-acard" href="${a.url}">
  <div class="cg-acard-img">${a.cover ? `<img src="${esc(a.cover)}" alt="" loading="lazy">` : '<span>CG</span>'}</div>
  <div class="cg-acard-body">
    ${a.category ? `<span class="cg-tag">${esc(a.category)}</span>` : ''}
    <h3>${esc(a.title)}</h3>
    ${a.summary ? `<p>${esc(a.summary)}</p>` : ''}
    <span class="cg-acard-meta">${esc(formatDate(a.date))}${a.date ? ' · ' : ''}${a.minutes} min de leitura</span>
  </div>
</a>`;
}

// ── Article page ─────────────────────────────────────────────────────────────

function pdfBlock(a) {
  const p = a.pdf;
  if (!p) return '';
  const name = p.title || 'Material complementar';
  const desc = p.description ? `<p>${esc(p.description)}</p>` : '';
  const head = `<div class="cg-pdf-head">
      <span class="cg-pdf-icon">PDF</span>
      <div><div class="cg-pdf-title">${esc(name)}</div>${desc}</div>
    </div>`;

  if (p.require_phone === false) {
    return `<aside class="cg-pdf">
    ${head}
    <a class="cg-btn" href="${esc(p.file)}" download>Baixar PDF</a>
  </aside>`;
  }

  // Formulário capturado pelo Netlify Forms (painel do Netlify → Forms).
  return `<aside class="cg-pdf">
    ${head}
    <form class="cg-pdf-form" name="download-pdf" method="POST" data-netlify="true" netlify-honeypot="bot-field" data-pdf="${esc(p.file)}">
      <input type="hidden" name="form-name" value="download-pdf">
      <input type="hidden" name="artigo" value="${esc(a.title)}">
      <input type="hidden" name="material" value="${esc(name)}">
      <p hidden><label>Não preencha: <input name="bot-field"></label></p>
      <label class="cg-field"><span>Nome</span><input name="nome" autocomplete="name" placeholder="Seu nome"></label>
      <label class="cg-field"><span>WhatsApp / telefone *</span><input name="telefone" type="tel" autocomplete="tel" inputmode="tel" required placeholder="(11) 99999-9999"></label>
      <button class="cg-btn" type="submit">Baixar PDF</button>
      <small class="cg-pdf-note">Informe seu telefone para liberar o download.</small>
    </form>
  </aside>`;
}

function galleryBlock(a) {
  if (!a.gallery.length) return '';
  return `<section class="cg-gallery">
    ${a.gallery.map((g) => `<figure>
      <a href="${esc(g.image)}" target="_blank" rel="noopener"><img src="${esc(g.image)}" alt="${esc(g.caption || '')}" loading="lazy"></a>
      ${g.caption ? `<figcaption>${esc(g.caption)}</figcaption>` : ''}
    </figure>`).join('\n    ')}
  </section>`;
}

function articlePage(a, all) {
  const others = all.filter((o) => o.slug !== a.slug).slice(0, 3);
  const meta = [a.author, formatDate(a.date), `${a.minutes} min de leitura`].filter(Boolean).map(esc).join(' · ');
  return HEAD(`${a.title} · Coaching Growth`, a.summary || a.title, a.cover) + NAV + `
<main>
  <header class="cg-ahero">
    <div class="cg-wrap cg-narrow">
      <a class="cg-back" href="/artigos/">← Todos os artigos</a>
      ${a.category ? `<span class="cg-tag cg-tag--dark">${esc(a.category)}</span>` : ''}
      <h1>${esc(a.title)}</h1>
      ${a.summary ? `<p class="cg-lede">${esc(a.summary)}</p>` : ''}
      <div class="cg-ameta">${meta}</div>
    </div>
  </header>
  ${a.cover ? `<div class="cg-wrap cg-cover"><img src="${esc(a.cover)}" alt=""></div>` : ''}
  <article class="cg-wrap cg-narrow cg-prose">
    ${a.html}
  </article>
  <div class="cg-wrap cg-narrow">
    ${galleryBlock(a)}
    ${pdfBlock(a)}
  </div>
  ${others.length ? `<section class="cg-more">
    <div class="cg-wrap">
      <div class="cg-kicker">Continue lendo</div>
      <div class="cg-grid">${others.map(card).join('\n')}</div>
    </div>
  </section>` : ''}
</main>
` + FOOTER + `<script src="/js/article.js"></script>
</body>
</html>
`;
}

function listPage(all) {
  return HEAD('Artigos · Coaching Growth', 'Artigos sobre metodologia, ensino, mentalidade e o papel do treinador.') + NAV + `
<main>
  <header class="cg-ahero">
    <div class="cg-wrap">
      <span class="cg-kicker">Conteúdo gratuito</span>
      <h1>Pra pensar<br>como treinador.</h1>
      <p class="cg-lede">Artigos densos, sem enrolação. Sobre metodologia, ensino, mentalidade e o que realmente separa um treinador mediano de um treinador que transforma.</p>
    </div>
  </header>
  <section class="cg-list">
    <div class="cg-wrap">
      ${all.length ? `<div class="cg-grid">${all.map(card).join('\n')}</div>` : '<p class="cg-empty">Os primeiros artigos estão a caminho.</p>'}
    </div>
  </section>
</main>
` + FOOTER + `</body>
</html>
`;
}

function homeCards(all) {
  const latest = all.slice(0, HOME_CARDS);
  return `<!-- ARTIGOS:START -->
      <div class="cg-grid">
${latest.map(card).join('\n')}
      </div>
      <div style="margin-top:36px"><a class="cg-btn" href="/artigos/">Ver todos os artigos</a></div>
      <!-- ARTIGOS:END -->`;
}

// ── Build ────────────────────────────────────────────────────────────────────

function write(rel, html) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const dir of STATIC) {
  const src = path.join(ROOT, dir);
  if (fs.existsSync(src)) fs.cpSync(src, path.join(OUT, dir), { recursive: true });
}

const articles = loadArticles();

let home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
home = home.replace('<link rel="stylesheet" href="css/site.css">', '<link rel="stylesheet" href="css/site.css">\n<link rel="stylesheet" href="css/article.css">');
if (articles.length) {
  home = home.replace(/<!-- ARTIGOS:START[\s\S]*?<!-- ARTIGOS:END -->/, homeCards(articles));
}
write('index.html', home);

write('artigos/index.html', listPage(articles));
for (const a of articles) write(`artigos/${a.slug}/index.html`, articlePage(a, articles));

console.log(`Site gerado em _site/ com ${articles.length} artigo(s).`);
