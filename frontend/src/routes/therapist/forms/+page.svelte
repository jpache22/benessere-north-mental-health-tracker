<script>
  import { goto } from '$app/navigation';
  export let data;

  let items = data.items ?? [];

  // filters (from URL)
  let q      = data.initialFilters?.q ?? '';
  let status = data.initialFilters?.status ?? 'all';
  let from   = data.initialFilters?.from ?? '';
  let to     = data.initialFilters?.to ?? '';

  function inRange(dateStr, fromStr, toStr) {
    if (!dateStr) return true;
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

  $: filtered = items.filter((r) => {
    if (status !== 'all' && r.status !== status) return false;
    if (q) {
      const hay = `${r.patient ?? ''} ${r.form ?? ''}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    // filter by assigned or due inside range (either qualifies)
    const assignedOK = inRange(r.assignedOn, from, to);
    const dueOK = inRange(r.dueOn, from, to);
    return assignedOK || dueOK;
  });

  // KPIs
  $: kDueToday = filtered.filter(r => r.status === 'due-today').length;
  $: kOverdue  = filtered.filter(r => r.status === 'overdue').length;
  $: kDone     = filtered.filter(r => r.status === 'completed').length;

  // keep URL in sync
  function syncURL() {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (status && status !== 'all') p.set('status', status);
    if (from) p.set('from', from);
    if (to)   p.set('to', to);
    goto(`/therapist/forms${p.toString() ? `?${p.toString()}` : ''}`, { replaceState: true, noScroll: true });
  }
  function clearFilters(){ q=''; status='all'; from=''; to=''; syncURL(); }
  $: syncURL();
</script>

<section class="content page-forms">
  <header class="content-head">
    <h1>Assigned Forms</h1>
    <div class="actions">
      <input class="input" type="search" placeholder="Search by patient or form…" bind:value={q} />
      <select class="input" bind:value={status}>
        <option value="all">All statuses</option>
        <option value="assigned">Assigned</option>
        <option value="due-today">Due today</option>
        <option value="overdue">Overdue</option>
        <option value="completed">Completed</option>
      </select>
      <input class="input" type="date" bind:value={from} />
      <input class="input" type="date" bind:value={to} />
      <button class="btn">+ Assign Forms</button>
    </div>
  </header>

  <!-- KPIs -->
  <div class="kpis grid-3">
    <div class="kpi"><span class="kpi-label">Due today</span><span class="kpi-value">{kDueToday}</span></div>
    <div class="kpi"><span class="kpi-label">Overdue</span><span class="kpi-value">{kOverdue}</span></div>
    <div class="kpi"><span class="kpi-label">Completed</span><span class="kpi-value">{kDone}</span></div>
  </div>

  <div class="card">
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Form</th>
            <th>Assigned</th>
            <th>Due</th>
            <th>Status</th>
            <th>Progress</th>
            <th class="right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filtered as r}
            <tr>
              <td>{r.patient}</td>
              <td>{r.form}</td>
              <td>{r.assignedOn}</td>
              <td>{r.dueOn}</td>
              <td style="text-transform:capitalize">{r.status}</td>
              <td>{r.progress ?? '-'}</td>
              <td class="right">
                <button class="btn small outline">View</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if filtered.length === 0}
      <div class="empty">
        <p>No assigned forms yet.</p>
        <button class="btn outline" on:click={clearFilters}>Clear filters</button>
      </div>
    {/if}
  </div>
</section>

<style>
  .page-forms .content-head{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center}
  .page-forms .actions{display:flex;gap:8px;flex-wrap:wrap}
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
