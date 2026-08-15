const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const navigation = document.querySelector('[data-navigation]');
const navLinks = [...document.querySelectorAll('[data-nav-link]')];
const year = document.querySelector('[data-year]');
const mobileBreakpoint = window.matchMedia('(max-width: 900px)');

const setMenuOpen = (isOpen) => {
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('is-open', isOpen);
  header.classList.toggle('menu-visible', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
};

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  setMenuOpen(!isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});

mobileBreakpoint.addEventListener('change', (event) => {
  if (!event.matches) setMenuOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

const updateHeader = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 20);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = [...document.querySelectorAll('.reveal:not(.is-visible)')];
const scrollRailSection = document.querySelector('[data-scroll-rail-section]');
const scrollRail = document.querySelector('[data-scroll-rail]');

document.querySelectorAll('[data-reveal-stagger]').forEach((group) => {
  [...group.querySelectorAll(':scope > .reveal')].forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${Math.min(index * 65, 455)}ms`);
  });
});

if (!reduceMotion) {
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
}

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

if (scrollRailSection && scrollRail && !reduceMotion) {
  let railFrame = 0;

  // Below 900px the rail is a plain swipeable carousel, so the scroll-driven
  // transform must stay out of the way or it fights the native scrolling.
  const updateScrollRail = () => {
    railFrame = 0;

    if (mobileBreakpoint.matches) {
      scrollRail.style.setProperty('--rail-shift', '0px');
      return;
    }

    const sectionBox = scrollRailSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const railWindow = scrollRail.parentElement;
    const scrollableDistance = Math.max(scrollRail.scrollWidth - railWindow.clientWidth, 0);
    const travelDistance = Math.max(sectionBox.height - viewportHeight, 1);
    const progress = Math.min(Math.max((0 - sectionBox.top) / travelDistance, 0), 1);

    scrollRail.style.setProperty('--rail-shift', `${-(scrollableDistance * progress)}px`);
  };

  const requestScrollRailUpdate = () => {
    if (railFrame) return;
    railFrame = requestAnimationFrame(updateScrollRail);
  };

  updateScrollRail();
  window.addEventListener('scroll', requestScrollRailUpdate, { passive: true });
  window.addEventListener('resize', requestScrollRailUpdate);
  mobileBreakpoint.addEventListener('change', () => {
    scrollRail.parentElement.scrollLeft = 0;
    requestScrollRailUpdate();
  });
}

const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleSection) return;
      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute('href') === `#${visibleSection.target.id}`;
        if (isCurrent) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    },
    { rootMargin: '-30% 0px -60% 0px', threshold: [0, 0.2, 0.6] },
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

year.textContent = new Date().getFullYear();
