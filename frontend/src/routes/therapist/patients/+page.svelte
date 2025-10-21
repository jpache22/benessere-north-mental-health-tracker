<script>
  import { goto } from '$app/navigation';
  export let data;

  let items  = data.items ?? [];

  // filters (pre-filled from URL)
  let q      = data.initialFilters?.q ?? '';
  let status = data.initialFilters?.status ?? 'all';   // e.g., enrolled, paused, discharged
  let group  = data.initialFilters?.group ?? '';
  let active = data.initialFilters?.active ?? 'all';   // all | active | inactive

  // computed
  $: filtered = items.filter((r) => {
    if (status !== 'all' && r.status !== status) return false;
    if (active !== 'all') {
      const isActive = !(r.status === 'discharged' || r.status === 'paused' || r.inactive === true);
      if ((active === 'active' && !isActive) || (active === 'inactive' && isActive)) return false;
    }
    if (group && r.group !== group) return false;
    if (q) {
      const hay = `${r.name ?? ''} ${r.group ?? ''}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  // KPIs
  $: kTotal     = filtered.length;
  $: kActive    = filtered.filter(r => !(r.status === 'discharged' || r.status === 'paused' || r.inactive)).length;
  $: kWithForms = filtered.filter(r => (r.formsDue ?? 0) > 0).length;

  // keep URL in sync (no reload)
  function syncURL(){
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (status !== 'all') p.set('status', status);
    if (group) p.set('group', group);
    if (active !== 'all') p.set('active', active);
    goto(`/therapist/patients${p.toString() ? `?${p.toString()}` : ''}`, { replaceState:true, noScroll:true });
  }
  function clearFilters(){ q=''; status='all'; group=''; active='all'; syncURL(); }
  $: syncURL();
</script>

<section class="content page-patients">
  <header class="content-head">
    <h1>Patients</h1>
    <div class="actions">
      <input class="input" type="search" placeholder="Search by name or group…" bind:value={q} />
      <select class="input" bind:value={status}>
        <option value="all">All statuses</option>
        <option value="enrolled">Enrolled</option>
        <option value="paused">Paused</option>
        <option value="discharged">Discharged</option>
      </select>
      <select class="input" bind:value={active}>
        <option value="all">All activity</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <input class="input" type="text" placeholder="Group…" bind:value={group} />
      <button class="btn">+ Add Patient</button>
    </div>
  </header>

  <!-- KPIs -->
  <div class="kpis grid-3">
    <div class="kpi"><span class="kpi-label">Total</span><span class="kpi-value">{kTotal}</span></div>
    <div class="kpi"><span class="kpi-label">Active</span><span class="kpi-value">{kActive}</span></div>
    <div class="kpi"><span class="kpi-label">Forms due</span><span class="kpi-value">{kWithForms}</span></div>
  </div>

  <div class="card">
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Group</th>
            <th>Last Activity</th>
            <th>Forms Due</th>
            <th>Status</th>
            <th class="right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filtered as r}
            <tr>
              <td>{r.name}</td>
              <td>{r.group ?? '-'}</td>
              <td>{r.lastActivity ?? '-'}</td>
              <td>{r.formsDue ?? 0}</td>
              <td style="text-transform:capitalize">{r.status ?? '-'}</td>
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
        <p>No patients found.</p>
        <button class="btn outline" on:click={clearFilters}>Clear filters</button>
      </div>
    {/if}
  </div>
</section>

<style>
  .page-patients .content-head{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center}
  .page-patients .actions{display:flex;gap:8px;flex-wrap:wrap}
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
