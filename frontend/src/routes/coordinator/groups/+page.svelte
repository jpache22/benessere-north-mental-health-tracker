<script>
  import { goto } from '$app/navigation';
  export let data;

  let items = data.items ?? [];
  let q = data.initialFilters?.q ?? '';
  let status = data.initialFilters?.status ?? 'all'; // all|active|archived

  $: filtered = items.filter(g => {
    if (status !== 'all' && g.status !== status) return false;
    if (q) {
      const hay = `${g.name ?? ''} ${g.owner ?? ''}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  $: kTotal = filtered.length;
  $: kActive = filtered.filter(g => g.status === 'active').length;

  function syncURL(){
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (status !== 'all') p.set('status', status);
    goto(`/coordinator/groups${p.toString()?`?${p}`:''}`, { replaceState:true, noScroll:true });
  }
  function clearFilters(){ q=''; status='all'; syncURL(); }
  $: syncURL();
</script>

<section class="content page-groups">
  <header class="content-head">
    <h1>Groups</h1>
    <div class="actions">
      <input class="input" placeholder="Search groups…" bind:value={q} />
      <select class="input" bind:value={status}>
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>
      <button class="btn">+ New Group</button>
    </div>
  </header>

  <div class="kpis" style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:12px 0">
    <div class="card kpi"><span class="k-label">Total</span><span class="k-value">{kTotal}</span></div>
    <div class="card kpi"><span class="k-label">Active</span><span class="k-value">{kActive}</span></div>
  </div>

  <div class="card">
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr><th>Name</th><th>Owner</th><th>Participants</th><th>Status</th><th class="right">Actions</th></tr>
        </thead>
        <tbody>
          {#each filtered as g}
            <tr>
              <td>{g.name}</td>
              <td>{g.owner ?? '-'}</td>
              <td>{g.participants ?? 0}</td>
              <td style="text-transform:capitalize">{g.status ?? '-'}</td>
              <td class="right"><button class="btn small outline">View</button></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if filtered.length === 0}
      <div class="empty"><p>No groups found.</p><button class="btn outline" on:click={clearFilters}>Clear filters</button></div>
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
