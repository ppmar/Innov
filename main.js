/* TransInvestment — JS (sobriete numerique) */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile Nav Hamburger ---- */
  const burger = document.getElementById('nav-burger');
  const navLinks = document.getElementById('nav-links');

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('nav-links--open');
      burger.classList.toggle('nav-burger--open', open);
      burger.setAttribute('aria-expanded', open);
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('nav-links--open');
        burger.classList.remove('nav-burger--open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

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
      isin: 'FR0011020943',
      fees: 0.0149,
      returns: { 1: 0.1264, 3: 0.1159, 5: 0.1106, 10: 0.0828 },
      esg: { msci: 'AA', morningstar: 4, sfdr: 8, score: 83 },
      riskLevel: 3, color: '#0b3d2c'
    },
    bnp: {
      name: 'BNP Paribas Green Bond',
      isin: 'FR0013233387',
      fees: 0.0121,
      returns: { 1: 0.0283, 3: 0.0386, 5: -0.0157, 10: null },
      esg: { msci: 'A', morningstar: 5, sfdr: 9, score: 86 },
      riskLevel: 1, color: '#2563eb'
    },
    lyxor: {
      name: 'Lyxor MSCI World ESG Leaders',
      isin: 'LU1792117779',
      fees: 0.0018,
      returns: { 1: 0.2250, 3: 0.1425, 5: 0.1280, 10: null },
      esg: { msci: 'AAA', morningstar: 4, sfdr: 8, score: 90 },
      riskLevel: 4, color: '#c4a265'
    },
    mirova: {
      name: 'Mirova Europe Env. Equity',
      isin: 'FR0010521503',
      fees: 0.0178,
      returns: { 1: 0.1659, 3: 0.0283, 5: 0.0166, 10: 0.0680 },
      esg: { msci: 'AAA', morningstar: 5, sfdr: 9, score: 100 },
      riskLevel: 3, color: '#14614a'
    },
    lbp: {
      name: 'La Banque Postale Multi Actions',
      isin: 'FR0010913916',
      fees: 0.0155,
      returns: { 1: 0.0474, 3: 0.1310, 5: 0.0968, 10: 0.0792 },
      esg: { msci: 'AA', morningstar: 4, sfdr: 9, score: 83 },
      riskLevel: 2, color: '#6d28d9'
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
      updateAllocationPreview();
    });
  });

  // Risk profile slider
  const riskSlider = document.getElementById('sim-risk-slider');
  const riskLabel = document.getElementById('sim-risk-label');
  const allocationPreview = document.getElementById('sim-allocation-preview');
  const RISK_LABELS = { 1: 'Prudent', 2: 'Modéré', 3: 'Équilibré', 4: 'Croissance', 5: 'Dynamique' };

  function getRiskValue() {
    return parseInt(riskSlider.value, 10);
  }

  function computeAllocations(fundKeys, riskValue) {
    if (fundKeys.length === 0) return {};
    // Normalize slider 1-5 to fund riskLevel scale
    const weights = {};
    let total = 0;
    fundKeys.forEach(key => {
      const fund = FUND_DATA[key];
      const distance = Math.abs(fund.riskLevel - riskValue);
      const w = Math.max(0.05, 1 - distance * 0.25);
      weights[key] = w;
      total += w;
    });
    // Normalize to percentages
    fundKeys.forEach(key => {
      weights[key] = weights[key] / total;
    });
    return weights;
  }

  function updateAllocationPreview() {
    if (!allocationPreview) return;
    const riskValue = getRiskValue();
    riskLabel.textContent = RISK_LABELS[riskValue];

    // Update slider fill
    const pct = ((riskValue - 1) / 4) * 100;
    riskSlider.style.setProperty('--fill', pct + '%');

    if (selectedFunds.size === 0) {
      allocationPreview.innerHTML = '<div class="alloc-empty">Sélectionnez des fonds pour voir la répartition</div>';
      return;
    }

    const keys = [...selectedFunds];
    const allocations = computeAllocations(keys, riskValue);

    // Stacked bar
    let barHTML = '<div class="alloc-stacked-bar">';
    keys.forEach(key => {
      const fund = FUND_DATA[key];
      const pct = (allocations[key] * 100).toFixed(1);
      barHTML += '<div class="alloc-segment" style="width:' + pct + '%;background:' + fund.color + '" title="' + fund.name + ' : ' + pct + '%"></div>';
    });
    barHTML += '</div>';

    // Legend
    barHTML += '<div class="alloc-legend">';
    keys.forEach(key => {
      const fund = FUND_DATA[key];
      const pct = (allocations[key] * 100).toFixed(0);
      barHTML += '<div class="alloc-legend-item">';
      barHTML += '<span class="alloc-legend-dot" style="background:' + fund.color + '"></span>';
      barHTML += '<span class="alloc-legend-name">' + fund.name + '</span>';
      barHTML += '<span class="alloc-legend-pct">' + pct + ' %</span>';
      barHTML += '</div>';
    });
    barHTML += '</div>';

    allocationPreview.innerHTML = barHTML;
  }

  if (riskSlider) {
    riskSlider.addEventListener('input', updateAllocationPreview);
    updateAllocationPreview();
  }

  // ESG score helpers
  function esgScoreLabel(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Très bon';
    if (score >= 60) return 'Bon';
    if (score >= 40) return 'Moyen';
    return 'Faible';
  }

  function esgScoreColor(score) {
    if (score >= 90) return 'var(--green)';
    if (score >= 75) return 'var(--green-light)';
    if (score >= 60) return 'var(--gold)';
    return 'var(--text-muted)';
  }

  function renderGlobes(count) {
    let html = '';
    for (let i = 0; i < 5; i++) {
      html += '<span class="esg-globe' + (i < count ? ' esg-globe--filled' : '') + '">\u25CF</span>';
    }
    return html;
  }

  // Render results table and bars
  function renderResults() {
    const capitalInput = document.getElementById('sim-capital');
    const totalCapital = parseFloat(capitalInput.value) || 0;
    if (totalCapital < 100 || selectedFunds.size === 0) return;

    const riskValue = getRiskValue();
    const keys = [...selectedFunds];
    const allocations = computeAllocations(keys, riskValue);

    const resultsDiv = document.getElementById('sim-results');
    const tbody = document.getElementById('sim-table-body');

    document.getElementById('sim-results-capital').textContent = formatCurrency(totalCapital);
    document.getElementById('sim-results-count').textContent = selectedFunds.size;

    // Update profile label in results subtitle
    const profileEl = document.getElementById('sim-results-profile');
    if (profileEl) profileEl.textContent = RISK_LABELS[riskValue];

    const horizons = [1, 3, 5, 10];
    let tableHTML = '';
    const barData = [];

    keys.forEach(key => {
      const fund = FUND_DATA[key];
      const fundCapital = totalCapital * allocations[key];
      const values = {};
      const gains = {};

      horizons.forEach(h => {
        const ret = fund.returns[h];
        if (ret !== null) {
          values[h] = calculateFutureValue(fundCapital, ret, fund.fees, h);
          gains[h] = values[h] - fundCapital;
        } else {
          values[h] = null;
          gains[h] = null;
        }
      });

      const allocPct = (allocations[key] * 100).toFixed(0);
      barData.push({ key, name: fund.name, values, gains, esg: fund.esg, allocPct, fundCapital });

      tableHTML += '<tr>';
      tableHTML += '<td class="sim-fund-name-cell">' + fund.name + ' <span class="sim-alloc-tag">' + allocPct + '%</span></td>';
      horizons.forEach(h => {
        if (values[h] !== null) {
          tableHTML += '<td>' + formatCurrency(values[h]) + '</td>';
        } else {
          tableHTML += '<td class="sim-na">N/A</td>';
        }
      });
      tableHTML += '<td class="sim-esg-cell"><span class="sim-esg-badge" style="--esg-color:' + esgScoreColor(fund.esg.score) + '">' + fund.esg.score + '/100</span></td>';
      tableHTML += '</tr>';

      tableHTML += '<tr class="sim-gain-row">';
      tableHTML += '<td><span class="sim-invested-tag">' + formatCurrency(fundCapital) + ' investis</span></td>';
      horizons.forEach(h => {
        if (gains[h] !== null) {
          const gainPct = gains[h] / fundCapital;
          const sign = gains[h] >= 0 ? '+' : '';
          const cls = gains[h] >= 0 ? 'sim-gain-positive' : 'sim-gain-negative';
          tableHTML += '<td class="' + cls + '">' + sign + formatCurrency(gains[h]) + ' (' + formatPercent(gainPct) + ')</td>';
        } else {
          tableHTML += '<td class="sim-na">—</td>';
        }
      });
      tableHTML += '<td></td>';
      tableHTML += '</tr>';
    });

    tbody.innerHTML = tableHTML;

    // Store data for horizon switching
    resultsDiv._barData = barData;
    resultsDiv._perFundCapital = perFundCapital;

    // Render ESG summary panel
    renderEsgPanel(barData);

    // Show results with animation replay
    resultsDiv.hidden = true;
    void resultsDiv.offsetHeight;
    resultsDiv.hidden = false;

    renderBars(5);
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Render ESG panel below bars
  function renderEsgPanel(barData) {
    const container = document.getElementById('sim-esg-panel');
    if (!container) return;

    // Weighted average ESG score based on allocation
    const riskValue = getRiskValue();
    const keys = barData.map(d => d.key);
    const allocs = computeAllocations(keys, riskValue);
    const avgScore = Math.round(barData.reduce((s, d) => s + d.esg.score * allocs[d.key], 0));

    let html = '<div class="esg-panel-header">';
    html += '<div class="esg-panel-score-ring" style="--esg-pct: ' + avgScore + '%; --esg-color: ' + esgScoreColor(avgScore) + '">';
    html += '<span class="esg-panel-score-value">' + avgScore + '</span>';
    html += '<span class="esg-panel-score-max">/100</span>';
    html += '</div>';
    html += '<div class="esg-panel-score-info">';
    html += '<div class="esg-panel-score-label">' + esgScoreLabel(avgScore) + '</div>';
    html += '<div class="esg-panel-score-desc">Score ESG moyen de votre portefeuille</div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="esg-panel-funds">';
    barData.forEach(d => {
      const e = d.esg;
      html += '<div class="esg-fund-row">';
      html += '<div class="esg-fund-name">' + d.name + '</div>';
      html += '<div class="esg-fund-details">';
      html += '<span class="esg-tag esg-tag--sfdr">Art. ' + e.sfdr + '</span>';
      html += '<span class="esg-tag esg-tag--msci">MSCI ' + e.msci + '</span>';
      html += '<span class="esg-globes">' + renderGlobes(e.morningstar) + '</span>';
      html += '<span class="esg-fund-score" style="color:' + esgScoreColor(e.score) + '">' + e.score + '/100</span>';
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';

    container.innerHTML = html;
  }

  // Render horizontal bar chart
  function renderBars(horizon) {
    const resultsDiv = document.getElementById('sim-results');
    const barsContainer = document.getElementById('sim-bars');
    const barData = resultsDiv._barData;
    if (!barData) return;

    const validValues = barData.filter(d => d.values[horizon] !== null).map(d => d.values[horizon]);
    const maxValue = validValues.length > 0 ? Math.max(...validValues) : 1;

    let barsHTML = '';
    barData.forEach((d, i) => {
      const value = d.values[horizon];
      const gain = d.gains[horizon];
      const colorClass = i % 2 === 1 ? ' sim-bar-fill--alt' : '';

      barsHTML += '<div class="sim-bar-item">';
      barsHTML += '<div class="sim-bar-item-name">' + d.name + '</div>';

      if (value !== null) {
        const pct = (value / maxValue) * 100;
        const sign = gain >= 0 ? '+' : '';
        const gainClass = gain >= 0 ? 'sim-bar-gain' : 'sim-bar-gain sim-bar-gain--negative';
        barsHTML += '<div class="sim-bar-track">';
        barsHTML += '<div class="sim-bar-fill' + colorClass + '" style="width: 0%;" data-target-width="' + pct + '%">';
        barsHTML += '<span class="sim-bar-value">' + formatCurrency(value) + '</span>';
        barsHTML += '</div></div>';
        barsHTML += '<div class="' + gainClass + '">' + sign + formatCurrency(gain) + '</div>';
      } else {
        barsHTML += '<div class="sim-bar-track">';
        barsHTML += '<div class="sim-bar-fill sim-bar-fill--na" style="width: 0%;" data-target-width="15%">';
        barsHTML += '<span class="sim-bar-value">N/A</span>';
        barsHTML += '</div></div>';
        barsHTML += '<div class="sim-bar-gain sim-bar-gain--na">Données non disponibles</div>';
      }

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
