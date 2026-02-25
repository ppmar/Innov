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


  /* ---- Investment Simulator ---- */
  const FUND_DATA = {
    amundi: {
      name: 'Amundi ISR Actions Europe',
      fees: 0.0035,
      returns: { 1: 0.072, 3: 0.058, 5: 0.064, 10: 0.051 }
    },
    bnp: {
      name: 'BNP Paribas Green Bond',
      fees: 0.0020,
      returns: { 1: 0.038, 3: 0.019, 5: 0.021, 10: 0.028 }
    },
    lyxor: {
      name: 'Lyxor MSCI World ESG Leaders',
      fees: 0.0018,
      returns: { 1: 0.094, 3: 0.082, 5: 0.091, 10: 0.085 }
    },
    mirova: {
      name: 'Mirova Europe Env. Equity',
      fees: 0.0080,
      returns: { 1: 0.051, 3: 0.036, 5: 0.072, 10: 0.068 }
    },
    lbp: {
      name: 'La Banque Postale Multi Actions',
      fees: 0.0045,
      returns: { 1: 0.063, 3: 0.047, 5: 0.055, 10: 0.049 }
    }
  };

  function calculateFutureValue(capital, annualReturn, fees, years) {
    const netReturn = annualReturn - fees;
    return capital * Math.pow(1 + netReturn, years);
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatPercent(value) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value);
  }

  // Fund toggle selection
  const simToggles = document.querySelectorAll('.sim-fund-toggle');
  const simCalculateBtn = document.getElementById('sim-calculate');
  const selectedFunds = new Set();

  simToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const fundKey = toggle.dataset.fund;
      const isSelected = toggle.getAttribute('aria-pressed') === 'true';
      if (isSelected) {
        toggle.setAttribute('aria-pressed', 'false');
        selectedFunds.delete(fundKey);
      } else {
        toggle.setAttribute('aria-pressed', 'true');
        selectedFunds.add(fundKey);
      }
      simCalculateBtn.disabled = selectedFunds.size === 0;
    });
  });

  // Render results table and bars
  function renderResults() {
    const capitalInput = document.getElementById('sim-capital');
    const totalCapital = parseFloat(capitalInput.value) || 0;
    if (totalCapital < 100 || selectedFunds.size === 0) return;

    const perFundCapital = totalCapital / selectedFunds.size;
    const resultsDiv = document.getElementById('sim-results');
    const tbody = document.getElementById('sim-table-body');

    document.getElementById('sim-results-capital').textContent = formatCurrency(totalCapital);
    document.getElementById('sim-results-count').textContent = selectedFunds.size;

    const horizons = [1, 3, 5, 10];
    let tableHTML = '';
    const barData = [];

    selectedFunds.forEach(key => {
      const fund = FUND_DATA[key];
      const values = {};
      const gains = {};

      horizons.forEach(h => {
        values[h] = calculateFutureValue(perFundCapital, fund.returns[h], fund.fees, h);
        gains[h] = values[h] - perFundCapital;
      });

      barData.push({ key, name: fund.name, values, gains });

      tableHTML += '<tr>';
      tableHTML += '<td class="sim-fund-name-cell">' + fund.name + '</td>';
      horizons.forEach(h => {
        tableHTML += '<td>' + formatCurrency(values[h]) + '</td>';
      });
      tableHTML += '</tr>';

      tableHTML += '<tr class="sim-gain-row">';
      tableHTML += '<td></td>';
      horizons.forEach(h => {
        const gainPct = gains[h] / perFundCapital;
        tableHTML += '<td class="sim-gain-positive">+' + formatCurrency(gains[h]) + ' (' + formatPercent(gainPct) + ')</td>';
      });
      tableHTML += '</tr>';
    });

    tbody.innerHTML = tableHTML;

    // Store data for horizon switching
    resultsDiv._barData = barData;
    resultsDiv._perFundCapital = perFundCapital;

    // Show results with animation replay
    resultsDiv.hidden = true;
    void resultsDiv.offsetHeight;
    resultsDiv.hidden = false;

    renderBars(5);
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Render horizontal bar chart
  function renderBars(horizon) {
    const resultsDiv = document.getElementById('sim-results');
    const barsContainer = document.getElementById('sim-bars');
    const barData = resultsDiv._barData;
    if (!barData) return;

    const maxValue = Math.max(...barData.map(d => d.values[horizon]));

    let barsHTML = '';
    barData.forEach((d, i) => {
      const value = d.values[horizon];
      const gain = d.gains[horizon];
      const pct = (value / maxValue) * 100;
      const colorClass = i % 2 === 1 ? ' sim-bar-fill--alt' : '';

      barsHTML += '<div class="sim-bar-item">';
      barsHTML += '<div class="sim-bar-item-name">' + d.name + '</div>';
      barsHTML += '<div class="sim-bar-track">';
      barsHTML += '<div class="sim-bar-fill' + colorClass + '" style="width: 0%;" data-target-width="' + pct + '%">';
      barsHTML += '<span class="sim-bar-value">' + formatCurrency(value) + '</span>';
      barsHTML += '</div></div>';
      barsHTML += '<div class="sim-bar-gain">+' + formatCurrency(gain) + '</div>';
      barsHTML += '</div>';
    });

    barsContainer.innerHTML = barsHTML;

    // Animate bars
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        barsContainer.querySelectorAll('.sim-bar-fill').forEach(bar => {
          bar.style.width = bar.dataset.targetWidth;
        });
      });
    });
  }

  // Calculate button
  simCalculateBtn.addEventListener('click', renderResults);

  // Enter key in capital input
  document.getElementById('sim-capital').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && selectedFunds.size > 0) {
      renderResults();
    }
  });

  // Horizon switcher
  document.querySelectorAll('.sim-horizon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sim-horizon-btn').forEach(b =>
        b.classList.remove('sim-horizon-btn--active')
      );
      btn.classList.add('sim-horizon-btn--active');
      renderBars(parseInt(btn.dataset.horizon, 10));
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
