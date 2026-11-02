/* Leide Feitosa: nav, revelação, hero vivo (WebGL no rato, MP4 no toque) e pedido pelo WhatsApp. */
(function () {
  const WHATS = '351968910752';
  const CICLO = 14; // segundos; o mesmo de tools/gerar_video.py

  /* ---------- nav ---------- */
  const nav = document.getElementById('nav');
  const menu = document.getElementById('menu');
  const abrir = document.getElementById('abrir');
  const fixo = document.querySelector('.whats-fixo');
  const rolou = () => {
    const y = window.scrollY;
    nav.classList.toggle('solida', y > 40);
    fixo.classList.toggle('ver', y > window.innerHeight * .9);
  };
  addEventListener('scroll', rolou, { passive: true }); rolou();
  const fechar = () => { menu.classList.remove('aberto'); abrir.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
  abrir.addEventListener('click', () => {
    const vai = !menu.classList.contains('aberto');
    menu.classList.toggle('aberto', vai); abrir.setAttribute('aria-expanded', String(vai));
    document.body.style.overflow = vai ? 'hidden' : '';
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', fechar));
  addEventListener('keydown', e => { if (e.key === 'Escape') fechar(); });

  /* ---------- revelação ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('ok'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.r').forEach((el, i) => {
    /* irmãos em grade entram um a um */
    const irmaos = [...el.parentElement.children].filter(c => c.classList.contains('r'));
    const k = irmaos.indexOf(el);
    if (irmaos.length > 1) el.style.transitionDelay = (k % 4) * 80 + 'ms';
    io.observe(el);
  });

  /* ---------- hero ---------- */
  const arte = document.getElementById('heroArte');
  const foto = arte.querySelector('.hero-foto');
  const foco = arte.dataset.foco.split(',').map(Number);
  const toque = matchMedia('(hover: none), (pointer: coarse)').matches;
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const q = new URLSearchParams(location.search);

  function video() {
    const r = arte.getBoundingClientRect();
    const v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.loop = true; v.autoplay = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.preload = 'auto';
    v.src = 'assets/video/' + (r.width / r.height < .9 ? 'hero-pe.mp4' : 'hero-quadrado.mp4');
    v.addEventListener('playing', () => v.classList.add('vivo'), { once: true });
    arte.appendChild(v);
    v.play().catch(() => {});
    new IntersectionObserver(([e]) => { e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }).observe(arte);
  }

  function vivo() {
    const cv = document.createElement('canvas');
    let T;
    try { T = brilhoGL(cv, foto, { foco }); } catch (e) { T = null; }
    if (!T) return;
    arte.appendChild(cv);
    let dpr = Math.min(devicePixelRatio || 1, 2), ver = true, t0 = performance.now(), lento = 0, raf = 0;
    const fixa = q.has('fase') ? parseFloat(q.get('fase')) : null; // ?fase=0..1 congela um quadro para conferir
    const medir = () => {
      const r = arte.getBoundingClientRect();
      T.tamanho(Math.round(r.width * dpr), Math.round(r.height * dpr), dpr);
    };
    const quadro = (agora) => {
      raf = 0;
      if (!ver) return;
      const fase = fixa != null ? fixa * Math.PI * 2 : ((agora - t0) / 1000 / CICLO % 1) * Math.PI * 2;
      const a = performance.now();
      T.desenhar(fase);
      /* se o quadro passa de 22 ms seguidos, baixa a resolução */
      if (performance.now() - a > 22 && ++lento > 20 && dpr > 1) { dpr = Math.max(1, dpr - .5); lento = 0; medir(); }
      if (fixa == null) raf = requestAnimationFrame(quadro);
    };
    medir(); T.desenhar(fixa != null ? fixa * Math.PI * 2 : 0);
    requestAnimationFrame(() => cv.classList.add('vivo'));
    new ResizeObserver(() => { medir(); T.desenhar(fixa != null ? fixa * Math.PI * 2 : 0); }).observe(arte);
    new IntersectionObserver(([e]) => { ver = e.isIntersecting; if (ver && !raf) raf = requestAnimationFrame(quadro); }).observe(arte);
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); ver = false; cv.remove(); });
  }

  if (!calmo && !q.has('parado')) {
    if (toque || q.has('video')) video();
    else if (foto.complete && foto.naturalWidth) vivo();
    else foto.addEventListener('load', vivo, { once: true });
  }

  /* ---------- pedido ---------- */
  const f = document.getElementById('pedido');
  const previa = document.getElementById('previa');
  let aba = 'atendimento';
  const abas = f.querySelectorAll('.aba');
  const trocar = (nome) => {
    aba = nome;
    abas.forEach(b => {
      const sim = b.dataset.aba === nome;
      b.setAttribute('aria-selected', String(sim));
      document.getElementById(b.getAttribute('aria-controls')).hidden = !sim;
    });
    montar();
  };
  abas.forEach(b => b.addEventListener('click', () => trocar(b.dataset.aba)));

  function texto() {
    const d = new FormData(f);
    const nome = (d.get('nome') || '').trim();
    const ola = 'Olá, Leide!' + (nome ? ' Chamo-me ' + nome + '.' : '');
    if (aba === 'atendimento') {
      const quando = (d.get('quando') || '').trim();
      return ola + '\nGostaria de marcar: ' + d.get('servico') + ' (' + d.get('cliente') + ').' +
        (quando ? '\nPrefiro: ' + quando + '.' : '') + '\nPode dizer-me o valor e as vagas?';
    }
    return ola + '\nTenho interesse no curso ' + d.get('curso') + '.\nExperiência: ' + d.get('nivel') +
      '.\nGostaria de fazer em ' + d.get('pais') + '.\nPode enviar-me as próximas datas e o valor?';
  }
  function montar() { previa.textContent = texto(); }
  f.addEventListener('input', montar); f.addEventListener('change', montar);
  f.addEventListener('submit', e => {
    e.preventDefault();
    window.open('https://wa.me/' + WHATS + '?text=' + encodeURIComponent(texto()), '_blank', 'noopener');
  });
  /* "Pedir vaga" de cada curso já abre o pedido com o curso escolhido */
  document.querySelectorAll('[data-curso]').forEach(b => b.addEventListener('click', () => {
    trocar('formacao');
    const s = f.querySelector('select[name="curso"]');
    s.value = b.dataset.curso; montar();
    document.getElementById('marcar').scrollIntoView({ behavior: calmo ? 'auto' : 'smooth' });
  }));
  montar();

  document.getElementById('ano').textContent = new Date().getFullYear();
})();
