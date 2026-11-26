import { addErrorHandler, navigateToUrl, registerApplication, start } from 'single-spa';

const urls = window.singleSpaRemoteUrls || {};
const apps = [
  { name: 'books', route: '/angular', url: urls.books || urls.bookBundle || 'http://localhost:4200/single-spa/main.js' },
  { name: 'todos', route: '/react', url: urls.todos || 'http://localhost:3000/single-spa/single-spa.js' },
  { name: 'goals', route: '/svelte', url: urls.goals || 'http://localhost:5000/single-spa/single-spa.js' },
];

function pathname() {
  return location.pathname.replace(/\/+$/, '') || '/';
}

function matchesAppRoute(path, app) {
  return path === app.route || (app.name === 'books' && path.startsWith(`${app.route}/`));
}

function updateLayout() {
  const path = pathname();
  document.getElementById('mfe-apps').classList.toggle('all-together', path === '/all-together');
  document.querySelectorAll('[data-mfe]').forEach((section) => {
    const app = apps.find((item) => item.name === section.dataset.mfe);
    section.hidden = !app || (path !== '/' && path !== '/all-together' && !matchesAppRoute(path, app));
  });
  document.getElementById('mfe-not-found').hidden =
    path === '/' || path === '/all-together' || apps.some((app) => matchesAppRoute(path, app));
  document.querySelectorAll('[data-mfe-link]').forEach((link) => {
    if (link.getAttribute('href') === path) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function showError(name, error) {
  const element = document.getElementById(`mfe-error-${name}`);
  if (!element) return;
  element.querySelector('span').textContent = `Could not load ${name}: ${error.message}`;
  element.hidden = false;
  console.error(`Single-spa application "${name}" failed:`, error);
}

function initialize() {
  if (!apps.every((app) => document.getElementById(`mfe-${app.name}`))) return false;
  for (const app of apps) {
    registerApplication({
      name: app.name,
      app: async () => {
        try {
          const module = await import(/* @vite-ignore */ app.url);
          document.getElementById(`mfe-error-${app.name}`).hidden = true;
          return module;
        } catch (error) {
          showError(app.name, error);
          throw error;
        }
      },
      activeWhen: () => pathname() === '/' || pathname() === '/all-together' || matchesAppRoute(pathname(), app),
      customProps: {
        domElement: document.getElementById(`mfe-${app.name}`),
        ...(app.name === 'books' ? { bookRouting: { basePath: app.route, sharedPaths: ['/', '/all-together'] } } : {}),
      },
    });
  }
  addErrorHandler((error) => showError(error.appOrParcelName, error));
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-mfe-link]');
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigateToUrl(link.href);
  });
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-mfe-reload]')) location.reload();
  });
  window.addEventListener('single-spa:before-routing-event', updateLayout);
  updateLayout();
  start();
  return true;
}

if (!initialize()) {
  const observer = new MutationObserver(() => {
    if (initialize()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
