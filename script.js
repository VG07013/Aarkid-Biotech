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
  const railWindow = scrollRail.parentElement;
  const railStage = railWindow.parentElement;
  let railFrame = 0;

  const clampUnit = (value) => Math.min(Math.max(value, 0), 1);

  const railScrollableDistance = () => Math.max(scrollRail.scrollWidth - railWindow.clientWidth, 0);

  // Once the strip is pinned its offsetTop reports the pinned position, not
  // where it sits in the flow, so the resting offset is measured with sticky
  // switched off and cached. Only ever called off the scroll path.
  let railRestingOffset = 0;

  const measureRailRestingOffset = () => {
    const inlinePosition = railWindow.style.position;
    railWindow.style.position = 'static';
    railRestingOffset = railWindow.offsetTop;
    railWindow.style.position = inlinePosition;
  };

  // The pinned strip needs somewhere to travel, and it must be content-box
  // room: a sticky child does not move through its parent's padding. Sizing
  // it from the strip's own width keeps the sideways travel in step with the
  // scrolling on every screen instead of guessing at a viewport multiple.
  const syncRailTravel = () => {
    if (!mobileBreakpoint.matches) {
      railStage.style.removeProperty('min-height');
      return;
    }

    measureRailRestingOffset();
    const travel = railRestingOffset + railWindow.offsetHeight + railScrollableDistance() * 1.15;
    railStage.style.minHeight = `${Math.round(travel)}px`;
  };

  // Desktop pins the whole stage, so the rail tracks the section moving
  // through the viewport. Below 900px only the strip is pinned, so it tracks
  // how far that strip has been held back inside the stage instead.
  const railProgress = () => {
    if (mobileBreakpoint.matches) {
      const stageBox = railStage.getBoundingClientRect();
      const stickyTop = parseFloat(getComputedStyle(railWindow).top) || 0;
      const maxTravel = stageBox.height - railRestingOffset - railWindow.offsetHeight;

      if (maxTravel <= 0) return 0;
      return clampUnit((stickyTop - (stageBox.top + railRestingOffset)) / maxTravel);
    }

    const sectionBox = scrollRailSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const travelDistance = Math.max(sectionBox.height - viewportHeight, 1);

    return clampUnit((0 - sectionBox.top) / travelDistance);
  };

  const updateScrollRail = () => {
    railFrame = 0;
    scrollRail.style.setProperty('--rail-shift', `${-(railScrollableDistance() * railProgress())}px`);
  };

  const requestScrollRailUpdate = () => {
    if (railFrame) return;
    railFrame = requestAnimationFrame(updateScrollRail);
  };

  // Travel room is measured, so it has to be resynced before the rail reads
  // geometry back, and again once late-loading images settle the layout.
  const resetScrollRail = () => {
    syncRailTravel();
    updateScrollRail();
  };

  resetScrollRail();
  window.addEventListener('load', resetScrollRail);
  window.addEventListener('scroll', requestScrollRailUpdate, { passive: true });
  window.addEventListener('resize', resetScrollRail);
  mobileBreakpoint.addEventListener('change', resetScrollRail);
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
