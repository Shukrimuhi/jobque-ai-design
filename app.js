const pages = [...document.querySelectorAll('.page')];
const links = [...document.querySelectorAll('.nav-link')];
const sidebar = document.querySelector('.sidebar');
const modal = document.querySelector('#modal');
const toast = document.querySelector('#toast');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let toastTimer;
let lastFocusedElement;

function updateGreeting() {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  document.querySelector('#greeting').textContent = `Good ${timeOfDay}, Shukri`;
}

function revealPageItems(target) {
  const items = target.querySelectorAll('.stat-card, .job-row, .tracker-card, .review-section, .form-section, .steps article, .focus-card');
  items.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(10px)';
    window.setTimeout(() => {
      item.style.transition = 'opacity .35s ease, transform .35s ease, box-shadow .25s ease, border-color .25s ease';
      item.style.opacity = '1';
      item.style.transform = '';
    }, reduceMotion ? 0 : index * 55);
  });
}

function animateDashboard() {
  document.querySelectorAll('[data-count]').forEach(counter => {
    const end = Number(counter.dataset.count);
    if (reduceMotion) {
      counter.textContent = end;
      return;
    }
    const startTime = performance.now();
    const duration = 650;
    const step = now => {
      const progress = Math.min((now - startTime) / duration, 1);
      counter.textContent = Math.round(end * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  document.querySelectorAll('.chart i').forEach((bar, index) => {
    bar.style.height = '0';
    window.setTimeout(() => {
      bar.style.height = `${bar.dataset.height}%`;
    }, reduceMotion ? 0 : 120 + index * 70);
  });
}

function showPage(name) {
  const target = document.getElementById(name) || document.getElementById('home');
  pages.forEach(page => page.classList.toggle('active-page', page === target));
  links.forEach(link => link.classList.toggle('active', link.dataset.page === target.id));
  sidebar.classList.remove('open');
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  history.replaceState(null, '', `#${target.id}`);
  revealPageItems(target);
  if (target.id === 'dashboard') animateDashboard();
}

function notify(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
}

links.forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  showPage(link.dataset.page);
}));

document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => showPage(button.dataset.go)));
document.querySelector('.menu-button').addEventListener('click', () => sidebar.classList.toggle('open'));

function openModal() {
  lastFocusedElement = document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  window.setTimeout(() => document.querySelector('#career-url').focus(), 0);
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  lastFocusedElement?.focus();
}

document.querySelector('#add-alert').addEventListener('click', openModal);
document.querySelector('.modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

function makeTextElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function createTrackerCard(company, url, title) {
  const card = document.createElement('article');
  card.className = 'tracker-card just-added';
  const top = document.createElement('div');
  top.className = 'tracker-top';
  top.append(makeTextElement('i', 'company-logo', company[0].toUpperCase()));
  const identity = document.createElement('div');
  identity.append(makeTextElement('h3', '', company[0].toUpperCase() + company.slice(1)));
  identity.append(makeTextElement('span', 'tracker-url', url));
  top.append(identity);
  const switchLabel = document.createElement('label');
  switchLabel.className = 'switch';
  switchLabel.setAttribute('aria-label', `Pause ${company} tracker`);
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = true;
  switchLabel.append(checkbox, document.createElement('span'));
  top.append(switchLabel);
  const details = document.createElement('div');
  details.className = 'tracker-details';
  [['ROLE', title], ['FREQUENCY', 'Every hour'], ['LAST RESULT', 'Monitoring started']].forEach(([label, value], index) => {
    const row = document.createElement('div');
    row.append(makeTextElement('small', '', label));
    row.append(makeTextElement('b', index === 2 ? 'green' : '', value));
    details.append(row);
  });
  card.append(top, details);
  return card;
}

document.querySelector('#create-tracker').addEventListener('click', () => {
  const titleInput = document.querySelector('#job-title');
  const urlInput = document.querySelector('#career-url');
  const title = titleInput.value.trim();
  const url = urlInput.value.trim();
  if (!title || !url) {
    notify('Please add both the career page and job title.');
    (!url ? urlInput : titleInput).focus();
    return;
  }
  let hostname;
  try {
    const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    hostname = new URL(normalizedUrl).hostname.replace(/^www\./, '');
  } catch {
    notify('Please enter a valid career-page address.');
    urlInput.focus();
    return;
  }
  const company = hostname.split('.')[0] || 'Company';
  document.querySelector('#alert-list').prepend(createTrackerCard(company, hostname, title));
  closeModal();
  notify(`Great — JobQue is now watching ${company} for ${title} roles.`);
  titleInput.value = '';
  urlInput.value = '';
});

document.querySelector('.profile-form').addEventListener('submit', event => event.preventDefault());
document.querySelector('#save-profile').addEventListener('click', event => {
  const button = event.currentTarget;
  const original = button.textContent;
  button.textContent = 'Saved ✓';
  notify('Your profile is saved and ready for autofill.');
  window.setTimeout(() => { button.textContent = original; }, 1800);
});

document.querySelector('#approve').addEventListener('click', event => {
  const button = event.currentTarget;
  button.textContent = 'Approved ✓';
  button.disabled = true;
  notify('Application approved. You can continue when you are ready.');
});

document.querySelector('.search input').addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    const query = event.currentTarget.value.trim();
    notify(query ? `Searching your saved jobs for “${query}”.` : 'Type a company or role to search.');
  }
});

document.querySelector('.side-card .button').addEventListener('click', () => notify('The browser extension is planned for a future release.'));
document.querySelector('.notification').addEventListener('click', () => notify('You have 3 new job-match alerts.'));

updateGreeting();
showPage(location.hash.slice(1) || 'home');
