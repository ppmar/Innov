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
  const heroPhoto = document.getElementById('hero-photo');
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

        // Hero photo — parallax + fade-out as user scrolls
        if (heroPhoto) {
          const heroH = heroPhoto.parentElement.offsetHeight || 800;
          const progress = Math.min(scrollY / heroH, 1); // 0 → 1 over hero height
          const photoY = scrollY * 0.15; // slower than heroBg for layered depth
          const opacity = 1 - progress * 1.3; // fade out faster than scroll
          const scale = 1.1 - progress * 0.05; // subtle zoom-out
          heroPhoto.style.transform = `translateY(${photoY}px) scale(${scale})`;
          heroPhoto.style.opacity = Math.max(0, opacity);
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

  // Set base transforms for parallax cards
  const backCard = document.querySelector('.hero-card--back');
  if (backCard) backCard.dataset.parallaxBase = 'rotate(4deg) scale(0.93)';
  const thirdCard = document.querySelector('.hero-card--third');
  if (thirdCard) thirdCard.dataset.parallaxBase = 'rotate(-3deg) scale(0.88)';

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
    },
    amundi_world: {
      name: 'Amundi MSCI World UCITS ETF',
      isin: 'LU1681043599',
      fees: 0.0038,
      returns: { 1: 0.2310, 3: 0.1485, 5: 0.1315, 10: 0.1140 },
      esg: { msci: 'BBB', morningstar: 3, sfdr: 6, score: 48 },
      riskLevel: 4, color: '#3b82f6'
    },
    fidelity: {
      name: 'Fidelity World Fund',
      isin: 'LU0115773425',
      fees: 0.0264,
      returns: { 1: 0.2045, 3: 0.1320, 5: 0.1210, 10: 0.1085 },
      esg: { msci: 'BBB', morningstar: 3, sfdr: 6, score: 43 },
      riskLevel: 4, color: '#06b6d4'
    },
    jpmorgan_tech: {
      name: 'JPMorgan US Technology Fund',
      isin: 'LU0159052710',
      fees: 0.0170,
      returns: { 1: 0.3815, 3: 0.1840, 5: 0.1690, 10: 0.2130 },
      esg: { msci: 'BB', morningstar: 2, sfdr: 6, score: 30 },
      riskLevel: 5, color: '#f59e0b'
    },
    magellan: {
      name: 'Magellan (Comgest)',
      isin: 'FR0000292278',
      fees: 0.0198,
      returns: { 1: 0.0890, 3: 0.0145, 5: -0.0080, 10: 0.0415 },
      esg: { msci: 'BBB', morningstar: 3, sfdr: 6, score: 43 },
      riskLevel: 4, color: '#e11d48'
    },
    carmignac: {
      name: 'Carmignac Patrimoine',
      isin: 'FR0010135103',
      fees: 0.0150,
      returns: { 1: 0.0725, 3: 0.0410, 5: 0.0285, 10: 0.0215 },
      esg: { msci: 'A', morningstar: 3, sfdr: 6, score: 53 },
      riskLevel: 2, color: '#8b5cf6'
    },
    ishares_sp500: {
      name: 'iShares Core S&P 500 ETF',
      isin: 'IE00B5BMR087',
      fees: 0.0007,
      returns: { 1: 0.2580, 3: 0.1610, 5: 0.1495, 10: 0.1380 },
      esg: { msci: 'A', morningstar: 3, sfdr: 6, score: 53 },
      riskLevel: 4, color: '#10b981'
    },
    franklin_tech: {
      name: 'Franklin Technology Fund',
      isin: 'LU0109392836',
      fees: 0.0181,
      returns: { 1: 0.3560, 3: 0.1590, 5: 0.1420, 10: 0.1945 },
      esg: { msci: 'BB', morningstar: 2, sfdr: 6, score: 30 },
      riskLevel: 5, color: '#ec4899'
    },
    pictet: {
      name: 'Pictet Global Megatrend Selection',
      isin: 'LU0386882277',
      fees: 0.0201,
      returns: { 1: 0.1870, 3: 0.0985, 5: 0.0890, 10: 0.0935 },
      esg: { msci: 'A', morningstar: 3, sfdr: 6, score: 53 },
      riskLevel: 4, color: '#a855f7'
    },
    blackrock_energy: {
      name: 'BlackRock World Energy Fund',
      isin: 'LU0122376428',
      fees: 0.0205,
      returns: { 1: 0.0540, 3: 0.1260, 5: 0.1815, 10: 0.0390 },
      esg: { msci: 'B', morningstar: 1, sfdr: 6, score: 13 },
      riskLevel: 5, color: '#78716c'
    },
    oddo: {
      name: 'Oddo BHF Avenir Europe',
      isin: 'FR0000989899',
      fees: 0.0175,
      returns: { 1: 0.1430, 3: 0.0765, 5: 0.0810, 10: 0.0925 },
      esg: { msci: 'BBB', morningstar: 3, sfdr: 6, score: 43 },
      riskLevel: 3, color: '#0ea5e9'
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
    if (score >= 90) return 'var(--accent)';
    if (score >= 75) return 'var(--accent-dim)';
    if (score >= 60) return 'var(--gold)';
    return 'var(--text-tertiary)';
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

    // Render pie chart
    renderPieChart(barData);

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

  // Render pie chart for allocation
  function renderPieChart(barData) {
    const svg = document.getElementById('pie-chart');
    const legend = document.getElementById('pie-legend');
    const centerValue = document.getElementById('pie-center-value');
    if (!svg || !legend) return;

    centerValue.textContent = barData.length;

    const cx = 100, cy = 100, r = 85;
    const gap = 0.008; // gap between slices in radians
    let svgHTML = '';
    let legendHTML = '';
    let cumAngle = -Math.PI / 2; // start at top

    // Sort by allocation descending for better visual
    const sorted = [...barData].sort((a, b) => b.alloc - a.alloc);

    sorted.forEach((d, i) => {
      const fund = FUND_DATA[d.key];
      const color = fund.color;
      const sliceAngle = d.alloc * Math.PI * 2;

      // Skip tiny slices
      if (sliceAngle < 0.01) return;

      const startAngle = cumAngle + gap / 2;
      const endAngle = cumAngle + sliceAngle - gap / 2;

      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;

      const pathData = [
        'M', cx, cy,
        'L', x1.toFixed(2), y1.toFixed(2),
        'A', r, r, 0, largeArc, 1, x2.toFixed(2), y2.toFixed(2),
        'Z'
      ].join(' ');

      svgHTML += '<path d="' + pathData + '" fill="' + color + '" class="pie-slice" data-idx="' + i + '" style="--delay: ' + (i * 0.05) + 's" />';

      cumAngle += sliceAngle;

      legendHTML += '<div class="pie-legend-item" data-idx="' + i + '">';
      legendHTML += '<span class="pie-legend-dot" style="background: ' + color + '"></span>';
      legendHTML += '<span class="pie-legend-name">' + d.name + '</span>';
      legendHTML += '<span class="pie-legend-pct">' + d.allocPct + '%</span>';
      legendHTML += '<span class="pie-legend-amount">' + formatCurrency(d.fundCapital) + '</span>';
      legendHTML += '</div>';
    });

    svg.innerHTML = svgHTML;
    legend.innerHTML = legendHTML;

    // Animate slices in
    requestAnimationFrame(() => {
      svg.querySelectorAll('.pie-slice').forEach(slice => {
        slice.classList.add('pie-slice--visible');
      });
    });

    // Hover interactivity
    svg.querySelectorAll('.pie-slice').forEach(slice => {
      slice.addEventListener('mouseenter', () => {
        const idx = slice.dataset.idx;
        svg.querySelectorAll('.pie-slice').forEach(s => {
          s.style.opacity = s.dataset.idx === idx ? '1' : '0.35';
        });
        legend.querySelectorAll('.pie-legend-item').forEach(item => {
          item.style.opacity = item.dataset.idx === idx ? '1' : '0.35';
        });
      });
      slice.addEventListener('mouseleave', () => {
        svg.querySelectorAll('.pie-slice').forEach(s => { s.style.opacity = ''; });
        legend.querySelectorAll('.pie-legend-item').forEach(item => { item.style.opacity = ''; });
      });
    });

    legend.querySelectorAll('.pie-legend-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        const idx = item.dataset.idx;
        svg.querySelectorAll('.pie-slice').forEach(s => {
          s.style.opacity = s.dataset.idx === idx ? '1' : '0.35';
        });
        legend.querySelectorAll('.pie-legend-item').forEach(li => {
          li.style.opacity = li.dataset.idx === idx ? '1' : '0.35';
        });
      });
      item.addEventListener('mouseleave', () => {
        svg.querySelectorAll('.pie-slice').forEach(s => { s.style.opacity = ''; });
        legend.querySelectorAll('.pie-legend-item').forEach(li => { li.style.opacity = ''; });
      });
    });
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


  /* ---- Hero Rotating Words ---- */
  const rotatingWords = document.querySelectorAll('.hero-rotating-word');
  if (rotatingWords.length > 1) {
    let currentWord = 0;
    let rotateTimer = null;

    function rotateWord() {
      const prev = rotatingWords[currentWord];
      prev.classList.remove('hero-rotating-word--active');
      prev.classList.add('hero-rotating-word--exit');

      currentWord = (currentWord + 1) % rotatingWords.length;
      const next = rotatingWords[currentWord];

      next.classList.remove('hero-rotating-word--exit');
      next.style.transition = 'none';
      next.style.transform = 'translateX(-50%) translateY(80px)';
      next.style.opacity = '0';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          next.style.transition = '';
          next.classList.add('hero-rotating-word--active');
          next.style.transform = '';
          next.style.opacity = '';
        });
      });

      setTimeout(() => {
        prev.classList.remove('hero-rotating-word--exit');
      }, 500);

      rotateTimer = setTimeout(rotateWord, 2000);
    }

    rotateTimer = setTimeout(rotateWord, 2000);

    // Pause when tab hidden, resume when visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearTimeout(rotateTimer);
        rotateTimer = null;
      } else {
        if (!rotateTimer) {
          rotateTimer = setTimeout(rotateWord, 1000);
        }
      }
    });
  }


  /* ---- Glowing Effect (mouse-tracking border glow) ---- */
  const glowWraps = document.querySelectorAll('.feature-glow-wrap');
  if (glowWraps.length) {
    glowWraps.forEach(wrap => {
      const border = wrap.querySelector('.glow-border');
      if (!border) return;

      let rafId = 0;
      const proximity = 64;
      const inactiveZone = 0.01;

      function handlePointerMove(e) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const rect = border.getBoundingClientRect();
          const cx = rect.left + rect.width * 0.5;
          const cy = rect.top + rect.height * 0.5;
          const mx = e.clientX;
          const my = e.clientY;

          // Inactive zone
          const dist = Math.hypot(mx - cx, my - cy);
          const inactiveR = 0.5 * Math.min(rect.width, rect.height) * inactiveZone;
          if (dist < inactiveR) {
            border.style.setProperty('--glow-active', '0');
            border.classList.remove('glow-active');
            return;
          }

          // Proximity check
          const isNear = mx > rect.left - proximity
            && mx < rect.right + proximity
            && my > rect.top - proximity
            && my < rect.bottom + proximity;

          if (isNear) {
            border.classList.add('glow-active');
            border.style.setProperty('--glow-active', '1');
            // Angle from center to mouse
            const angle = (180 * Math.atan2(my - cy, mx - cx)) / Math.PI + 90;
            border.style.setProperty('--glow-start', String(angle));
          } else {
            border.style.setProperty('--glow-active', '0');
            border.classList.remove('glow-active');
          }
        });
      }

      document.body.addEventListener('pointermove', handlePointerMove, { passive: true });
    });
  }


  /* ---- Section Sparkles (La plateforme) ---- */
  (function initSectionSparkles() {
    const canvas = document.getElementById('outil-sparkles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId = null;

    function resize() {
      const section = canvas.parentElement;
      canvas.width = section.offsetWidth;
      canvas.height = section.offsetHeight;
      const target = Math.min(200, Math.floor(canvas.width * canvas.height / 3000));
      while (particles.length < target) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random(),
          fadeSpeed: 0.004 + Math.random() * 0.012,
          fadeDir: 1
        });
      }
    }

    function draw() {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.fadeSpeed * p.fadeDir;
        if (p.opacity >= 1) { p.opacity = 1; p.fadeDir = -1; }
        if (p.opacity <= 0.05) { p.opacity = 0.05; p.fadeDir = 1; }
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + p.opacity * 0.6 + ')';
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          resize();
          if (!animId) draw();
        } else {
          if (animId) { cancelAnimationFrame(animId); animId = null; }
        }
      });
    }, { threshold: 0.05 });
    obs.observe(canvas.parentElement);
    window.addEventListener('resize', resize);
  })();


  /* ---- Scroll Expansion + Sparkles ---- */
  const expandScroll = document.getElementById('expand-scroll');
  const expandViewport = document.getElementById('expand-viewport');
  const expandContent = document.getElementById('expand-content');
  const sparklesCanvas = document.getElementById('sparkles-canvas');

  if (expandScroll && expandViewport && sparklesCanvas) {
    const ctx = sparklesCanvas.getContext('2d');
    let particles = [];
    let sparklesAnimId = null;
    let lastCanvasW = 0;
    let lastCanvasH = 0;

    function resizeSparkles() {
      const w = expandViewport.offsetWidth;
      const h = expandViewport.offsetHeight;
      if (w > 0 && h > 0 && (w !== lastCanvasW || h !== lastCanvasH)) {
        // Scale existing particles proportionally to new dimensions
        if (lastCanvasW > 0 && lastCanvasH > 0) {
          const scaleX = w / lastCanvasW;
          const scaleY = h / lastCanvasH;
          particles.forEach(p => {
            p.x *= scaleX;
            p.y *= scaleY;
          });
        }
        sparklesCanvas.width = w;
        sparklesCanvas.height = h;
        lastCanvasW = w;
        lastCanvasH = h;
        // Add particles for new area
        const targetDensity = Math.min(300, Math.floor(w * h / 1800));
        while (particles.length < targetDensity) {
          particles.push(createParticle(w, h));
        }
      }
    }

    function createParticle(w, h) {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random(),
        fadeSpeed: 0.005 + Math.random() * 0.015,
        fadeDir: 1
      };
    }

    function drawSparkles() {
      const w = sparklesCanvas.width;
      const h = sparklesCanvas.height;
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.fadeSpeed * p.fadeDir;
        if (p.opacity >= 1) { p.opacity = 1; p.fadeDir = -1; }
        if (p.opacity <= 0.05) { p.opacity = 0.05; p.fadeDir = 1; }
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + p.opacity + ')';
        ctx.fill();
      });
      sparklesAnimId = requestAnimationFrame(drawSparkles);
    }

    const isMobile = () => window.innerWidth <= 768;

    // Drive expansion from scroll position (desktop only)
    function updateExpansion() {
      if (isMobile()) return;

      const rect = expandScroll.getBoundingClientRect();
      const scrollRange = expandScroll.offsetHeight - window.innerHeight;
      const progress = Math.min(Math.max(-rect.top / scrollRange, 0), 1);

      // Use actual window pixel dimensions for full coverage
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const startW = vw * 0.4;
      const startH = vh * 0.45;
      const w = startW + progress * (vw - startW);
      const h = startH + progress * (vh - startH);
      const radius = 24 * (1 - progress);

      expandViewport.style.width = w + 'px';
      expandViewport.style.height = h + 'px';
      expandViewport.style.borderRadius = radius + 'px';
      // Fade soft edge as it approaches fullscreen
      expandViewport.style.setProperty('--expand-edge-opacity', Math.max(0, 1 - progress * 1.5));

      // Show content after 40% expansion
      if (progress > 0.4) {
        expandContent.classList.add('expand-content--visible');
      } else {
        expandContent.classList.remove('expand-content--visible');
      }

      // Resize sparkles canvas to match
      resizeSparkles();
    }

    // Start sparkles when in view
    const expandObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          particles = [];
          resizeSparkles();
          if (!sparklesAnimId) drawSparkles();
        } else {
          if (sparklesAnimId) {
            cancelAnimationFrame(sparklesAnimId);
            sparklesAnimId = null;
          }
        }
      });
    }, { threshold: 0.05 });

    expandObserver.observe(expandScroll);

    window.addEventListener('scroll', updateExpansion, { passive: true });
    window.addEventListener('resize', () => {
      if (isMobile()) {
        // Clear inline styles so CSS takes over
        expandViewport.style.width = '';
        expandViewport.style.height = '';
        expandViewport.style.borderRadius = '';
      }
      resizeSparkles();
      updateExpansion();
    });
    if (!isMobile()) updateExpansion();
  }


  /* ---- Nav shadow on scroll ---- */
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      nav.style.boxShadow = '0 1px 8px rgba(0,0,0,0.06)';
    } else {
      nav.style.boxShadow = 'none';
    }
  }, { passive: true });


  /* ---- Methodology Tabs ---- */
  const methodTabs = document.querySelectorAll('.method-tab');
  const methodPanels = document.querySelectorAll('.method-panel');
  const methodIndicator = document.querySelector('.method-tab-indicator');

  function activateMethodTab(tab) {
    const target = tab.dataset.tab;

    methodTabs.forEach(t => t.classList.remove('method-tab--active'));
    tab.classList.add('method-tab--active');

    methodPanels.forEach(p => {
      p.classList.toggle('method-panel--active', p.dataset.panel === target);
    });

    // Slide indicator under active tab
    if (methodIndicator) {
      methodIndicator.style.width = tab.offsetWidth + 'px';
      methodIndicator.style.left = tab.offsetLeft + 'px';
    }
  }

  methodTabs.forEach(tab => {
    tab.addEventListener('click', () => activateMethodTab(tab));
  });

  // Initialize indicator position
  const activeMethodTab = document.querySelector('.method-tab--active');
  if (activeMethodTab && methodIndicator) {
    methodIndicator.style.width = activeMethodTab.offsetWidth + 'px';
    methodIndicator.style.left = activeMethodTab.offsetLeft + 'px';
  }


  /* ---- Fund Filter Buttons ---- */
  const filterBtns = document.querySelectorAll('.fund-filter-btn');
  const fundCards = document.querySelectorAll('.fund-card[data-category]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('fund-filter-btn--active'));
      btn.classList.add('fund-filter-btn--active');

      const filter = btn.dataset.filter;

      fundCards.forEach(card => {
        if (filter === 'all' || card.dataset.category.includes(filter)) {
          card.style.display = '';
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });


  /* ---- Scroll Reveal — IntersectionObserver ---- */
  const revealElements = document.querySelectorAll('.fade-in-up, .scale-reveal, .slide-in-left, .slide-in-right');
  const drawElements = document.querySelectorAll('.draw-on-scroll');

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  if (drawElements.length > 0) {
    const drawObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          drawObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    drawElements.forEach(el => drawObserver.observe(el));
  }

});
