// 이전 첫 화면 링크도 새 페이지로 연결합니다.
if (document.body.classList.contains('home-page')) {
  if (location.hash === '#menu') location.replace('menu.html#menu');
  else if (location.hash === '#about' || location.hash === '#visit') location.replace(`about.html${location.hash}`);
}

// 하나의 펼침 영역을 마우스, 키보드, 터치에서 함께 사용합니다.
const header = document.querySelector('#site-header');
const navPanel = document.querySelector('#nav-panel');
const navTriggers = document.querySelectorAll('button.nav-trigger');
const navColumns = document.querySelectorAll('.nav-column');
let activeTrigger = null;
let suppressFocusOpen = false;
let lastPointerType = '';

function openNavigation(trigger) {
  activeTrigger = trigger;
  navPanel.inert = false;
  navPanel.setAttribute('aria-hidden', 'false');
  navPanel.classList.add('is-open');
  navTriggers.forEach(button => button.setAttribute('aria-expanded', String(button === trigger)));
  navColumns.forEach(column => column.classList.toggle('is-active', column.dataset.column === trigger.dataset.nav));
}

function closeNavigation() {
  navPanel.classList.remove('is-open');
  navPanel.setAttribute('aria-hidden', 'true');
  navPanel.inert = true;
  navTriggers.forEach(button => button.setAttribute('aria-expanded', 'false'));
  navColumns.forEach(column => column.classList.toggle('is-active', false));
}

const menuLink = document.querySelector('.nav-menu-link');
menuLink.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') closeNavigation(); });
menuLink.addEventListener('focus', closeNavigation);

navTriggers.forEach(button => {
  button.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') openNavigation(button);
  });
  button.addEventListener('focus', () => {
    if (!suppressFocusOpen && button.matches(':focus-visible')) openNavigation(button);
  });
  button.addEventListener('pointerdown', event => {
    lastPointerType = event.pointerType;
  });
  button.addEventListener('click', event => {
    if (event.detail > 0 && lastPointerType === 'mouse') {
      openNavigation(button);
      return;
    }
    if (navPanel.classList.contains('is-open') && activeTrigger === button) {
      closeNavigation();
    } else {
      openNavigation(button);
    }
  });
});

header.addEventListener('pointerleave', event => {
  if (event.pointerType === 'mouse') closeNavigation();
});
header.addEventListener('focusout', event => {
  if (!header.contains(event.relatedTarget)) closeNavigation();
});
header.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navPanel.classList.contains('is-open')) {
    event.preventDefault();
    const button = activeTrigger;
    closeNavigation();
    suppressFocusOpen = true;
    button?.focus();
    suppressFocusOpen = false;
  }
});
document.addEventListener('click', event => {
  if (!header.contains(event.target)) closeNavigation();
});
navPanel.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNavigation));

// 화면에 들어오는 영역만 한 번 부드럽게 표시합니다.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealItems = document.querySelectorAll('.section-heading, .feature-heading, .feature-grid, .event-copy, .event-cards, .about-photo, .about-copy');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealItems.forEach(item => {
    item.classList.add('scroll-reveal');
    observer.observe(item);
  });
}


if (document.body.classList.contains('home-page')) {
// 한 화면 크기의 영역에서는 한 번의 스크롤로 다음 영역까지 천천히 이동합니다.
// 메뉴처럼 화면보다 긴 영역은 내부를 다 읽은 뒤에만 다음 영역으로 넘어갑니다.
const screenSections = [...document.querySelectorAll('main > section'), document.querySelector('.site-footer')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let screenAnimation = 0;
let scrollingScreen = false;
let ignoreWheelUntil = 0;
let touchGesture = null;

function nextScreen(direction) {
  const marker = window.scrollY + Math.min(window.innerHeight * .25, 100);
  let index = screenSections.findIndex((section, i) => {
    const next = screenSections[i + 1];
    return marker >= section.offsetTop && (!next || marker < next.offsetTop);
  });
  if (index < 0) index = 0;
  const current = screenSections[index];
  const rect = current.getBoundingClientRect();
  if (rect.height > window.innerHeight + 8) {
    if (direction > 0 && rect.bottom > window.innerHeight + 12) return null;
    if (direction < 0 && rect.top < -12) return null;
  }
  return screenSections[index + direction] || null;
}

function slideToScreen(target) {
  if (!target) return;
  const start = window.scrollY;
  const end = Math.min(target.getBoundingClientRect().top + start, document.documentElement.scrollHeight - window.innerHeight);
  const distance = end - start;
  if (Math.abs(distance) < 1) return;
  const duration = 1000;
  let started;
  scrollingScreen = true;
  const step = time => {
    if (started === undefined) started = time;
    const progress = Math.min((time - started) / duration, 1);
    const eased = (1 - Math.cos(Math.PI * progress)) / 2;
    window.scrollTo({ top: start + distance * eased, behavior: 'instant' });
    if (progress < 1) screenAnimation = requestAnimationFrame(step);
    else {
      scrollingScreen = false;
      screenAnimation = 0;
      ignoreWheelUntil = performance.now() + 180;
    }
  };
  screenAnimation = requestAnimationFrame(step);
}

function isIndependentScroll(target) {
  return target instanceof Element && Boolean(target.closest('dialog, .nav-panel'));
}

window.addEventListener('wheel', event => {
  if (reducedMotion.matches || event.ctrlKey || isIndependentScroll(event.target)) return;
  if (scrollingScreen || performance.now() < ignoreWheelUntil) {
    event.preventDefault();
    return;
  }
  if (Math.abs(event.deltaY) < 3 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  const target = nextScreen(event.deltaY > 0 ? 1 : -1);
  if (target) {
    event.preventDefault();
    slideToScreen(target);
  }
}, { passive: false });

window.addEventListener('touchstart', event => {
  if (reducedMotion.matches || event.touches.length !== 1 || isIndependentScroll(event.target)) return;
  const touch = event.touches[0];
  touchGesture = { x: touch.clientX, y: touch.clientY, target: null, direction: 0 };
}, { passive: true });
window.addEventListener('touchmove', event => {
  if (!touchGesture || event.touches.length !== 1) return;
  const touch = event.touches[0];
  const x = touch.clientX - touchGesture.x;
  const y = touch.clientY - touchGesture.y;
  if (Math.abs(y) < 10 || Math.abs(x) > Math.abs(y)) return;
  const direction = y < 0 ? 1 : -1;
  const target = nextScreen(direction);
  if (scrollingScreen || target) {
    if (event.cancelable) event.preventDefault();
    touchGesture.target = target;
    touchGesture.direction = direction;
  }
}, { passive: false });
window.addEventListener('touchend', event => {
  if (touchGesture && event.changedTouches.length && !scrollingScreen) {
    const distance = event.changedTouches[0].clientY - touchGesture.y;
    if (Math.abs(distance) >= 35 && touchGesture.target) slideToScreen(touchGesture.target);
  }
  touchGesture = null;
}, { passive: true });
window.addEventListener('touchcancel', () => { touchGesture = null; }, { passive: true });
window.addEventListener('keydown', event => {
  if (screenAnimation && ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
    cancelAnimationFrame(screenAnimation);
    screenAnimation = 0;
    scrollingScreen = false;
    ignoreWheelUntil = 0;
  }
});

}
