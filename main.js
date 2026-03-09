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

  // ---- Quiz data ----
  const QUESTIONS = [
    { q: 'Quel est votre horizon d\'investissement ?', options: [
      { label: 'Moins de 2 ans', r: 1, e: 0 },
      { label: '2 à 5 ans', r: 2, e: 0 },
      { label: '5 à 10 ans', r: 3, e: 0 },
      { label: 'Plus de 10 ans', r: 4, e: 0 }
    ]},
    { q: 'Quel est votre objectif principal ?', options: [
      { label: 'Préserver mon capital', r: 1, e: 0 },
      { label: 'Obtenir des revenus réguliers', r: 2, e: 0 },
      { label: 'Faire croître mon capital', r: 3, e: 0 },
      { label: 'Maximiser l\'impact environnemental', r: 2, e: 3 }
    ]},
    { q: 'Si votre portefeuille perdait 15 % en un mois, que feriez-vous ?', options: [
      { label: 'Je vends tout immédiatement', r: 1, e: 0 },
      { label: 'J\'attends que ça remonte', r: 2, e: 0 },
      { label: 'Je ne change rien à ma stratégie', r: 3, e: 0 },
      { label: 'J\'investis davantage pour profiter de la baisse', r: 4, e: 0 }
    ]},
    { q: 'Quelle part de votre épargne totale représente cet investissement ?', options: [
      { label: 'Plus de 50 %', r: 1, e: 0 },
      { label: 'Entre 25 % et 50 %', r: 2, e: 0 },
      { label: 'Entre 10 % et 25 %', r: 3, e: 0 },
      { label: 'Moins de 10 %', r: 4, e: 0 }
    ]},
    { q: 'Quelle est votre expérience en investissement ?', options: [
      { label: 'Aucune expérience', r: 1, e: 0 },
      { label: 'Livrets d\'épargne ou fonds euros', r: 2, e: 0 },
      { label: 'Actions ou ETF', r: 3, e: 0 },
      { label: 'Portefeuille diversifié (actions, obligations, immobilier...)', r: 4, e: 0 }
    ]},
    { q: 'Quelle importance accordez-vous aux critères environnementaux, sociaux et de gouvernance (ESG) ?', options: [
      { label: 'Aucune importance particulière', r: 0, e: 0 },
      { label: 'C\'est un plus, mais pas décisif', r: 0, e: 1 },
      { label: 'C\'est un critère important dans mes choix', r: 0, e: 2 },
      { label: 'C\'est prioritaire, même si le rendement est moindre', r: 0, e: 3 }
    ]},
    { q: 'Souhaitez-vous exclure les investissements liés aux énergies fossiles ?', options: [
      { label: 'Non, pas nécessairement', r: 0, e: 0 },
      { label: 'De préférence oui', r: 0, e: 1 },
      { label: 'Oui, absolument', r: 0, e: 2 }
    ]},
    { q: 'Préférez-vous investir en Europe ou diversifier mondialement ?', options: [
      { label: 'Europe uniquement', r: 2, e: 1 },
      { label: 'Principalement en Europe', r: 2, e: 0 },
      { label: 'Diversification mondiale', r: 3, e: 0 }
    ]},
    { q: 'Avez-vous besoin de pouvoir retirer votre argent facilement ?', options: [
      { label: 'Oui, je dois pouvoir retirer à tout moment', r: 1, e: 0 },
      { label: 'Dans les 6 mois si besoin', r: 2, e: 0 },
      { label: 'Non, c\'est un placement long terme', r: 3, e: 0 }
    ]},
    { q: 'Quel type d\'impact durable vous parle le plus ?', options: [
      { label: 'Bonne gouvernance des entreprises', r: 0, e: 1 },
      { label: 'Transition énergétique et climat', r: 0, e: 2 },
      { label: 'Impact social et solidaire', r: 0, e: 1 },
      { label: 'Tous ces aspects à la fois', r: 0, e: 2 }
    ]}
  ];

  const RISK_LABELS = { 1: 'Prudent', 2: 'Modéré', 3: 'Équilibré', 4: 'Croissance', 5: 'Dynamique' };

  // ---- Quiz state ----
  let quizStep = 0;
  const quizAnswers = new Array(QUESTIONS.length).fill(null);

  const quizEl = document.getElementById('quiz');
  const quizQuestion = document.getElementById('quiz-question');
  const quizOptions = document.getElementById('quiz-options');
  const quizCounter = document.getElementById('quiz-counter');
  const quizProgressBar = document.getElementById('quiz-progress-bar');
  const quizPrev = document.getElementById('quiz-prev');
  const quizNext = document.getElementById('quiz-next');

  function renderQuiz() {
    const q = QUESTIONS[quizStep];
    const isLast = quizStep === QUESTIONS.length - 1;

    quizCounter.textContent = 'Question ' + (quizStep + 1) + ' / ' + QUESTIONS.length;
    quizProgressBar.style.width = ((quizStep + 1) / QUESTIONS.length * 100) + '%';
    quizQuestion.textContent = q.q;

    let html = '';
    q.options.forEach((opt, i) => {
      const selected = quizAnswers[quizStep] === i;
      html += '<button class="quiz-option' + (selected ? ' quiz-option--selected' : '') + '" data-idx="' + i + '">';
      html += '<span class="quiz-option-radio"></span>';
      html += '<span class="quiz-option-label">' + opt.label + '</span>';
      html += '</button>';
    });
    quizOptions.innerHTML = html;

    // Bind option clicks
    quizOptions.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        quizAnswers[quizStep] = parseInt(btn.dataset.idx, 10);
        renderQuiz();
        // Auto-advance after short delay
        setTimeout(() => {
          if (isLast) {
            finishQuiz();
          } else {
            quizStep++;
            renderQuiz();
          }
        }, 300);
      });
    });

    quizPrev.disabled = quizStep === 0;
    quizNext.disabled = quizAnswers[quizStep] === null;
    quizNext.innerHTML = isLast
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Voir mon portefeuille'
      : 'Suivant <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';
  }

  function computeProfile() {
    let totalR = 0, totalE = 0, maxR = 0, maxE = 0;
    QUESTIONS.forEach((q, i) => {
      const ans = quizAnswers[i];
      if (ans !== null) {
        totalR += q.options[ans].r;
        totalE += q.options[ans].e;
      }
      maxR += Math.max(...q.options.map(o => o.r));
      maxE += Math.max(...q.options.map(o => o.e));
    });
    // Normalize to 1-5
    const riskProfile = Math.max(1, Math.min(5, Math.round(1 + (totalR / maxR) * 4)));
    const esgPriority = maxE > 0 ? Math.max(1, Math.min(5, Math.round(1 + (totalE / maxE) * 4))) : 1;
    return { riskProfile, esgPriority };
  }

  function computeAllocations(riskProfile, esgPriority) {
    const keys = Object.keys(FUND_DATA);
    const weights = {};
    let total = 0;
    keys.forEach(key => {
      const fund = FUND_DATA[key];
      const riskW = Math.max(0.05, 1 - Math.abs(fund.riskLevel - riskProfile) * 0.25);
      const esgW = (fund.esg.score / 100) * (esgPriority / 5);
      const w = riskW + esgW * 0.5;
      weights[key] = w;
      total += w;
    });
    // Normalize, enforce min 3%
    let sum2 = 0;
    keys.forEach(key => {
      weights[key] = Math.max(0.03, weights[key] / total);
      sum2 += weights[key];
    });
    keys.forEach(key => { weights[key] /= sum2; });
    return weights;
  }

  function finishQuiz() {
    const profile = computeProfile();
    const allocations = computeAllocations(profile.riskProfile, profile.esgPriority);
    quizEl.style.display = 'none';
    renderResultsFromQuiz(profile, allocations);
  }

  // Nav buttons
  if (quizPrev) {
    quizPrev.addEventListener('click', () => {
      if (quizStep > 0) { quizStep--; renderQuiz(); }
    });
  }
  if (quizNext) {
    quizNext.addEventListener('click', () => {
      if (quizAnswers[quizStep] === null) return;
      if (quizStep < QUESTIONS.length - 1) { quizStep++; renderQuiz(); }
      else { finishQuiz(); }
    });
  }

  if (quizEl) renderQuiz();

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

  // Render results from quiz profile
  function renderResultsFromQuiz(profile, allocations) {
    const capitalInput = document.getElementById('sim-capital');
    const totalCapital = parseFloat(capitalInput.value) || 10000;

    const keys = Object.keys(FUND_DATA);
    const resultsDiv = document.getElementById('sim-results');
    const tbody = document.getElementById('sim-table-body');

    document.getElementById('sim-results-capital').textContent = formatCurrency(totalCapital);
    document.getElementById('sim-results-count').textContent = keys.length;

    const profileEl = document.getElementById('sim-results-profile');
    if (profileEl) profileEl.textContent = RISK_LABELS[profile.riskProfile];

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
      barData.push({ key, name: fund.name, values, gains, esg: fund.esg, allocPct, fundCapital, alloc: allocations[key] });

      tableHTML += '<tr>';
      tableHTML += '<td class="sim-fund-name-cell">' + fund.name + ' <span class="sim-alloc-tag">' + allocPct + ' %</span></td>';
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

    // Render ESG summary panel
    renderEsgPanel(barData);

    // Show results with animation replay
    resultsDiv.hidden = true;
    void resultsDiv.offsetHeight;
    resultsDiv.hidden = false;

    renderBars(5);

    // Add restart button if not already present
    if (!resultsDiv.querySelector('.quiz-restart-btn')) {
      const restartBtn = document.createElement('button');
      restartBtn.className = 'btn btn-secondary quiz-restart-btn';
      restartBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg> Refaire le questionnaire';
      restartBtn.addEventListener('click', () => {
        quizStep = 0;
        quizAnswers.fill(null);
        resultsDiv.hidden = true;
        quizEl.style.display = '';
        renderQuiz();
        quizEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      resultsDiv.appendChild(restartBtn);
    }

    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Render ESG panel below bars
  function renderEsgPanel(barData) {
    const container = document.getElementById('sim-esg-panel');
    if (!container) return;

    // Weighted average ESG score based on allocation
    const avgScore = Math.round(barData.reduce((s, d) => s + d.esg.score * d.alloc, 0));

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
