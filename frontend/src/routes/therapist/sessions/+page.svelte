<script>
  import { goto } from '$app/navigation';
  export let data;

  // DB data delivered by +page.js (empty by default until API exists)
  let sessions = data.sessions ?? [];

  // Filters (pre-filled from URL via +page.js)
  let q = data.initialFilters?.q ?? '';
  let status = data.initialFilters?.status ?? 'all';
  let from = data.initialFilters?.from ?? '';
  let to = data.initialFilters?.to ?? '';

  function inRange(dateStr, fromStr, toStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (fromStr) {
      const f = new Date(fromStr);
      if (d < new Date(f.getFullYear(), f.getMonth(), f.getDate())) return false;
    }
    if (toStr) {
      const t = new Date(toStr);
      if (d > new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59)) return false;
    }
    return true;
  }

  // Filtered view
  $: filtered = sessions.filter((s) => {
    if (status !== 'all' && s.status !== status) return false;
    if (q) {
      const txt = `${s.patient ?? ''} ${s.notes ?? ''}`.toLowerCase();
      if (!txt.includes(q.toLowerCase())) return false;
    }
    if (!inRange(s.date, from, to)) return false;
    return true;
  });

  // KPIs (work even when empty)
  $: kpiDone = filtered.filter((s) => s.status === 'completed').length;
  $: kpiCanceled = filtered.filter((s) => s.status === 'canceled').length;
  $: kpiWeek = (() => {
    if (!filtered.length) return 0;
    const now = new Date();
    const start = new Date(now); start.setDate(now.getDate() - now.getDay()); // Sun
    const end = new Date(start); end.setDate(start.getDate() + 6);
    return filtered.filter((s) => {
      const d = new Date(s.date);
      return d >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
             d <= new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59);
    }).length;
  })();

  // Keep URL in sync (no reload)
  function syncURL() {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status && status !== 'all') params.set('status', status);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    goto(`/therapist/sessions${params.toString() ? `?${params.toString()}` : ''}`, { replaceState: true, noScroll: true });
  }

  function clearFilters() { q = ''; status = 'all'; from = ''; to = ''; syncURL(); }
  $: syncURL(); // reactively update URL when any filter changes
</script>

<section class="content page-sessions">
  <header class="content-head">
    <h1>Sessions</h1>
    <div class="actions">
      <input class="input" type="search" placeholder="Search by patient or notes…" bind:value={q} />
      <select class="input" bind:value={status}>
        <option value="all">All statuses</option>
        <option value="upcoming">Upcoming</option>
        <option value="completed">Completed</option>
        <option value="canceled">Canceled</option>
      </select>
      <input class="input" type="date" bind:value={from} />
      <input class="input" type="date" bind:value={to} />
      <button class="btn">+ New Session</button>
    </div>
  </header>

  <!-- KPI Summary -->
  <div class="kpis grid-3">
    <div class="kpi"><span class="kpi-label">This week</span><span class="kpi-value">{kpiWeek}</span></div>
    <div class="kpi"><span class="kpi-label">Completed</span><span class="kpi-value">{kpiDone}</span></div>
    <div class="kpi"><span class="kpi-label">Canceled</span><span class="kpi-value">{kpiCanceled}</span></div>
  </div>

  <div class="card">
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Date</th><th>Time</th><th>Patient</th><th>Type</th>
            <th>Status</th><th>Notes</th><th class="right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filtered as s}
            <tr>
              <td>{s.date}</td>
              <td>{s.time}</td>
              <td>{s.patient}</td>
              <td>{s.type}</td>
              <td style="text-transform:capitalize">{s.status}</td>
              <td>{s.notes}</td>
              <td class="right"><button class="btn small outline">View</button></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if filtered.length === 0}
      <div class="empty">
        <p>No sessions yet.</p>
        <button class="btn outline" on:click={clearFilters}>Clear filters</button>
      </div>
    {/if}
  </div>
</section>

<style>
  .page-sessions .content-head{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center}
  .page-sessions .actions{display:flex;gap:8px;flex-wrap:wrap}
  .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:12px 0}
  .kpi{background:#fff;border:1px solid var(--border);border-radius:14px;padding:14px;display:grid;gap:6px}
  .kpi-label{color:var(--muted)} .kpi-value{font-size:1.4rem;font-weight:800}
  .card{background:#fff;border:1px solid var(--border);border-radius:16px}
  .table-wrap{overflow:auto;border-radius:16px}
  .table{width:100%;border-collapse:separate;border-spacing:0}
  .table th{padding:12px 14px;border-bottom:1px solid var(--border);background:#f8fafc;color:var(--muted);text-align:left}
  .table td{padding:12px 14px;border-bottom:1px solid var(--border)}
  .right{text-align:right}
  .empty{padding:20px;text-align:center}
</style>