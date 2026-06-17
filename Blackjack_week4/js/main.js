/* ============================================================
   Royal Blackjack — main.js
   Week 3: CSS3 interaction helpers
   - Hamburger navigation toggle
   - Scroll Reveal (IntersectionObserver)
   - Card flip demo on game page
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. HAMBURGER MENU ── */
  const toggle  = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (toggle && navMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }


  /* ── 2. SCROLL REVEAL ── */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // fire once
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }


  /* ── 3. CARD FLIP — click to flip on game page ── */
  document.querySelectorAll('.card-flip-wrapper').forEach(wrapper => {
    // Skip the hero demo card (has auto-animation)
    if (wrapper.closest('.card-preview')) return;

    wrapper.addEventListener('click', () => {
      wrapper.classList.toggle('flipped');
    });
  });

});
