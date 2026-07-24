/* FUEL V1 — header state, staggered reveals, count-up stats,
   benefits carousel, join form */

// ── Sticky header shadow ─────────────────────────
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ── Staggered reveal on scroll ───────────────────
// Reveals arriving in the same frame cascade 90ms apart.
let pendingReveals = [];
let flushScheduled = false;

function flushReveals() {
  pendingReveals.forEach((el, i) => {
    el.style.setProperty('--stagger', `${i * 90}ms`);
    el.classList.add('visible');
  });
  pendingReveals = [];
  flushScheduled = false;
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      pendingReveals.push(entry.target);
      revealObserver.unobserve(entry.target);
    }
  });
  if (pendingReveals.length && !flushScheduled) {
    flushScheduled = true;
    requestAnimationFrame(flushReveals);
  }
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ── Count-up stats (ledger card) ─────────────────
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    el.textContent = prefix + Math.round(target * eased) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));
}

// ── Benefits carousel ────────────────────────────
const track = document.getElementById('carouselTrack');
const slides = Array.from(track.children);
const dotsWrap = document.getElementById('carouselDots');
let current = 0;

slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.setAttribute('role', 'tab');
  dot.setAttribute('aria-label', `Benefit ${i + 1} of ${slides.length}`);
  dot.addEventListener('click', () => goTo(i));
  dotsWrap.appendChild(dot);
});

const dots = Array.from(dotsWrap.children);

function goTo(index) {
  current = (index + slides.length) % slides.length;
  const gap = 24; // matches .slide margin-right
  track.style.transform = `translateX(-${current * (track.clientWidth + gap)}px)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === current));
  slides.forEach((s, i) => s.classList.toggle('active', i === current));
}

document.getElementById('prevBtn').addEventListener('click', () => goTo(current - 1));
document.getElementById('nextBtn').addEventListener('click', () => goTo(current + 1));
window.addEventListener('resize', () => goTo(current));

// Swipe support
let touchStartX = null;
track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', (e) => {
  if (touchStartX === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
  touchStartX = null;
}, { passive: true });

// Keyboard support when carousel is focused/hovered
document.getElementById('benefitsCarousel').addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') goTo(current - 1);
  if (e.key === 'ArrowRight') goTo(current + 1);
});

goTo(0);

// ── Join form (placeholder — wire to your ESP later) ──
document.getElementById('joinForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('joinEmail');
  if (!email.checkValidity()) {
    email.reportValidity();
    return;
  }
  e.target.hidden = true;
  document.getElementById('formSuccess').hidden = false;
});

// ── Placeholder booking links ────────────────────
document.querySelectorAll('[data-placeholder="booking"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Placeholder: connect this button to your booking link (e.g. Calendly).');
  });
});
