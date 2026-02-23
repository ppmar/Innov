/* Innov Solution — JS (sobriete numerique) */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Detect mobile for parallax disable ---- */
  const isMobile = window.matchMedia('(max-width: 640px)').matches;

  /* ---- Parallax on scroll ---- */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  const heroBg = document.querySelector('.hero-bg');
  const sections = document.querySelectorAll('.parallax-section');

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;

      if (!isMobile) {
        // Hero background parallax — moves slower than scroll for depth
        if (heroBg) {
          heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
        }

        // Parallax cards: front (0.18) moves faster, back (0.06) slower = 3D feel
        parallaxEls.forEach(el => {
          const speed = parseFloat(el.dataset.parallax) || 0.1;
          const rect = el.getBoundingClientRect();
          const centerY = rect.top + rect.height / 2;
          const viewCenter = window.innerHeight / 2;
          const offset = (centerY - viewCenter) * speed;
          el.style.transform = el.dataset.parallaxBase
            ? `${el.dataset.parallaxBase} translateY(${offset}px)`
            : `translateY(${offset}px)`;
        });
      }

      // Section fade-in on scroll (works on all screen sizes)
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const visible = rect.top < window.innerHeight * 0.85;
        if (visible && !section.classList.contains('visible')) {
          section.classList.add('visible');
        }
      });

      ticking = false;
    });
  }

  // Set base transforms for back card
  const backCard = document.querySelector('.hero-card--back');
  if (backCard) backCard.dataset.parallaxBase = 'rotate(4deg) scale(0.93)';

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial run


  /* ---- Animate card progress bars ---- */
  const barFills = document.querySelectorAll('.card-bar-fill');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        barFills.forEach(bar => {
          const w = bar.dataset.width;
          if (w) bar.style.width = w;
        });
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual) cardObserver.observe(heroVisual);


  /* ---- Counter animation for stats ---- */
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStats();
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const statsBand = document.querySelector('.stats-band');
  if (statsBand) statObserver.observe(statsBand);

  function animateStats() {
    document.querySelectorAll('.stat[data-target]').forEach(stat => {
      const numberEl = stat.querySelector('.stat-number');
      const target = parseInt(stat.dataset.target, 10);
      const duration = 1200;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        numberEl.textContent = Math.round(target * eased);

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          numberEl.textContent = target;
        }
      }

      requestAnimationFrame(tick);
    });
  }


  /* ---- Fund Carousel ---- */
  const track = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-btn--prev');
  const nextBtn = document.querySelector('.carousel-btn--next');

  if (track && prevBtn && nextBtn) {
    let pos = 0;

    function getCardWidth() {
      const card = track.querySelector('.fund-card');
      if (!card) return 320;
      return card.offsetWidth + 20; // card width + gap
    }

    function getMaxPos() {
      const wrapper = track.parentElement;
      const totalWidth = track.scrollWidth;
      const visibleWidth = wrapper.offsetWidth;
      return Math.max(0, totalWidth - visibleWidth);
    }

    function slide(dir) {
      const step = getCardWidth();
      const max = getMaxPos();
      pos = Math.max(0, Math.min(pos + step * dir, max));
      track.style.transform = `translateX(-${pos}px)`;
    }

    prevBtn.addEventListener('click', () => slide(-1));
    nextBtn.addEventListener('click', () => slide(1));

    // Reset on resize
    window.addEventListener('resize', () => {
      pos = 0;
      track.style.transform = 'translateX(0)';
    });
  }


  /* ---- Smooth scroll ---- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });


  /* ---- Nav shadow on scroll ---- */
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      nav.style.boxShadow = '0 1px 8px rgba(0,0,0,0.06)';
    } else {
      nav.style.boxShadow = 'none';
    }
  }, { passive: true });

});
