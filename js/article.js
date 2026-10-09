// Download do PDF com telefone: registra o contato no Netlify Forms e libera o arquivo.
document.querySelectorAll('.cg-pdf-form').forEach(function (form) {
  var note = form.querySelector('.cg-pdf-note');
  var btn = form.querySelector('button');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var phone = form.telefone.value.replace(/\D/g, '');
    if (phone.length < 10) {
      note.textContent = 'Confira o telefone: inclua o DDD (ex.: 11 99999-9999).';
      note.classList.add('is-error');
      form.telefone.focus();
      return;
    }
    note.classList.remove('is-error');
    btn.disabled = true;
    btn.textContent = 'Liberando…';

    function release() {
      var a = document.createElement('a');
      a.href = form.getAttribute('data-pdf');
      a.download = '';
      document.body.appendChild(a);
      a.click();
      a.remove();
      btn.disabled = false;
      btn.textContent = 'Baixar de novo';
      note.textContent = 'Pronto! Se o download não começou, clique de novo.';
    }

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(release, release);
  });
});
