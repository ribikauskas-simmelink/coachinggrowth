# Coaching Growth

Site estático publicado no Netlify.

- `index.html`, `css/`, `js/`, `assets/`: o site
- `content/artigos/`: artigos (um arquivo `.md` por artigo, criados pelo painel)
- `admin/`: painel de artigos (Decap CMS), em `seusite/admin`
- `uploads/`: fotos e PDFs enviados pelo painel
- `build.js`: gera `_site/` com as páginas dos artigos (o Netlify roda isso sozinho)

Testar localmente: `npm install && npm run build`, depois abrir `_site/` num servidor local.
