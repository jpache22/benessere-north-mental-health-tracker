<script>
  import { goto } from '$app/navigation';
  export let data;

  // data
  let users = data.users ?? [];
  let projects = data.projects ?? [];

  // filters
  let q = data.initialFilters?.q ?? '';
  let role = data.initialFilters?.role ?? 'all';       // all | intake | therapist
  let status = data.initialFilters?.status ?? 'all';   // all | active | pending | deactivated
  let project = data.initialFilters?.project ?? '';    // project id or ''

  // URL sync
  function syncURL(){
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (role !== 'all') p.set('role', role);
    if (status !== 'all') p.set('status', status);
    if (project) p.set('project', project);
    goto(`/coordinator/users${p.toString()?`?${p}`:''}`, { replaceState:true, noScroll:true });
  }
  function clearFilters(){ q=''; role='all'; status='all'; project=''; syncURL(); }
  $: syncURL();

  // computed
  $: filtered = users.filter(u => {
    if (role!=='all' && u.role!==role) return false;
    if (status!=='all' && u.status!==status) return false;
    if (project && !(u.projects ?? []).some(p => p.id === project)) return false;
    if (q) {
      const hay = `${u.name ?? ''} ${u.email ?? ''}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  // KPIs
  $: kTotal = filtered.length;
  $: kIntake = filtered.filter(u=>u.role==='intake').length;
  $: kTherapist = filtered.filter(u=>u.role==='therapist').length;

  // Invite
  let showInvite=false, email='', inviteRole='intake';
  function openInvite(){ showInvite=true; email=''; inviteRole='intake'; }
  function closeInvite(){ showInvite=false; }
  let inviteMsg='';
  async function invite(){
    inviteMsg='';
    try{
      const r = await fetch('/api/coordinator/users/invite', {
        method:'POST', headers:{'content-type':'application/json'},
        body: JSON.stringify({ email, role: inviteRole })
      });
      if(!r.ok) throw new Error();
      inviteMsg='Invite sent';
      setTimeout(()=>{inviteMsg=''; closeInvite();}, 1000);
    }catch(_){ inviteMsg='Failed to send invite'; }
  }

  // Assign to project/group
  let showAssign=false, assignUser=null, selectedProjectId='', groupName='';
  function openAssign(u){ assignUser=u; showAssign=true; selectedProjectId=''; groupName=''; }
  function closeAssign(){ showAssign=false; assignUser=null; }
  let assignMsg='';
  async function assign(){
    assignMsg='';
    try{
      const r = await fetch(`/api/coordinator/users/${assignUser.id}/assign`, {
        method:'POST', headers:{'content-type':'application/json'},
        body: JSON.stringify({ projectId: selectedProjectId, groupName: groupName || null })
      });
      if(!r.ok) throw new Error();
      assignMsg='Assigned';
      setTimeout(()=>{assignMsg=''; closeAssign();}, 800);
    }catch(_){ assignMsg='Failed to assign'; }
  }

  // Role change
  async function setRole(u, next){
    const prev = u.role;
    u.role = next;
    try{
      const r = await fetch(`/api/coordinator/users/${u.id}/role`, {
        method:'PATCH', headers:{'content-type':'application/json'},
        body: JSON.stringify({ role: next })
      });
      if(!r.ok) throw new Error();
    }catch(_){ u.role = prev; /* revert on error */ }
  }

  // Activate/deactivate
  async function toggleActive(u){
    const prev = u.status;
    u.status = (u.status==='deactivated') ? 'active' : 'deactivated';
    try{
      const r = await fetch(`/api/coordinator/users/${u.id}/status`, {
        method:'PATCH', headers:{'content-type':'application/json'},
        body: JSON.stringify({ status: u.status })
      });
      if(!r.ok) throw new Error();
    }catch(_){ u.status = prev; }
  }
</script>

<section class="content page-users">
  <header class="content-head">
    <h1>Users & Roles</h1>
    <div class="actions">
      <input class="input" placeholder="Search by name or email…" bind:value={q} />
      <select class="input" bind:value={role}>
        <option value="all">All roles</option>
        <option value="intake">Intake</option>
        <option value="therapist">Therapist</option>
      </select>
      <select class="input" bind:value={status}>
        <option value="all">All status</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="deactivated">Deactivated</option>
      </select>
      <select class="input" bind:value={project}>
        <option value="">All projects</option>
        {#each projects as p}<option value={p.id}>{p.name}</option>{/each}
      </select>
      <button class="btn" on:click={openInvite}>+ Invite User</button>
      <button class="btn outline" on:click={clearFilters}>Reset</button>
    </div>
  </header>

  <!-- KPIs -->
  <div class="kpis grid-3">
    <div class="kpi"><span class="kpi-label">Total</span><span class="kpi-value">{kTotal}</span></div>
    <div class="kpi"><span class="kpi-label">Intake</span><span class="kpi-value">{kIntake}</span></div>
    <div class="kpi"><span class="kpi-label">Therapists</span><span class="kpi-value">{kTherapist}</span></div>
  </div>

  <div class="card">
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Projects</th><th class="right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filtered as u}
            <tr>
              <td>{u.name ?? '—'}</td>
              <td>{u.email}</td>
              <td>
                <select class="input" style="height:32px" value={u.role} on:change={(e)=>setRole(u,e.target.value)}>
                  <option value="intake">Intake</option>
                  <option value="therapist">Therapist</option>
                </select>
              </td>
              <td style="text-transform:capitalize">{u.status ?? 'active'}</td>
              <td class="muted">
                {(u.projects ?? []).length ? (u.projects ?? []).map(p=>p.name).join(', ') : '—'}
              </td>
              <td class="right">
                <div class="row-actions">
                  <button class="btn small outline" on:click={()=>openAssign(u)}>Assign to Project</button>
                  <button class="btn small outline" on:click={()=>toggleActive(u)}>
                    {u.status==='deactivated' ? 'Activate' : 'Deactivate'}
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if filtered.length === 0}
      <div class="empty">
        <p>No users match your filters.</p>
        <small class="muted">Adjust filters or invite a new user.</small>
      </div>
    {/if}
  </div>
</section>

<!-- Invite Modal -->
{#if showInvite}
  <div class="modal">
    <div class="modal-card">
      <h3>Invite User</h3>
      <label class="field">
        <span>Email</span>
        <input class="input" type="email" placeholder="user@domain.com" bind:value={email} />
      </label>
      <label class="field">
        <span>Role</span>
        <select class="input" bind:value={inviteRole}>
          <option value="intake">Intake</option>
          <option value="therapist">Therapist</option>
        </select>
      </label>
      <div class="modal-actions">
        <button class="btn outline" on:click={closeInvite}>Cancel</button>
        <button class="btn" on:click={invite} disabled={!email.trim()}>Send Invite</button>
      </div>
      {#if inviteMsg}<div class="muted" style="margin-top:6px">{inviteMsg}</div>{/if}
    </div>
  </div>
{/if}

<!-- Assign Modal -->
{#if showAssign}
  <div class="modal">
    <div class="modal-card">
      <h3>Assign {assignUser?.email} to Project</h3>
      <label class="field">
        <span>Project</span>
        <select class="input" bind:value={selectedProjectId}>
          <option value="" disabled selected>Select a project</option>
          {#each projects as p}<option value={p.id}>{p.name}</option>{/each}
        </select>
      </label>
      <label class="field">
        <span>Group (optional)</span>
        <input class="input" placeholder="Group name or ID" bind:value={groupName}/>
      </label>
      <div class="modal-actions">
        <button class="btn outline" on:click={closeAssign}>Cancel</button>
        <button class="btn" on:click={assign} disabled={!selectedProjectId}>Assign</button>
      </div>
      {#if assignMsg}<div class="muted" style="margin-top:6px">{assignMsg}</div>{/if}
    </div>
  </div>
{/if}

<style>
  .content-head{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center}
  .actions{display:flex;gap:8px;flex-wrap:wrap}
  .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:12px 0}
  .kpi{background:#fff;border:1px solid var(--border);border-radius:14px;padding:14px;display:grid;gap:6px}
  .kpi-label{color:var(--muted)} .kpi-value{font-size:1.4rem;font-weight:800}
  .card{background:#fff;border:1px solid var(--border);border-radius:16px}
  .table-wrap{overflow:auto;border-radius:16px}
  .table{width:100%;border-collapse:separate;border-spacing:0}
  .table th{padding:12px 14px;border-bottom:1px solid var(--border);background:#f8fafc;color:var(--muted);text-align:left}
  .table td{padding:12px 14px;border-bottom:1px solid var(--border)}
  .right{text-align:right}
  .row-actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}
  .empty{padding:20px;text-align:center}
  .field{display:grid;gap:6px;margin-top:10px}
  .modal{position:fixed;inset:0;background:rgba(0,0,0,.35);display:grid;place-items:center;z-index:40}
  .modal-card{background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px;min-width:360px}
  .modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}
</style>
