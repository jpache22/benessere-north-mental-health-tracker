<script>
  import { goto } from '$app/navigation';
  export let data;

  let items = data.items ?? [];
  let q = data.initialFilters?.q ?? '';
  let status = data.initialFilters?.status ?? 'all'; // all|assigned|due-today|overdue|completed
  let group = data.initialFilters?.group ?? '';

  $: filtered = items.filter(a => {
    if (status !== 'all' && a.status !== status) return false;
    if (group && a.group !== group) return false;
    if (q) {
      const hay = `${a.form ?? ''} ${a.group ?? ''}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  $: kAssigned = filtered.filter(a => a.status === 'assigned').length;
  $: kDueToday = filtered.filter(a => a.status === 'due-today').length;
  $: kOverdue  = filtered.filter(a => a.status === 'overdue').length;

  function syncURL(){
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (status !== 'all') p.set('status', status);
    if (group) p.set('group', group);
    goto(`/coordinator/assignments${p.toString()?`?${p}`:''}`, { replaceState:true, noScroll:true });
  }
  function clearFilters(){ q=''; status='all'; group=''; syncURL(); }
  $: syncURL();
</script>

<section class="content page-assignments">
  <header class="content-head">
    <h1>Assignments</h1>
    <div class="actions">
      <input class="input" placeholder="Search by form or group…" bind:value={q} />
      <select class="input" bind:value={status}>
        <option value="all">All statuses</option>
        <option value="assigned">Assigned</option>
        <option value="due-today">Due today</option>
        <option value="overdue">Overdue</option>
        <option value="completed">Completed</option>
      </select>
      <input class="input" placeholder="Group…" bind:value={group} />
      <button class="btn">+ New Assignment</button>
    </div>
  </header>

  <div class="kpis" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:12px 0">
    <div class="card kpi"><span class="k-label">Assigned</span><span class="k-value">{kAssigned}</span></div>
    <div class="card kpi"><span class="k-label">Due today</span><span class="k-value">{kDueToday}</span></div>
    <div class="card kpi"><span class="k-label">Overdue</span><span class="k-value">{kOverdue}</span></div>
  </div>

  <div class="card">
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr><th>Form</th><th>Group</th><th>Assigned</th><th>Due</th><th>Status</th><th class="right">Actions</th></tr>
        </thead>
        <tbody>
          {#each filtered as a}
            <tr>
              <td>{a.form}</td>
              <td>{a.group ?? '-'}</td>
              <td>{a.assignedOn ?? '-'}</td>
              <td>{a.dueOn ?? '-'}</td>
              <td style="text-transform:capitalize">{a.status ?? '-'}</td>
              <td class="right"><button class="btn small outline">View</button></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if filtered.length === 0}
      <div class="empty"><p>No assignments yet.</p><button class="btn outline" on:click={clearFilters}>Clear filters</button></div>
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
