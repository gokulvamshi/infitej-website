import { LiquidWorld } from './liquid-world.js';
import { SmoothScroll } from './smooth-scroll.js';

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 1. MASTER LIQUID DISPLAY & 3D WEBGL ENGINE
  // ==========================================================================
  let world = null;
  try {
    world = new LiquidWorld('webgl-canvas');
  } catch (err) {
    console.error('Liquid WebGL initialization error:', err);
  }

  // ==========================================================================
  // 2. LUXURIOUS SLOW-MOTION INERTIAL SCROLL CONTROLLER
  // ==========================================================================
  let scroller = null;
  try {
    scroller = new SmoothScroll({ damping: 0.125 });
  } catch (err) {
    console.error('SmoothScroll initialization error:', err);
  }

  // ==========================================================================
  // 3. FLOATING HEADER & LIVE HUB CLOCK
  // ==========================================================================
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  const clockEl = document.getElementById('live-hub-time');
  function updateHubClock() {
    if (!clockEl) return;
    const now = new Date();
    const utcHours = String(now.getUTCHours()).padStart(2, '0');
    const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
    const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');
    clockEl.textContent = `${utcHours}:${utcMinutes}:${utcSeconds} UTC`;
  }
  updateHubClock();
  setInterval(updateHubClock, 1000);

  // Mobile navigation toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
  const headerNav = document.querySelector('.header-nav');
  mobileMenuBtn?.addEventListener('click', () => {
    headerNav?.classList.toggle('mobile-active');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      headerNav?.classList.remove('mobile-active');
    });
  });

  // ==========================================================================
  // 4. AUTONOMOUS AI TESTING LAB SIMULATION
  // ==========================================================================
  const terminal = document.getElementById('lab-terminal-output');
  function logTerminal(tag, message, isSuccess = false) {
    if (!terminal) return;
    const time = new Date().toISOString().substring(11, 19);
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = `<span class="terminal-tag">[${tag}]</span> ${time} ${isSuccess ? '<span class="terminal-success">' + message + '</span>' : message}`;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
  }

  const labModeBtns = document.querySelectorAll('.lab-mode-btn');
  labModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      labModeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;

      if (mode === 'mode1') {
        logTerminal('SPEC-INGEST', 'Parsing user stories, API contracts & Figma design schemas...');
        setTimeout(() => logTerminal('SYNTHESIS', 'Generated 24 automated test specs covering all primary user journeys.', true), 400);
      } else if (mode === 'mode2') {
        logTerminal('CROSS-PLATFORM', 'Executing visual passes & network assertions across 2,000+ real browser and mobile environments...');
        setTimeout(() => logTerminal('VERIFIED', 'Cross-browser rendering verified. 0 layout regression faults.', true), 500);
      } else if (mode === 'mode3') {
        logTerminal('SELECTOR-CHURN', 'Frontend redesign detected: 14 button element locators altered in DOM hierarchy.');
        setTimeout(() => {
          logTerminal('SELF-HEAL', 'AI healing engine re-routed broken selectors in 0.65s via Computer Vision & DOM relational graphs. 0 test failures.', true);
        }, 700);
      }
    });
  });

  // 5-Layer Stack Accordion
  const layerCards = document.querySelectorAll('.stack-layer-card');
  layerCards.forEach(card => {
    const header = card.querySelector('.stack-layer-header');
    header?.addEventListener('click', () => {
      const wasActive = card.classList.contains('active');
      layerCards.forEach(c => c.classList.remove('active'));
      if (!wasActive) card.classList.add('active');
    });
  });

  // ==========================================================================
  // 5. CONCENTRIC QUALITY ECOSYSTEM
  // ==========================================================================
  const concentricData = [
    {
      ring: 'Ring I',
      title: 'Product Clarity & User Journey Mapping',
      desc: 'Quality begins before code is written. We establish clear acceptance criteria, edge-case definitions, and measurable business KPIs with product stakeholders.',
      specs: [
        'User story acceptance criteria validation & ambiguity scoring',
        'Direct alignment with Product Managers & Domain Experts',
        'Measurable business KPI impact projection for automated test suites'
      ]
    },
    {
      ring: 'Ring II',
      title: 'Code Integrity & Shift-Left Architecture',
      desc: 'Structural design inspection, commit-time unit testing, and modular decoupling to catch architecture flaws before they turn into technical debt.',
      specs: [
        'Static checklists and code inspection applied prior to sprint execution',
        'Microservice decoupling and API contract validation',
        'Security threat modeling & architectural debt containment'
      ]
    },
    {
      ring: 'Ring III',
      title: 'Autonomous Testing & Device Cloud',
      desc: 'Goal-driven AI testing agents executing parallel regression suites across real desktop, iOS, Android, and OTT streaming platforms.',
      specs: [
        'Computer Vision & DOM relational graph self-healing locators',
        'Zero-maintenance parallel test execution across cloud farms',
        'Continuous regression feedback delivered to development teams'
      ]
    },
    {
      ring: 'Ring IV',
      title: 'DevOps & CI/CD Automated Release Gates',
      desc: 'Automated build gating and shift-left quality verification integrated into GitHub Actions, GitLab CI, Jenkins, and Azure DevOps.',
      specs: [
        'Pre-commit predictive AI diff analysis to eliminate flaky tests',
        'Zero-defect release gating with automated rollback triggers',
        'Unified telemetry dashboards bridging APM, logs, and test results'
      ]
    },
    {
      ring: 'Ring V',
      title: 'Engineering Leadership & Quality Culture',
      desc: 'Senior CTO Advisory, Product Owner coaching, and engineering leadership to build autonomous, high-velocity software teams.',
      specs: [
        'Strategic roadmapping for CI/CD test modernization',
        'Defect prevention training for full-stack development teams',
        'Executive failure pattern analytics and delivery forecasting'
      ]
    }
  ];

  const ringPills = document.querySelectorAll('.ring-select-pill');
  const concTitle = document.getElementById('concentric-active-title');
  const concDesc = document.getElementById('concentric-active-desc');
  const concSpecs = document.getElementById('concentric-specs-list');
  const svgRings = document.querySelectorAll('.concentric-ring');

  function updateConcentricView(index) {
    const data = concentricData[index];
    if (!data) return;

    ringPills.forEach((p, i) => p.classList.toggle('active', i === index));
    svgRings.forEach((r, i) => r.classList.toggle('active', i === index));

    if (concTitle) concTitle.textContent = `${data.ring} · ${data.title}`;
    if (concDesc) concDesc.textContent = data.desc;
    if (concSpecs) {
      concSpecs.innerHTML = data.specs.map(s => `
        <li class="concentric-specs-item">
          <span class="specs-check">✓</span>
          <span>${s}</span>
        </li>
      `).join('');
    }
  }

  ringPills.forEach((pill, idx) => {
    pill.addEventListener('click', () => updateConcentricView(idx));
  });

  svgRings.forEach((ring, idx) => {
    ring.addEventListener('click', () => updateConcentricView(idx));
  });

  // ==========================================================================
  // 6. THE 6-PHASE VERIFICATION LIFECYCLE
  // ==========================================================================
  const lifecyclePhases = [
    {
      step: '01 / 06',
      title: 'Architecture Blueprinting & Requirements Blueprints',
      desc: 'Requirements validation via structured checklists, application architecture inspection, and technical alignment before writing code.'
    },
    {
      step: '02 / 06',
      title: 'Shift-Left Development & Unit Test Harnesses',
      desc: 'Commit-time unit testing in Java, Python, TypeScript, and .NET. Catches 60% of defects at commit with intelligent flaky-test elimination.'
    },
    {
      step: '03 / 06',
      title: 'API Verification & Enterprise Systems Sync',
      desc: 'Validating microservice contracts, zero-data-silo CRM/ERP synchronization (Zoho One, Salesforce, SAP), and custom workflow integrity.'
    },
    {
      step: '04 / 06',
      title: 'Autonomous E2E & Cross-Platform Testing',
      desc: 'Goal-driven AI testing agents executing natural-language business intent concurrently across real browser, mobile, and connected device matrices.'
    },
    {
      step: '05 / 06',
      title: 'Performance, Security & Usability Auditing',
      desc: 'Load stress benchmarking up to 1M req/s, automated OWASP penetration simulations, and 5D UX & WCAG 2.1 accessibility auditing.'
    },
    {
      step: '06 / 06',
      title: 'Production Deployment & Continuous Health Monitoring',
      desc: 'Post-release synthetic health verification, weekly AI model drift tracking, and real-time defect containment with self-healing webhooks.'
    }
  ];

  let currentPhaseIdx = 0;
  const phaseStepEl = document.getElementById('phase-step-tag');
  const phaseTitleEl = document.getElementById('phase-title');
  const phaseDescEl = document.getElementById('phase-desc');
  const dialNumEl = document.getElementById('dial-phase-num');
  const dialDots = document.querySelectorAll('.dial-step-dot');
  const dialRotateGroup = document.getElementById('dial-rotate-group');

  function renderPhase(idx) {
    currentPhaseIdx = idx;
    const phase = lifecyclePhases[idx];
    if (!phase) return;

    if (phaseStepEl) phaseStepEl.textContent = `PHASE ${phase.step}`;
    if (phaseTitleEl) phaseTitleEl.textContent = phase.title;
    if (phaseDescEl) phaseDescEl.textContent = phase.desc;
    if (dialNumEl) dialNumEl.textContent = String(idx + 1).padStart(2, '0');

    dialDots.forEach((dot, i) => dot.classList.toggle('active', i === idx));

    if (dialRotateGroup) {
      const angle = (idx / 6) * 360;
      dialRotateGroup.style.transform = `rotate(${angle}deg)`;
    }
  }

  document.getElementById('dial-prev-btn')?.addEventListener('click', () => {
    const nextIdx = (currentPhaseIdx - 1 + 6) % 6;
    renderPhase(nextIdx);
  });

  document.getElementById('dial-next-btn')?.addEventListener('click', () => {
    const nextIdx = (currentPhaseIdx + 1) % 6;
    renderPhase(nextIdx);
  });

  dialDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => renderPhase(idx));
  });

  // Dial drag interaction
  const dialEl = document.getElementById('interactive-scrub-dial');
  if (dialEl) {
    let isDialDragging = false;
    let startAngle = 0;

    dialEl.addEventListener('mousedown', (e) => {
      isDialDragging = true;
      const rect = dialEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    });

    window.addEventListener('mouseup', () => { isDialDragging = false; });

    window.addEventListener('mousemove', (e) => {
      if (!isDialDragging) return;
      const rect = dialEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      let diff = currentAngle - startAngle;
      if (diff < 0) diff += Math.PI * 2;
      const step = Math.floor((diff / (Math.PI * 2)) * 6) % 6;
      if (step !== currentPhaseIdx) {
        renderPhase(step);
      }
    });
  }

  // ==========================================================================
  // 7. COMPARATIVE MODEL (INFITEJ STANDARD VS TRADITIONAL IT)
  // ==========================================================================
  const comparisonSlides = [
    {
      num: '01 / 05',
      tradTitle: 'Brittle Manual Test Scripts',
      tradDesc: 'Legacy Selenium or Cypress scripts break whenever frontend engineers alter element IDs, CSS classes, or DOM structures, creating an unsustainable maintenance burden.',
      tradImpact: 'High maintenance debt; up to 40% of QA hours lost to repairing broken locators.',
      infiTitle: 'Intent-Driven Self-Healing Testing Agents',
      infiDesc: 'Autonomous agents execute natural-language business intent dynamically. Multi-attribute Computer Vision & DOM graphs update locators in real time without human intervention.',
      infiImpact: 'Eliminates selector maintenance; slashes test execution cycles by up to 90%.'
    },
    {
      num: '02 / 05',
      tradTitle: 'Rushed MVPs Requiring Rewrites',
      tradDesc: 'Standard software agencies treat automated testing, CI/CD pipelines, and observability as post-launch add-ons, causing crashes when real users arrive.',
      tradImpact: 'Post-launch failures; months lost to architectural refactoring and bug hotfixes.',
      infiTitle: '90-Day Production-Grade RapidLaunch™',
      infiDesc: 'Full-cycle custom software development with day-one CI/CD, distributed tracing, and embedded quality gates across 3 structured phases (Align, Build, Launch).',
      infiImpact: 'Zero rewrite risk; 100% production readiness delivered on time in 90 days.'
    },
    {
      num: '03 / 05',
      tradTitle: 'Pass/Fail Testing Blind to AI Drift',
      tradDesc: 'Traditional testing tools cannot validate non-deterministic LLMs or generative AI, resulting in live errors from hallucinations and edge prompts.',
      tradImpact: 'Standard assertions miss non-deterministic conversational and factual errors.',
      infiTitle: '5-Layer AI Quality Surface Evaluation',
      infiDesc: 'Infitej systematically tests AI systems across Data Integrity, Behavioral Consistency, Contextual Accuracy, Safety Red-Teaming, and Trust Governance.',
      infiImpact: 'Prevents hallucinations & model drift prior to software deployment.'
    },
    {
      num: '04 / 05',
      tradTitle: 'Defect Backlogs Clogging Development',
      tradDesc: 'Accumulated bug backlogs drain internal developer capacity, delaying critical revenue-generating features and product releases.',
      tradImpact: 'Feature roadmap stagnation; developer burnout and growing technical debt.',
      infiTitle: 'Zero-Overlap BugBuster™ QA Pods',
      infiDesc: 'Dedicated QA and engineering pods operate in parallel with your internal developers via Assess → Adopt → Rollout & Scale, resolving defects with zero sprint disruption.',
      infiImpact: 'Clears legacy defect backlogs while your primary team builds new features.'
    },
    {
      num: '05 / 05',
      tradTitle: 'Rigid Headcount & Body-Shop Billing',
      tradDesc: 'Traditional consulting firms lock companies into expensive hourly headcount contracts with little accountability for delivery speed or software quality.',
      tradImpact: 'Unpredictable costs, slow execution, and misaligned delivery incentives.',
      infiTitle: 'Outcome-Driven Engineering Milestones',
      infiDesc: 'Choose from flexible models: Proof of Concept, Dedicated Pod, Fixed Price, Hybrid, Managed QA, or Senior Architecture Advisory—tied directly to verified milestones.',
      infiImpact: 'Transparent ROI, rapid ramp-up, and predictable delivery timelines.'
    }
  ];

  let currentSlideIdx = 0;
  const slideCounterEl = document.getElementById('slider-counter');
  const compTradTitle = document.getElementById('comp-trad-title');
  const compTradDesc = document.getElementById('comp-trad-desc');
  const compTradImpact = document.getElementById('comp-trad-impact');
  const compInfiTitle = document.getElementById('comp-infi-title');
  const compInfiDesc = document.getElementById('comp-infi-desc');
  const compInfiImpact = document.getElementById('comp-infi-impact');

  function renderSlide(idx) {
    currentSlideIdx = idx;
    const slide = comparisonSlides[idx];
    if (!slide) return;

    if (slideCounterEl) slideCounterEl.textContent = slide.num;
    if (compTradTitle) compTradTitle.textContent = slide.tradTitle;
    if (compTradDesc) compTradDesc.textContent = slide.tradDesc;
    if (compTradImpact) compTradImpact.textContent = slide.tradImpact;
    if (compInfiTitle) compInfiTitle.textContent = slide.infiTitle;
    if (compInfiDesc) compInfiDesc.textContent = slide.infiDesc;
    if (compInfiImpact) compInfiImpact.textContent = slide.infiImpact;
  }

  document.getElementById('slider-prev-btn')?.addEventListener('click', () => {
    const nextIdx = (currentSlideIdx - 1 + comparisonSlides.length) % comparisonSlides.length;
    renderSlide(nextIdx);
  });

  document.getElementById('slider-next-btn')?.addEventListener('click', () => {
    const nextIdx = (currentSlideIdx + 1) % comparisonSlides.length;
    renderSlide(nextIdx);
  });

  document.getElementById('slider-skip-btn')?.addEventListener('click', () => {
    renderSlide(comparisonSlides.length - 1);
  });

  // ==========================================================================
  // 8. MATURITY ROADMAPPING ("STARTUP WAY" VS "ENTERPRISE WAY")
  // ==========================================================================
  const startupSteps = [
    { title: 'Stage 1 · Ideation & Pre-Seed', desc: 'Requirements blueprinting, rapid MVP scoping, and clean software architecture with zero initial technical debt.' },
    { title: 'Stage 2 · Seed Stage', desc: '90-Day RapidLaunch MVP delivery, foundational test automation pipelines, and day-one CI/CD release gates.' },
    { title: 'Stage 3 · Pre-Series A', desc: 'Scalable cloud infrastructure, self-healing QA automation scaffolding, and automated regression suites.' },
    { title: 'Stage 4 · Growth & Scaling', desc: 'High-velocity feature delivery, cross-platform mobile/web testing, risk prediction, and zero-defect release cadences.' },
    { title: 'Stage 5 · Enterprise Scale', desc: 'Mission-critical reliability, compliance repositories, and SOC2/ISO security audit readiness.' }
  ];

  const enterpriseSteps = [
    { title: 'Pillar 1 · Legacy Modernization', desc: 'Decoupling monolithic architectures into robust microservices with automated contract regression testing.' },
    { title: 'Pillar 2 · Enterprise SaaS & CRM Integration', desc: 'Full-spectrum integration across 50+ business applications (Zoho One, Salesforce, SAP, Oracle) with cross-system regression verification.' },
    { title: 'Pillar 3 · Multi-Team DevOps Release Governance', desc: 'Centralized QA governance, automated release gates across distributed agile pods, and weekly compliance reporting.' },
    { title: 'Pillar 4 · AI Behavioral Safety & Compliance', desc: '5-Layer evaluation stack protecting enterprise RAG and agent systems against hallucinations, data leaks, and compliance violations.' },
    { title: 'Pillar 5 · Follow-the-Sun Engineering Network', desc: 'Synchronized engineering collaboration spanning Munich, Bengaluru, London, San Francisco, Singapore, and Tokyo.' }
  ];

  const scrubberContainer = document.getElementById('scrubber-steps-container');
  const perspectiveBtns = document.querySelectorAll('.perspective-btn');

  function renderMaturitySteps(isStartup = true) {
    if (!scrubberContainer) return;
    const steps = isStartup ? startupSteps : enterpriseSteps;
    scrubberContainer.innerHTML = steps.map((s, idx) => `
      <div class="scrubber-step-card ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
        <div class="step-card-header">
          <span class="step-card-title">${s.title}</span>
          <span style="font-family: var(--font-mono); font-size: 11px; color: var(--coral-primary);">0${idx + 1}</span>
        </div>
        <p class="step-card-details">${s.desc}</p>
      </div>
    `).join('');

    scrubberContainer.querySelectorAll('.scrubber-step-card').forEach(card => {
      card.addEventListener('click', () => {
        scrubberContainer.querySelectorAll('.scrubber-step-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
    });
  }

  perspectiveBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      perspectiveBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderMaturitySteps(btn.dataset.track === 'startup');
    });
  });

  renderMaturitySteps(true);

  // ==========================================================================
  // 9. CONVERSION HUB & REAL PROJECT BRIEF GENERATOR
  // ==========================================================================
  const modelPills = document.querySelectorAll('.model-radio-pill');
  let selectedModel = 'Dedicated Pod';
  modelPills.forEach(pill => {
    pill.addEventListener('click', () => {
      modelPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedModel = pill.dataset.model || 'Dedicated Pod';
    });
  });

  const auditForm = document.getElementById('audit-request-form');
  const formStatus = document.getElementById('form-status-msg');

  auditForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(auditForm);
    const name = formData.get('name') || 'Engineering Lead';
    const email = formData.get('email') || 'lead@company.com';
    const scope = formData.get('scope') || 'Software engineering and quality assurance evaluation';
    const track = formData.get('track') || 'architecture-audit';

    const briefContent = `=====================================================
INFITEJ TECHNOLOGIES — ARCHITECTURE & PROJECT BRIEF
Generated: ${new Date().toISOString()}
=====================================================
Contact: ${name}
Work Email: ${email}
Selected Track: ${track === 'architecture-audit' ? 'Architecture & QA Verification Audit' : 'Focused 2-Week AI Quality Assessment'}
Commercial Model: ${selectedModel}

Engagement Scope & Requirements:
${scope}

Core Standards:
- Custom Full-Stack Software Development
- Autonomous Agentic Testing (Playwright / Self-Healing)
- 5-Layer AI Quality Surface Evaluation
- 90-Day Production-Grade RapidLaunch MVP Framework

Infitej Technologies
Infinite Quality | Intelligent Testing
=====================================================`;

    const blob = new Blob([briefContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Infitej-Brief-${name.toString().replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    if (formStatus) {
      formStatus.style.color = '#34D399';
      formStatus.textContent = '✓ Brief downloaded successfully! A senior engineer will review your project requirements.';
    }
  });

  // ==========================================================================
  // 10. ONE-CLICK AI SUMMARY BAR
  // ==========================================================================
  const summaryPrompt = encodeURIComponent(`Please provide an executive summary of Infitej Technologies (infitej.com) as a modern engineering company bridging custom software product engineering and AI-native autonomous quality assurance. Detail their proprietary accelerators (FastTrack, RapidLaunch, SuiteSync, BugBuster, CodeProbe, OmniStream), their 5-Layer AI Quality Stack, and their 6-phase verification lifecycle.`);

  document.getElementById('ai-btn-chatgpt')?.addEventListener('click', () => {
    window.open(`https://chatgpt.com/?q=${summaryPrompt}`, '_blank');
  });

  document.getElementById('ai-btn-claude')?.addEventListener('click', () => {
    window.open(`https://claude.ai/new?q=${summaryPrompt}`, '_blank');
  });

  document.getElementById('ai-btn-perplexity')?.addEventListener('click', () => {
    window.open(`https://www.perplexity.ai/search?q=${summaryPrompt}`, '_blank');
  });

  // ==========================================================================
  // 11. SUBTLE 3D CARD TILT MICRO-INTERACTIONS
  // ==========================================================================
  const tiltCards = document.querySelectorAll('.bento-card, .metric-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
});
