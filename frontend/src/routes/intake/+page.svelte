<script>
  export let data;

  // data
  let projects = data.projects ?? [];
  let forms = data.forms ?? [];

  // enrollment state
  let selectedProjectId = '';
  let selectedGroupId = '';
  let selectedParticipantId = '';
  let enrollMsg = '';

  async function enrollParticipant() {
    enrollMsg = '';
    try {
      const res = await fetch('/api/intake/enroll', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          groupId: selectedGroupId,
          participantId: selectedParticipantId
        })
      });
      if (!res.ok) throw new Error();
      enrollMsg = 'Participant enrolled!';
      setTimeout(() => (enrollMsg = ''), 1500);
    } catch (e) {
      enrollMsg = 'Failed to enroll participant.';
    }
  }

  // Assign form modal
  let showAssign = false;
  let assignUser = null;
  let selectedFormId = '';
  let assignMsg = '';

  async function openAssign(p) {
    assignUser = p;
    selectedFormId = '';
    assignMsg = '';
    showAssign = true;
  }

  async function assignForm() {
    assignMsg = '';
    try {
      const res = await fetch('/api/intake/forms/assign', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          participantId: assignUser.id,
          formId: selectedFormId
        })
      });
      if (!res.ok) throw new Error();
      assignMsg = 'Form assigned!';
      setTimeout(() => {
        assignMsg = '';
        showAssign = false;
      }, 1000);
    } catch (_) {
      assignMsg = 'Failed to assign form.';
    }
  }

  function closeAssign() {
    showAssign = false;
    assignUser = null;
  }

  // Derived helpers
  $: selectedProject = projects.find(p => p.id === selectedProjectId);
  $: groups = selectedProject?.groups ?? [];
  $: participants = selectedProject?.participants ?? [];
</script>

<section class="page-intake container">
  <h1>Intake Dashboard</h1>
  <p class="muted">Enroll participants into groups and manage their forms.</p>

  <!-- Enrollment -->
  <div class="card">
    <h2>Enroll Participant to Group</h2>
    <div class="enroll-grid">
      <select class="input" bind:value={selectedProjectId}>
        <option value="">Select project</option>
        {#each projects as p}<option value={p.id}>{p.name}</option>{/each}
      </select>

      <select class="input" bind:value={selectedGroupId} disabled={!groups.length}>
        <option value="">Select group</option>
        {#each groups as g}<option value={g.id}>{g.name}</option>{/each}
      </select>

      <select class="input" bind:value={selectedParticipantId} disabled={!participants.length}>
        <option value="">Select participant</option>
        {#each participants as p}<option value={p.id}>{p.name}</option>{/each}
      </select>

      <button class="btn" disabled={!selectedParticipantId} on:click={enrollParticipant}>
        Enroll
      </button>
    </div>
    {#if enrollMsg}<div class="muted" style="margin-top:8px">{enrollMsg}</div>{/if}
  </div>

  <!-- Participant Forms -->
  <div class="card">
    <h2>Participants & Forms</h2>
    {#if !selectedProject}
      <p class="muted">Select a project to view participants.</p>
    {:else}
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Participant</th>
              <th>Group</th>
              <th>Forms Completed</th>
              <th class="right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each participants as p}
              <tr>
                <td>{p.name}</td>
                <td>{p.group ?? '—'}</td>
                <td>{p.completedForms ?? 0}</td>
                <td class="right">
                  <button class="btn small outline" on:click={() => openAssign(p)}>
                    Give Form
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      {#if participants.length === 0}
        <div class="empty"><p>No participants found for this project.</p></div>
      {/if}
    {/if}
  </div>

  <!-- Assign Form Modal -->
  {#if showAssign}
    <div class="modal">
      <div class="modal-card">
        <h3>Assign Form to {assignUser?.name}</h3>
        <select class="input" bind:value={selectedFormId}>
          <option value="">Select a form</option>
          {#each forms as f}<option value={f.id}>{f.name}</option>{/each}
        </select>
        <div class="modal-actions">
          <button class="btn outline" on:click={closeAssign}>Cancel</button>
          <button class="btn" on:click={assignForm} disabled={!selectedFormId}>Assign</button>
        </div>
        {#if assignMsg}<div class="muted" style="margin-top:8px">{assignMsg}</div>{/if}
      </div>
    </div>
  {/if}
</section>

<style>
  .page-intake {
    max-width: 1100px;
    margin: 0 auto;
    padding: 40px 40px 80px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  h1 {
    font-size: 1.8rem;
    margin-bottom: 6px;
  }

  .muted {
    color: var(--muted);
  }

  /* CARD LAYOUT */
  .card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px 32px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  }

  .card h2 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 1.2rem;
  }

  /* Enrollment grid expands evenly */
  .enroll-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    align-items: end;
  }

  .btn {
    height: 42px;
  }

  /* Table improvements */
  .table-wrap {
    overflow-x: auto;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 12px;
  }

  .table th,
  .table td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
  }

  .table th {
    background: #f8fafc;
    color: var(--muted);
    text-align: left;
  }

  .right {
    text-align: right;
  }

  /* Empty / fallback */
  .empty {
    text-align: center;
    padding: 40px 0;
    color: var(--muted);
  }

  /* Modal reused from other pages */
  .modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: grid;
    place-items: center;
    z-index: 40;
  }

  .modal-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    min-width: 360px;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 10px;
  }

  @media (min-width: 1024px) {
    .page-intake {
      padding-top: 50px;
    }

    .card {
      padding: 32px 36px;
    }

    .card h2 {
      font-size: 1.3rem;
    }
  }
</style>
