/* Recupera · propuesta — en celular: planes en carrusel y acordeones cerrados.
   En escritorio e impresión todo queda abierto, como la hoja A4. */
(function () {
  var mq = window.matchMedia('(max-width:760px)');
  var acc = [].slice.call(document.querySelectorAll('details.acc'));

  function sync() { acc.forEach(function (d) { d.open = !mq.matches; }); }
  sync();
  mq.addEventListener('change', sync);
  window.addEventListener('beforeprint', function () { acc.forEach(function (d) { d.open = true; }); });
  window.addEventListener('afterprint', sync);

  // En escritorio el acordeón no se cierra
  acc.forEach(function (d) {
    var s = d.querySelector('summary');
    if (s) s.addEventListener('click', function (e) { if (!mq.matches) e.preventDefault(); });
  });

  // Carrusel de planes con pestañas
  [].slice.call(document.querySelectorAll('.plans')).forEach(function (row) {
    var cards = [].slice.call(row.querySelectorAll(':scope > .plan'));
    if (cards.length < 2) return;

    var tabs = document.createElement('div');
    tabs.className = 'plan-tabs';
    var btns = cards.map(function (card, i) {
      var b = document.createElement('button');
      b.type = 'button';
      var t = card.querySelector('.plan-title');
      b.textContent = t ? t.textContent : 'Plan ' + (i + 1);
      if (card.classList.contains('star')) b.classList.add('is-star');
      b.addEventListener('click', function () { go(i, true); });
      tabs.appendChild(b);
      return b;
    });
    row.parentNode.insertBefore(tabs, row);

    function go(i, smooth) {
      var c = cards[i];
      row.scrollTo({ left: c.offsetLeft - (row.clientWidth - c.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto' });
    }
    function mark() {
      var mid = row.scrollLeft + row.clientWidth / 2, best = 0, dist = Infinity;
      cards.forEach(function (c, i) {
        var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (d < dist) { dist = d; best = i; }
      });
      btns.forEach(function (b, i) { b.setAttribute('aria-pressed', i === best ? 'true' : 'false'); });
    }
    row.addEventListener('scroll', function () { window.requestAnimationFrame(mark); }, { passive: true });

    var star = cards.findIndex(function (c) { return c.classList.contains('star'); });
    function start() { if (mq.matches) go(star < 0 ? 0 : star, false); mark(); }
    start();
    mq.addEventListener('change', start);
  });
})();
