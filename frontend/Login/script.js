// mobile menu
const menuBtn = document.getElementById('menuBtn');
const navList = document.getElementById('navList');
if (menuBtn && navList) {
  menuBtn.addEventListener('click', () => {
    const open = navList.classList.toggle('show');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// basic client-side validation + mock success
const form = document.getElementById('loginForm');
const userInput = document.getElementById('username');
const passInput = document.getElementById('password');
const userErr = document.getElementById('userErr');
const passErr = document.getElementById('passErr');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    userErr.classList.remove('show');
    passErr.classList.remove('show');

    let ok = true;
    if (!userInput.value.trim()) { userErr.textContent = 'Please enter your username.'; userErr.classList.add('show'); ok = false; }
    if (!passInput.value.trim()) { passErr.textContent = 'Please enter your password.'; passErr.classList.add('show'); ok = false; }
    else if (passInput.value.length < 6) { passErr.textContent = 'Password must be at least 6 characters.'; passErr.classList.add('show'); ok = false; }

    if (!ok) return;

    // mock success — later, redirect to your dashboard
    alert('Signed in (mock). Redirecting to dashboard...');
    // window.location.href = '../dashboard/index.html';
  });
}

// footer year
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();
