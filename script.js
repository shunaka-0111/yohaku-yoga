const menu = document.querySelector('.menu');
const mobileNav = document.querySelector('#mobile-nav');
menu.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!expanded));
  menu.setAttribute('aria-label', expanded ? 'メニューを開く' : 'メニューを閉じる');
  mobileNav.hidden = expanded;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileNav.hidden = true;
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'メニューを開く');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) {
    mobileNav.hidden = true;
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'メニューを開く');
    menu.focus();
  }
});
document.querySelector('#booking-form').addEventListener('submit', event => {
  event.preventDefault();
  const selected = document.querySelector('#class-select').value;
  const message = document.querySelector('#booking-message');
  message.textContent = `「${selected}」を選択しました。これは予約画面のデモです。実際の予約を受け付けるには、予約サービスとの連携が必要です。`;
  message.hidden = false;
});

// Stop when the page is hidden or the visitor requests less motion.
const slides = [...document.querySelectorAll('.hero-slide')];
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
let currentSlide = 0;
let paused = motion.matches;
let slideTimer;
function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    const active = i === currentSlide;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
  });
}
function scheduleSlides() {
  clearInterval(slideTimer);
  if (!paused && !document.hidden) slideTimer = setInterval(() => showSlide(currentSlide + 1), 5000);
}
document.addEventListener('visibilitychange', scheduleSlides);
motion.addEventListener('change', event => { paused = event.matches; scheduleSlides(); });
scheduleSlides();

// Only the large display typography animates; all smaller headings remain still.
(() => {
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const headings = [...document.querySelectorAll('main h1, main h2.display, main .lesson-jp-title, main .studio-jp-title, main .photo-band > p')];
  const played = new WeakSet();
  const running = new Set();
  let observer;

  function stopMotion() {
    observer?.disconnect();
    running.forEach(animation => animation.cancel());
    running.clear();
  }

  function watchHeadings() {
    stopMotion();
    if (motion.matches) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || played.has(entry.target)) return;
        const heading = entry.target;
        played.add(heading);
        observer.unobserve(heading);
        const animation = heading.animate([
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], {
          duration: 1000,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          iterations: 1,
          fill: 'none'
        });
        running.add(animation);
        animation.onfinish = animation.oncancel = () => running.delete(animation);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -24px 0px' });
    headings.forEach(heading => {
      if (!played.has(heading)) observer.observe(heading);
    });
  }

  motion.addEventListener('change', watchHeadings);
  watchHeadings();
})();
