// mobile menu
const menuBtn = document.getElementById('menuBtn');
const navList = document.getElementById('navList');
if (menuBtn && navList) {
  menuBtn.addEventListener('click', () => {
    const open = navList.classList.toggle('show');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// copyright year
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();
