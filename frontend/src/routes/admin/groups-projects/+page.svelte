<script>
  import { onMount } from 'svelte';

  const API_BASE =
    import.meta.env.VITE_BACKEND_URL ??
    'https://benessere-north-mental-health-tracker-backend.julissa-school101.workers.dev';

  const PROJECTS_URL = `${API_BASE}/projects`;
  const GROUPS_URL = `${API_BASE}/groups`;

  let loading = true;
  let errorMsg = '';
  let successMsg = '';

  let projects = [];
  let groups = [];

  let projectLabel = '';
  let projectType = 'research';
  let projectExpiryDate = '';
  let projectSessions = 10;
  let sessionFormsInput = 'EPDS, PHQ-9';
  let screeningFormsInput = '';
  let preGroupFormsInput = '';
  let postGroupFormsInput = '';

  let selectedProjectId = '';
  let groupLabel = '';
  let groupSessionDates = [''];

  $: selectedProject = projects.find((p) => String(p.project_id) === String(selectedProjectId)) ?? null;
  $: expectedSessionCount = Number(selectedProject?.num_of_therapy_sessions ?? 0);

  $: {
    if (!selectedProject) {
      if (groupSessionDates.length !== 1 || groupSessionDates[0] !== '') groupSessionDates = [''];
    } else if (expectedSessionCount > 0 && groupSessionDates.length !== expectedSessionCount) {
      const nextDates = Array.from({ length: expectedSessionCount }, (_, idx) => groupSessionDates[idx] ?? '');
      groupSessionDates = nextDates;
    }
  }

  onMount(async () => {
    await refreshData();
  });

  function getToken() {
    return localStorage.getItem('authToken');
  }

  function parseFormList(value) {
    if (!value.trim()) return [];
    return [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))];
  }

  function formatDate(value) {
    if (!value) return '-';
    return new Date(`${value}T00:00:00`).toLocaleDateString();
  }

  function inferProjectType(project) {
    const screening = Array.isArray(project.screening_forms) ? project.screening_forms : [];
    const pre = Array.isArray(project.pre_group_forms) ? project.pre_group_forms : [];
    const post = Array.isArray(project.post_group_forms) ? project.post_group_forms : [];
    return screening.length || pre.length || post.length ? 'research' : 'clinical';
  }

  function groupProjectLabel(projectId) {
    return projects.find((p) => Number(p.project_id) === Number(projectId))?.label ?? `Project ${projectId}`;
  }

  async function refreshData() {
    loading = true;
    errorMsg = '';

    const token = getToken();
    if (!token) {
      errorMsg = 'No admin token found. Please log in.';
      loading = false;
      return;
    }

    try {
      const [projectsRes, groupsRes] = await Promise.all([
        fetch(PROJECTS_URL, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(GROUPS_URL, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const projectsJson = await projectsRes.json();
      const groupsJson = await groupsRes.json();

      if (!projectsRes.ok || !projectsJson.success) {
        throw new Error('Failed to fetch projects.');
      }
      if (!groupsRes.ok || !groupsJson.success) {
        throw new Error('Failed to fetch groups.');
      }

      projects = projectsJson.projects ?? [];
      groups = groupsJson.groups ?? [];

      if (!selectedProjectId && projects.length > 0) {
        selectedProjectId = String(projects[0].project_id);
      }
    } catch (_) {
      errorMsg = 'Could not load groups/projects from backend.';
    } finally {
      loading = false;
    }
  }

  async function createProject(event) {
    event.preventDefault();
    errorMsg = '';
    successMsg = '';

    const token = getToken();
    if (!token) {
      errorMsg = 'No admin token found. Please log in.';
      return;
    }

    const expiryDate =
      projectExpiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const sessionForms = parseFormList(sessionFormsInput);
    const screeningForms = projectType === 'research' ? parseFormList(screeningFormsInput) : [];
    const preGroupForms = projectType === 'research' ? parseFormList(preGroupFormsInput) : [];
    const postGroupForms = projectType === 'research' ? parseFormList(postGroupFormsInput) : [];

    if (!projectLabel.trim()) {
      errorMsg = 'Project label is required.';
      return;
    }

    if (sessionForms.length === 0) {
      errorMsg = 'At least one session form is required.';
      return;
    }

    const payload = {
      label: projectLabel.trim(),
      expiry_date: expiryDate,
      num_of_therapy_sessions: Number(projectSessions),
      session_forms: sessionForms,
      screening_forms: screeningForms,
      pre_group_forms: preGroupForms,
      post_group_forms: postGroupForms
    };

    try {
      const res = await fetch(PROJECTS_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        errorMsg = data?.error ? String(data.error) : 'Failed to create project.';
        return;
      }

      successMsg = `Created project #${data.project_id}.`;
      projectLabel = '';
      projectType = 'research';
      projectExpiryDate = '';
      projectSessions = 10;
      sessionFormsInput = 'EPDS, PHQ-9';
      screeningFormsInput = '';
      preGroupFormsInput = '';
      postGroupFormsInput = '';

      await refreshData();
    } catch (_) {
      errorMsg = 'Connection error while creating project.';
    }
  }

  async function createGroup(event) {
    event.preventDefault();
    errorMsg = '';
    successMsg = '';

    const token = getToken();
    if (!token) {
      errorMsg = 'No admin token found. Please log in.';
      return;
    }

    if (!selectedProjectId) {
      errorMsg = 'Select a project before creating a group.';
      return;
    }

    if (!groupLabel.trim()) {
      errorMsg = 'Group label is required.';
      return;
    }

    const trimmedDates = groupSessionDates.map((d) => d.trim()).filter(Boolean);
    if (expectedSessionCount > 0 && trimmedDates.length !== expectedSessionCount) {
      errorMsg = `This project requires exactly ${expectedSessionCount} session date(s).`;
      return;
    }

    const payload = {
      project_id: Number(selectedProjectId),
      label: groupLabel.trim(),
      session_dates: trimmedDates
    };

    try {
      const res = await fetch(GROUPS_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        errorMsg = data?.error ? String(data.error) : 'Failed to create group.';
        return;
      }

      successMsg = `Created group #${data.group_id}.`;
      groupLabel = '';
      groupSessionDates = Array.from({ length: expectedSessionCount || 1 }, () => '');

      await refreshData();
    } catch (_) {
      errorMsg = 'Connection error while creating group.';
    }
  }
</script>

<section class="page-head">
  <h1>Groups & Projects</h1>
  <p class="muted">Admin backend integration for sponsor-defined project and group setup.</p>
</section>

{#if successMsg}
  <div class="alert success">{successMsg}</div>
{/if}
{#if errorMsg}
  <div class="alert error">{errorMsg}</div>
{/if}

<section class="grid">
  <div class="card form-card">
    <h2>Create Project</h2>
    <form on:submit={createProject}>
      <label class="field">
        <span>Project Label</span>
        <input class="input" bind:value={projectLabel} placeholder="Perinatal Mental Health Research" required />
      </label>

      <div class="row">
        <label class="field">
          <span>Project Type</span>
          <select class="input" bind:value={projectType}>
            <option value="research">Research</option>
            <option value="clinical">Clinical</option>
          </select>
        </label>

        <label class="field">
          <span>Therapy Sessions</span>
          <input class="input" type="number" min="1" bind:value={projectSessions} required />
        </label>
      </div>

      <label class="field">
        <span>Expiry Date (defaults to +1 year)</span>
        <input class="input" type="date" bind:value={projectExpiryDate} />
      </label>

      <label class="field">
        <span>Session Forms (comma-separated)</span>
        <input class="input" bind:value={sessionFormsInput} placeholder="EPDS, PHQ-9" required />
      </label>

      {#if projectType === 'research'}
        <label class="field">
          <span>Screening Forms (comma-separated)</span>
          <input class="input" bind:value={screeningFormsInput} placeholder="PHQ-9" />
        </label>

        <label class="field">
          <span>Pre-group Forms (comma-separated)</span>
          <input class="input" bind:value={preGroupFormsInput} placeholder="EPDS, GAD-7" />
        </label>

        <label class="field">
          <span>Post-group Forms (comma-separated)</span>
          <input class="input" bind:value={postGroupFormsInput} placeholder="Q-LES" />
        </label>
      {/if}

      <button class="btn" type="submit">Create Project</button>
    </form>
  </div>

  <div class="card form-card">
    <h2>Create Group</h2>
    <form on:submit={createGroup}>
      <label class="field">
        <span>Project</span>
        <select class="input" bind:value={selectedProjectId} required disabled={projects.length === 0}>
          <option value="">Select project</option>
          {#each projects as project}
            <option value={project.project_id}>{project.label} ({project.num_of_therapy_sessions} sessions)</option>
          {/each}
        </select>
      </label>

      <label class="field">
        <span>Group Label</span>
        <input class="input" bind:value={groupLabel} placeholder="Group 1" required />
      </label>

      {#if selectedProject}
        <div class="session-date-grid">
          {#each groupSessionDates as _, idx}
            <label class="field">
              <span>Session {idx + 1} Date</span>
              <input class="input" type="date" bind:value={groupSessionDates[idx]} required />
            </label>
          {/each}
        </div>
      {/if}

      <button class="btn" type="submit" disabled={projects.length === 0}>Create Group</button>
    </form>
  </div>
</section>

<section class="card table-card">
  <header class="table-head">
    <h2>Projects</h2>
    <span class="muted">{projects.length} total</span>
  </header>

  {#if loading}
    <div class="empty">Loading projects...</div>
  {:else if projects.length === 0}
    <div class="empty">No projects created yet.</div>
  {:else}
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Label</th>
            <th>Type</th>
            <th>Expiry</th>
            <th>Sessions</th>
            <th>Session Forms</th>
            <th>Screening</th>
            <th>Pre</th>
            <th>Post</th>
          </tr>
        </thead>
        <tbody>
          {#each projects as project}
            <tr>
              <td>{project.project_id}</td>
              <td>{project.label}</td>
              <td class="caps">{inferProjectType(project)}</td>
              <td>{formatDate(project.expiry_date?.slice?.(0, 10) ?? project.expiry_date)}</td>
              <td>{project.num_of_therapy_sessions}</td>
              <td>{(project.session_forms ?? []).join(', ') || '-'}</td>
              <td>{(project.screening_forms ?? []).join(', ') || '-'}</td>
              <td>{(project.pre_group_forms ?? []).join(', ') || '-'}</td>
              <td>{(project.post_group_forms ?? []).join(', ') || '-'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</section>

<section class="card table-card">
  <header class="table-head">
    <h2>Groups</h2>
    <span class="muted">{groups.length} total</span>
  </header>

  {#if loading}
    <div class="empty">Loading groups...</div>
  {:else if groups.length === 0}
    <div class="empty">No groups created yet.</div>
  {:else}
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Project</th>
            <th>Label</th>
            <th>Session Count</th>
            <th>First Session</th>
            <th>Last Session</th>
          </tr>
        </thead>
        <tbody>
          {#each groups as group}
            {@const sortedDates = [...(group.session_dates ?? [])].sort()}
            <tr>
              <td>{group.group_id}</td>
              <td>{groupProjectLabel(group.project_id)}</td>
              <td>{group.label}</td>
              <td>{sortedDates.length}</td>
              <td>{sortedDates.length ? formatDate(String(sortedDates[0]).slice(0, 10)) : '-'}</td>
              <td>{sortedDates.length ? formatDate(String(sortedDates[sortedDates.length - 1]).slice(0, 10)) : '-'}</td>
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

  .row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .session-date-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
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

  .empty {
    padding: 20px;
    color: var(--muted);
  }

  .alert {
    margin: 0 0 12px;
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
