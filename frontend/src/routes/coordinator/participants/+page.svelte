<script>
  import { goto } from '$app/navigation';
  export let data;

  let items = data.items ?? [];
  let q = data.initialFilters?.q ?? '';
  let status = data.initialFilters?.status ?? 'all'; // all|active|paused|withdrawn
  let group = data.initialFilters?.group ?? '';

  $: filtered = items.filter(p => {
    if (status !== 'all' && p.status !== status) return false;
    if (group && p.group !== group) return false;
    if (q) {
      const hay = `${p.name ?? ''} ${p.email ?? ''} ${p.group ?? ''}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  $: kTotal = filtered.length;
  $: kActive = filtered.filter(p => p.status === 'active').length;
  $: kWithFormsDue = filtered.filter(p => (p.formsDue ?? 0) > 0).length;

  function syncURL(){
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (status !== 'all') p.set('status', status);
    if (group) p.set('group', group);
    goto(`/coordinator/participants${p.toString()?`?${p}`:''}`, { replaceState:true, noScroll:true });
  }
  function clearFilters(){ q=''; status='all'; group=''; syncURL(); }
  $: syncURL();
</script>

<section class="content page-participants">
  <header class="content-head">
    <h1>Participants</h1>
    <div class="actions">
      <input class="input" placeholder="Search by name, email, or group…" bind:value={q} />
      <select class="input" bind:value={status}>
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="withdrawn">Withdrawn</option>
      </select>
      <input class="input" placeholder="Group…" bind:value={group} />
      <button class="btn">+ Add Participant</button>
    </div>
  </header>

  <div class="kpis" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:12px 0">
    <div class="card kpi"><span class="k-label">Total</span><span class="k-value">{kTotal}</span></div>
    <div class="card kpi"><span class="k-label">Active</span><span class="k-value">{kActive}</span></div>
    <div class="card kpi"><span class="k-label">Forms due</span><span class="k-value">{kWithFormsDue}</span></div>
  </div>

  <div class="card">
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Group</th><th>Forms Due</th><th>Status</th><th class="right">Actions</th></tr>
        </thead>
        <tbody>
          {#each filtered as p}
            <tr>
              <td>{p.name}</td>
              <td>{p.email ?? '-'}</td>
              <td>{p.group ?? '-'}</td>
              <td>{p.formsDue ?? 0}</td>
              <td style="text-transform:capitalize">{p.status ?? '-'}</td>
              <td class="right"><button class="btn small outline">View</button></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if filtered.length === 0}
      <div class="empty"><p>No participants found.</p><button class="btn outline" on:click={clearFilters}>Clear filters</button></div>
    {/if}
  </div>
</section>

<style>
  .content-head{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center}
  .actions{display:flex;gap:8px;flex-wrap:wrap}
  .card{background:#fff;border:1px solid var(--border);border-radius:16px}
  .table{width:100%;border-collapse:separate;border-spacing:0}
  .table th,.table td{padding:12px 14px;border-bottom:1px solid var(--border);text-align:left}
  .right{text-align:right}
  .kpi{padding:14px;display:grid;gap:6px}.k-label{color:var(--muted)}.k-value{font-size:1.4rem;font-weight:800}
  .empty{padding:20px;text-align:center}
</style>
