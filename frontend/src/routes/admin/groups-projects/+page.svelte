<script>
  import { onMount } from 'svelte';

  const GROUPS_KEY = 'admin_groups_draft';
  const PROJECTS_KEY = 'admin_projects_draft';

  let groups = [];
  let projects = [];

  let groupName = '';
  let groupDescription = '';
  let groupStatus = 'active';

  let projectName = '';
  let projectGroupId = '';
  let projectStartDate = '';
  let projectEndDate = '';
  let projectNotes = '';

  let groupError = '';
  let groupSuccess = '';
  let projectError = '';
  let projectSuccess = '';

  onMount(() => {
    groups = readStorage(GROUPS_KEY);
    projects = readStorage(PROJECTS_KEY);
  });

  function readStorage(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function createGroup(event) {
    event.preventDefault();
    groupError = '';
    groupSuccess = '';

    if (!groupName.trim()) {
      groupError = 'Group name is required.';
      return;
    }

    const nextGroup = {
      id: crypto.randomUUID(),
      name: groupName.trim(),
      description: groupDescription.trim(),
      status: groupStatus,
      createdAt: new Date().toISOString()
    };

    groups = [nextGroup, ...groups];
    writeStorage(GROUPS_KEY, groups);

    groupName = '';
    groupDescription = '';
    groupStatus = 'active';
    groupSuccess = 'Group created locally (frontend only).';
  }

  function createProject(event) {
    event.preventDefault();
    projectError = '';
    projectSuccess = '';

    if (!projectName.trim()) {
      projectError = 'Project name is required.';
      return;
    }

    if (!projectGroupId) {
      projectError = 'Please select a group.';
      return;
    }

    const selectedGroup = groups.find((g) => g.id === projectGroupId);
    if (!selectedGroup) {
      projectError = 'Selected group is invalid.';
      return;
    }

    const nextProject = {
      id: crypto.randomUUID(),
      name: projectName.trim(),
      groupId: selectedGroup.id,
      groupName: selectedGroup.name,
      startDate: projectStartDate || null,
      endDate: projectEndDate || null,
      notes: projectNotes.trim(),
      createdAt: new Date().toISOString()
    };

    projects = [nextProject, ...projects];
    writeStorage(PROJECTS_KEY, projects);

    projectName = '';
    projectGroupId = '';
    projectStartDate = '';
    projectEndDate = '';
    projectNotes = '';
    projectSuccess = 'Project created locally (frontend only).';
  }

  function deleteGroup(groupId) {
    const linkedProject = projects.find((p) => p.groupId === groupId);
    if (linkedProject) {
      groupError = 'Cannot delete a group that is linked to a project.';
      return;
    }

    groups = groups.filter((g) => g.id !== groupId);
    writeStorage(GROUPS_KEY, groups);
  }

  function deleteProject(projectId) {
    projects = projects.filter((p) => p.id !== projectId);
    writeStorage(PROJECTS_KEY, projects);
  }
</script>

<section class="page-head">
  <h1>Groups & Projects</h1>
  <p class="muted">Frontend-only setup for now. No backend integration yet.</p>
</section>

<section class="grid">
  <div class="card form-card">
    <h2>Create Group</h2>

    {#if groupSuccess}
      <div class="alert success">{groupSuccess}</div>
    {/if}
    {#if groupError}
      <div class="alert error">{groupError}</div>
    {/if}

    <form on:submit={createGroup}>
      <label class="field">
        <span>Group Name</span>
        <input class="input" bind:value={groupName} placeholder="Group A" required />
      </label>

      <label class="field">
        <span>Description</span>
        <textarea class="input" bind:value={groupDescription} rows="3" placeholder="Optional notes"></textarea>
      </label>

      <label class="field">
        <span>Status</span>
        <select class="input" bind:value={groupStatus}>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </label>

      <button class="btn" type="submit">Create Group</button>
    </form>
  </div>

  <div class="card form-card">
    <h2>Create Project</h2>

    {#if projectSuccess}
      <div class="alert success">{projectSuccess}</div>
    {/if}
    {#if projectError}
      <div class="alert error">{projectError}</div>
    {/if}

    <form on:submit={createProject}>
      <label class="field">
        <span>Project Name</span>
        <input class="input" bind:value={projectName} placeholder="Mood Tracking Q2" required />
      </label>

      <label class="field">
        <span>Group</span>
        <select class="input" bind:value={projectGroupId} required disabled={groups.length === 0}>
          <option value="">Select a group</option>
          {#each groups as group}
            <option value={group.id}>{group.name}</option>
          {/each}
        </select>
      </label>

      <div class="row">
        <label class="field">
          <span>Start Date</span>
          <input class="input" type="date" bind:value={projectStartDate} />
        </label>

        <label class="field">
          <span>End Date</span>
          <input class="input" type="date" bind:value={projectEndDate} />
        </label>
      </div>

      <label class="field">
        <span>Notes</span>
        <textarea class="input" bind:value={projectNotes} rows="3" placeholder="Optional notes"></textarea>
      </label>

      <button class="btn" type="submit" disabled={groups.length === 0}>Create Project</button>
    </form>

    {#if groups.length === 0}
      <p class="muted helper">Create at least one group before adding a project.</p>
    {/if}
  </div>
</section>

<section class="card table-card">
  <header class="table-head">
    <h2>Groups</h2>
    <span class="muted">{groups.length} total</span>
  </header>

  {#if groups.length === 0}
    <div class="empty">No groups created yet.</div>
  {:else}
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created</th>
            <th class="right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each groups as group}
            <tr>
              <td>{group.name}</td>
              <td>{group.description || '-'}</td>
              <td class="caps">{group.status}</td>
              <td>{new Date(group.createdAt).toLocaleDateString()}</td>
              <td class="right">
                <button class="btn small outline" on:click={() => deleteGroup(group.id)}>Delete</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</section>

<section class="card table-card">
  <header class="table-head">
    <h2>Projects</h2>
    <span class="muted">{projects.length} total</span>
  </header>

  {#if projects.length === 0}
    <div class="empty">No projects created yet.</div>
  {:else}
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Group</th>
            <th>Start</th>
            <th>End</th>
            <th>Notes</th>
            <th class="right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each projects as project}
            <tr>
              <td>{project.name}</td>
              <td>{project.groupName}</td>
              <td>{project.startDate || '-'}</td>
              <td>{project.endDate || '-'}</td>
              <td>{project.notes || '-'}</td>
              <td class="right">
                <button class="btn small outline" on:click={() => deleteProject(project.id)}>Delete</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</section>

<style>
  .page-head {
    margin-bottom: 16px;
  }

  .page-head h1 {
    margin: 0 0 6px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 18px;
  }

  @media (max-width: 900px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }

  .card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 18px;
  }

  .form-card h2,
  .table-head h2 {
    margin: 0;
  }

  form {
    display: grid;
    gap: 10px;
    margin-top: 12px;
  }

  .field {
    display: grid;
    gap: 6px;
  }

  .field span {
    font-size: 0.92rem;
    color: var(--muted);
  }

  textarea.input {
    resize: vertical;
  }

  .row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .helper {
    margin: 10px 2px 0;
  }

  .table-card {
    margin-bottom: 16px;
    padding: 0;
  }

  .table-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
  }

  .table-wrap {
    overflow-x: auto;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
  }

  .table th,
  .table td {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
    text-align: left;
  }

  .caps {
    text-transform: capitalize;
  }

  .right {
    text-align: right;
  }

  .empty {
    padding: 20px;
    color: var(--muted);
  }

  .alert {
    margin-top: 10px;
    padding: 10px 12px;
    border-radius: 10px;
  }

  .alert.success {
    background: #e8ffe8;
    border: 1px solid #a5d6a7;
    color: #2e7d32;
  }

  .alert.error {
    background: #ffe8e8;
    border: 1px solid #ef9a9a;
    color: #c62828;
  }

  .muted {
    color: var(--muted);
  }
</style>
