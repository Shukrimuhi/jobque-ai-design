const pages = [...document.querySelectorAll('.page')];
const links = [...document.querySelectorAll('.nav-link')];
const sidebar = document.querySelector('.sidebar');
const modal = document.querySelector('#modal');
const toast = document.querySelector('#toast');

function showPage(name) {
  const target = document.getElementById(name) || document.getElementById('home');
  pages.forEach(page => page.classList.toggle('active-page', page === target));
  links.forEach(link => link.classList.toggle('active', link.dataset.page === target.id));
  sidebar.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  history.replaceState(null, '', `#${target.id}`);
}

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

links.forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  showPage(link.dataset.page);
}));

document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => showPage(button.dataset.go)));
document.querySelector('.menu-button').addEventListener('click', () => sidebar.classList.toggle('open'));

function openModal() { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); }
function closeModal() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }
document.querySelector('#add-alert').addEventListener('click', openModal);
document.querySelector('.modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });

document.querySelector('#create-tracker').addEventListener('click', () => {
  const title = document.querySelector('#job-title').value.trim();
  const url = document.querySelector('#career-url').value.trim();
  if (!title || !url) { notify('Please add a career page and job title.'); return; }
  const company = url.replace(/^https?:\/\//, '').split('/')[0].replace('www.', '').split('.')[0];
  const card = document.createElement('article');
  card.className = 'tracker-card';
  card.innerHTML = `<div class="tracker-top"><i class="company-logo">${company[0].toUpperCase()}</i><div><h3>${company[0].toUpperCase()+company.slice(1)}</h3><a href="#">${url}</a></div><label class="switch"><input type="checkbox" checked><span></span></label></div><div class="tracker-details"><div><small>ROLE</small><b>${title}</b></div><div><small>FREQUENCY</small><b>Every hour</b></div><div><small>LAST RESULT</small><b class="green">Monitoring started</b></div></div>`;
  document.querySelector('#alert-list').prepend(card);
  closeModal();
  notify(`Now monitoring ${title}.`);
  document.querySelector('#job-title').value = '';
  document.querySelector('#career-url').value = '';
});

document.querySelector('#save-profile').addEventListener('click', () => notify('Your profile changes were saved.'));
document.querySelector('#approve').addEventListener('click', () => {
  notify('Application approved and ready to continue.');
  document.querySelector('#approve').textContent = 'Approved ✓';
});

showPage(location.hash.slice(1) || 'home');
