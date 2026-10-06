const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
});

document.querySelectorAll('#navLinks a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    if (menuBtn) menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
  });
});

document.getElementById('year').textContent = new Date().getFullYear();

const sections = document.querySelectorAll('main section[id]');
const navItems = document.querySelectorAll('.nav-links a[href^="#"]');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(item => item.classList.toggle('active', item.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
sections.forEach(section => observer.observe(section));

/* ==========================================================================
   CERTIFICATIONS SLIDER — START
   ========================================================================== */

(() => {
  const slider = document.getElementById('certSlider');
  if (!slider) return;

  const viewport = slider.querySelector('.cert-viewport');
  const track = slider.querySelector('.cert-track');
  const prevBtn = slider.querySelector('.cert-prev');
  const nextBtn = slider.querySelector('.cert-next');
  const dotsWrap = document.getElementById('certDots');
  const originals = Array.from(track.children);
  const total = originals.length;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const DURATION = 480;               // slide animation time (ms)
  let perView = 1;                    // slides visible at once (read from CSS: 3 / 2 / 1)
  let index = 0;                      // position of the first visible slide
  let locked = false;                 // blocks clicks while a slide animates

  /* ---- build the pagination dots (one per certificate) ---- */
  const dots = originals.map((_, i) => {
    const li = document.createElement('li');
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'cert-dot';
    dot.setAttribute('aria-label', `Go to certificate ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    li.appendChild(dot);
    dotsWrap.appendChild(li);
    return dot;
  });

  /* ---- clones of the first slides let the slider loop seamlessly ---- */
  function readPerView() {
    return parseInt(getComputedStyle(track).getPropertyValue('--per-view'), 10) || 1;
  }

  function buildClones() {
    track.querySelectorAll('.is-clone').forEach(el => el.remove());
    for (let i = 0; i < perView; i++) {
      const clone = originals[i % total].cloneNode(true);
      clone.classList.add('is-clone');
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelector('.cert-card').tabIndex = -1;
      track.appendChild(clone);
    }
  }

  function render(animate) {
    track.style.transition = animate && !reduceMotion.matches
      ? `transform ${DURATION}ms cubic-bezier(.22,.8,.3,1)` : 'none';
    track.style.transform = `translateX(${-index * 100 / perView}%)`;
    dots.forEach((dot, i) => {
      const active = i === index % total;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true'); else dot.removeAttribute('aria-current');
    });
  }

  function settle() {                 // after sliding onto a clone, jump back to the real slide
    if (index >= total) { index -= total; render(false); }
    locked = false;
  }

  function step(dir) {
    if (locked) return;
    locked = true;
    if (dir < 0 && index === 0) {     // going back from the first slide: start at the clones
      index = total;
      render(false);
      void track.offsetWidth;         // apply the jump before animating
    }
    index += dir;
    render(true);
    setTimeout(settle, reduceMotion.matches ? 0 : DURATION + 30);
  }

  function goTo(i) {
    if (locked) return;
    index = i;
    render(true);
  }

  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  slider.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* ---- swipe on touch screens / drag with mouse ---- */
  let startX = null;
  let swiped = false;
  viewport.addEventListener('pointerdown', e => { startX = e.clientX; swiped = false; });
  viewport.addEventListener('pointerup', e => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 45) { swiped = true; step(dx < 0 ? 1 : -1); }
  });
  viewport.addEventListener('pointercancel', () => { startX = null; });

  /* ---- keep layout correct when the screen size changes ---- */
  function layout() {
    const next = readPerView();
    if (next !== perView || !track.querySelector('.is-clone')) {
      perView = next;
      index = index % total;
      buildClones();
    }
    render(false);
  }
  window.addEventListener('resize', layout);
  layout();

  /* ---- zoomed certificate (lightbox) ---- */
  const lightbox = document.getElementById('certLightbox');
  const lbImg = document.getElementById('certLbImg');
  const lbTitle = document.getElementById('certLbTitle');
  const lbDesc = document.getElementById('certLbDesc');
  const lbClose = lightbox.querySelector('.cert-close');
  const lbPrev = lightbox.querySelector('.cert-lb-prev');
  const lbNext = lightbox.querySelector('.cert-lb-next');
  let lbIndex = 0;
  let lastFocus = null;

  function fillLightbox(i) {
    lbIndex = (i + total) % total;
    const slide = originals[lbIndex];
    const img = slide.querySelector('img');
    lbImg.src = img.getAttribute('src');
    lbImg.alt = img.alt;
    lbTitle.textContent = slide.querySelector('.cert-caption').textContent;
    lbDesc.textContent = slide.querySelector('.cert-desc').textContent;
  }

  function openLightbox(i) {
    lastFocus = document.activeElement;
    fillLightbox(i);
    lightbox.hidden = false;
    document.body.classList.add('cert-lock');
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('cert-lock');
    setTimeout(() => { lightbox.hidden = true; lbImg.src = ''; }, 220);
    if (lastFocus) lastFocus.focus();
  }

  track.addEventListener('click', e => {
    const card = e.target.closest('.cert-card');
    if (!card || swiped) { swiped = false; return; }
    openLightbox(parseInt(card.closest('.cert-slide').dataset.index, 10));
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => fillLightbox(lbIndex - 1));
  lbNext.addEventListener('click', () => fillLightbox(lbIndex + 1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') fillLightbox(lbIndex - 1);
    if (e.key === 'ArrowRight') fillLightbox(lbIndex + 1);
    if (e.key === 'Tab') {            // keep keyboard focus inside the preview
      const items = [lbClose, lbPrev, lbNext];
      const pos = items.indexOf(document.activeElement);
      e.preventDefault();
      items[(pos + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
    }
  });
})();

/* ==========================================================================
   CERTIFICATIONS SLIDER — END
   ========================================================================== */
