/**
 * Smooth Scroll & Reveal Controller
 * 
 * PHILOSOPHY: Never hijack the browser's native scroll.
 * Native scroll runs on the compositor thread (GPU) and is always buttery-smooth.
 * JS-based scroll interception (preventDefault + window.scrollTo in rAF) forces
 * everything onto the main thread, causing jank and lag.
 *
 * Instead, we:
 *  1. Use CSS `scroll-behavior: smooth` for silky anchor navigation
 *  2. Use IntersectionObserver for performant scroll-triggered reveal animations
 *  3. Let the browser handle wheel/touch/keyboard scrolling natively
 */
export class SmoothScroll {
  constructor() {
    // Enable CSS smooth scrolling on the document
    document.documentElement.style.scrollBehavior = 'smooth';

    this.initAnchorNavigation();
    this.initRevealAnimations();
  }

  // =========================================================================
  // SMOOTH ANCHOR NAVIGATION (uses native smooth scrollTo)
  // =========================================================================
  initAnchorNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (!id || id === '#') return;
        const targetEl = document.querySelector(id);
        if (targetEl) {
          e.preventDefault();
          const targetOffset = targetEl.getBoundingClientRect().top + window.scrollY - 84;
          window.scrollTo({ top: targetOffset, behavior: 'smooth' });
        }
      });
    });

    // Back to top
    const bttBtn = document.getElementById('back-to-top');
    if (bttBtn) {
      bttBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // =========================================================================
  // REVEAL ANIMATIONS (IntersectionObserver — zero main-thread cost)
  // =========================================================================
  initRevealAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -6% 0px',
      threshold: 0.05
    });

    const selectors = [
      '.site-section',
      '.metric-card',
      '.bento-card',
      '.lab-panel-box',
      '.stack-layer-card',
      '.lifecycle-shell',
      '.slider-shell',
      '.scrubber-step-card',
      '.delivery-overview-box',
      '.conversion-split-container',
      '.pillar-item',
      '.section-heading-box'
    ];

    document.querySelectorAll(selectors.join(', ')).forEach((el, index) => {
      el.classList.add('reveal-element');
      // Stagger grouped cards slightly
      if (el.classList.contains('metric-card') || el.classList.contains('bento-card') || el.classList.contains('pillar-item')) {
        el.style.transitionDelay = `${(index % 4) * 0.08}s`;
      }
      observer.observe(el);
    });
  }
}
