// ----- Mock data (swap with API later) -----
const SESSIONS = [
  { id: 1, date: '2025-10-16', time: '09:00', patient: 'Ava Nguyen', type: 'Individual', status: 'upcoming', notes: 'PHQ-9 follow-up' },
  { id: 2, date: '2025-10-16', time: '11:30', patient: 'Marco Diaz', type: 'Group',     status: 'completed', notes: 'Week 3 reflection' },
  { id: 3, date: '2025-10-17', time: '14:00', patient: 'Sophia Lee', type: 'Individual', status: 'canceled',  notes: 'Reschedule next week' },
  { id: 4, date: '2025-10-18', time: '10:15', patient: 'Daniel Kim', type: 'Individual', status: 'upcoming',  notes: 'First intake' },
  { id: 5, date: '2025-10-19', time: '13:00', patient: 'Priya Patel',type: 'Group',     status: 'completed', notes: 'Assigned EPDS' },
];

const bodyEl = document.getElementById('sessionBody');
const emptyEl = document.getElementById('emptyState');
const searchEl = document.getElementById('search');
const statusEl = document.getElementById('statusFilter');
const fromEl = document.getElementById('dateFrom');
const toEl = document.getElementById('dateTo');
const clearBtn = document.getElementById('clearFilters');

const kWeek = document.getElementById('kpiWeek');
const kDone = document.getElementById('kpiDone');
const kCanceled = document.getElementById('kpiCanceled');

function within(dateStr, fromStr, toStr){
  const d = new Date(dateStr);
  if (fromStr){ const f = new Date(fromStr); if (d < new Date(f.getFullYear(), f.getMonth(), f.getDate())) return false; }
  if (toStr){ const t = new Date(toStr); if (d > new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23,59,59)) return false; }
  return true;
}

function row(session){
  const statusClass =
    session.status === 'completed' ? 'ok' :
    session.status === 'canceled' ? 'cancel' : 'warn';
  return `
    <tr>
      <td>${session.date}</td>
      <td>${session.time}</td>
      <td>${session.patient}</td>
      <td>${session.type}</td>
      <td><span class="badge ${statusClass}">${session.status}</span></td>
      <td>${session.notes || ''}</td>
      <td class="right">
        <button class="btn small outline" data-view="${session.id}">View</button>
      </td>
    </tr>
  `;
}

function render(){
  const q = (searchEl.value || '').toLowerCase();
  const st = statusEl.value;
  const from = fromEl.value, to = toEl.value;

  const filtered = SESSIONS.filter(s => {
    if (st !== 'all' && s.status !== st) return false;
    if (q && !(s.patient.toLowerCase().includes(q) || (s.notes||'').toLowerCase().includes(q))) return false;
    if (!within(s.date, from, to)) return false;
    return true;
  });

  bodyEl.innerHTML = filtered.map(row).join('');
  emptyEl.classList.toggle('hidden', filtered.length !== 0);

  // KPIs
  const now = new Date();
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); // Sunday
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate()+6);

  const inWeek = filtered.filter(s => {
    const d = new Date(s.date);
    return d >= new Date(weekStart.getFullYear(),weekStart.getMonth(),weekStart.getDate()) &&
           d <= new Date(weekEnd.getFullYear(),weekEnd.getMonth(),weekEnd.getDate(),23,59,59);
  });
  kWeek.textContent = inWeek.length;
  kDone.textContent = filtered.filter(s => s.status === 'completed').length;
  kCanceled.textContent = filtered.filter(s => s.status === 'canceled').length;
}

// events
[searchEl, statusEl, fromEl, toEl].forEach(el => el && el.addEventListener('input', render));
clearBtn && clearBtn.addEventListener('click', () => {
  searchEl.value = ''; statusEl.value = 'all'; fromEl.value = ''; toEl.value = '';
  render();
});

// demo "new session"
document.getElementById('newSessionBtn')?.addEventListener('click', () => {
  alert('TODO: Open New Session modal / route');
});

// initial paint
render();
