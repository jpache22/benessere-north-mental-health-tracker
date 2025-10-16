// mobile menu
const menuBtn = document.getElementById('menuBtn');
const navList = document.getElementById('navList');
if (menuBtn && navList) {
  menuBtn.addEventListener('click', () => {
    const open = navList.classList.toggle('show');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// footer year
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

/* 
  Integration hooks (fill these from your API later):

  // KPIs
  document.getElementById('kPatients').textContent = data.patientsAssigned;
  document.getElementById('kFormsDue').textContent   = data.formsDueToday;
  document.getElementById('kSessions').textContent   = data.sessionsThisWeek;
  document.getElementById('kCompletion').textContent = data.completion + '%';
  document.querySelector('.donut').style.setProperty('--pct', data.completion);

  // Patients table
  const tbody = document.getElementById('patientsBody');
  tbody.innerHTML = data.patients.map(p => `
    <tr>
      <td>${p.name}</td>
      <td>${p.group}</td>
      <td>${p.last_activity}</td>
      <td>${p.forms_due}</td>
      <td>${p.status}</td>
    </tr>
  `).join('');
*/
