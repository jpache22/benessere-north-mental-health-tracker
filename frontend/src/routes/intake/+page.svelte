<script>
  const intakeUser = {
    name: 'Intake Coordinator',
    role: 'Intake'
  };

  const projects = [
    {
      id: 1,
      label: 'Perinatal Mental Health Research',
      type: 'research',
      screeningForms: ['PHQ-9'],
      preGroupForms: ['EPDS', 'GAD-7'],
      postGroupForms: ['Q-LES']
    },
    {
      id: 2,
      label: 'CBT Clinical Program',
      type: 'clinical',
      screeningForms: [],
      preGroupForms: [],
      postGroupForms: []
    }
  ];

  const groups = [
    { id: 11, projectId: 1, label: 'Group 1', dates: ['2026-03-12', '2026-03-19', '2026-03-26'] },
    { id: 12, projectId: 1, label: 'Group 2', dates: ['2026-04-01', '2026-04-08', '2026-04-15'] },
    { id: 21, projectId: 2, label: 'Clinical AM', dates: ['2026-03-10', '2026-03-17', '2026-03-24'] }
  ];

  let participants = [
    {
      id: 1,
      projectId: 1,
      groupId: 11,
      name: 'Avery Cook',
      email: 'avery.cook@example.com',
      phone: '(555) 100-1001',
      enrolledDate: '2026-03-01',
      expiryDate: '2026-07-01',
      forms: {
        'PHQ-9': { completedDate: '2026-03-02' },
        EPDS: { completedDate: '2026-03-03' },
        'GAD-7': { completedDate: null },
        'Q-LES': { completedDate: null }
      }
    },
    {
      id: 2,
      projectId: 1,
      groupId: 11,
      name: 'Morgan Patel',
      email: 'morgan.patel@example.com',
      phone: '(555) 100-1002',
      enrolledDate: '2026-03-01',
      expiryDate: '2026-07-01',
      forms: {
        'PHQ-9': { completedDate: '2026-03-02' },
        EPDS: { completedDate: '2026-03-04' },
        'GAD-7': { completedDate: '2026-03-05' },
        'Q-LES': { completedDate: null }
      }
    },
    {
      id: 3,
      projectId: 2,
      groupId: 21,
      name: 'Jordan Diaz',
      email: 'jordan.diaz@example.com',
      phone: '(555) 100-1003',
      enrolledDate: '2026-02-22',
      expiryDate: '2026-06-30',
      forms: {}
    }
  ];

  let selectedProjectId = projects[0].id;
  let selectedGroupId = groups.find((g) => g.projectId === selectedProjectId)?.id ?? null;

  let showEnrollModal = false;
  let showAssignFormModal = false;
  let selectedParticipantId = null;

  $: selectedProject = projects.find((project) => project.id === Number(selectedProjectId));
  $: availableGroups = groups.filter((group) => group.projectId === Number(selectedProjectId));

  $: if (!availableGroups.some((group) => group.id === Number(selectedGroupId))) {
    selectedGroupId = availableGroups[0]?.id ?? null;
  }

  $: formColumns = selectedProject
    ? [...selectedProject.screeningForms, ...selectedProject.preGroupForms, ...selectedProject.postGroupForms]
    : [];

  $: filteredParticipants = participants.filter(
    (participant) =>
      participant.projectId === Number(selectedProjectId) && participant.groupId === Number(selectedGroupId)
  );

  $: totalRequiredForms = filteredParticipants.length * formColumns.length;
  $: completedForms = filteredParticipants.reduce((sum, participant) => {
    return (
      sum +
      formColumns.reduce((columnTotal, formName) => {
        return columnTotal + (participant.forms?.[formName]?.completedDate ? 1 : 0);
      }, 0)
    );
  }, 0);
  $: completionRate = totalRequiredForms ? Math.round((completedForms / totalRequiredForms) * 100) : 0;
  $: participantsFullyComplete = filteredParticipants.filter((participant) =>
    formColumns.every((formName) => participant.forms?.[formName]?.completedDate)
  ).length;

  $: selectedParticipant = participants.find((participant) => participant.id === selectedParticipantId) ?? null;
  $: assignableForms = selectedParticipant
    ? formColumns.filter((formName) => !selectedParticipant.forms?.[formName]?.completedDate)
    : [];

  function openEnrollModal() {
    showEnrollModal = true;
  }

  function openAssignModal(participantId) {
    selectedParticipantId = participantId;
    showAssignFormModal = true;
  }

  function closeModals() {
    showEnrollModal = false;
    showAssignFormModal = false;
    selectedParticipantId = null;
  }

  function formatDate(dateString) {
    if (!dateString) return 'Pending';
    return new Date(`${dateString}T00:00:00`).toLocaleDateString();
  }

  function handleEnroll(event) {
    const form = new FormData(event.currentTarget);
    const newParticipant = {
      id: participants.length + 1,
      projectId: Number(selectedProjectId),
      groupId: Number(selectedGroupId),
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
      enrolledDate: new Date().toISOString().slice(0, 10),
      expiryDate: String(form.get('expiryDate') || '').trim(),
      forms: {}
    };

    formColumns.forEach((formName) => {
      newParticipant.forms[formName] = { completedDate: null };
    });

    participants = [...participants, newParticipant];
    closeModals();
  }

  function handleAssignForm(event) {
    if (!selectedParticipant) return;

    const form = new FormData(event.currentTarget);
    const formName = String(form.get('formName') || '');

    participants = participants.map((participant) => {
      if (participant.id !== selectedParticipant.id || !formName) return participant;
      return {
        ...participant,
        forms: {
          ...participant.forms,
          [formName]: {
            ...(participant.forms?.[formName] || {}),
            assigned: true,
            dueDate: String(form.get('dueDate') || '')
          }
        }
      };
    });

    closeModals();
  }
</script>

<svelte:head>
  <title>Intake Dashboard - Mental Health Tracker</title>
</svelte:head>

<section class="intake-page">
  <header class="page-header">
    <div>
      <h1>Intake Dashboard</h1>
      <p>{intakeUser.name} | {intakeUser.role}</p>
    </div>
    <button class="btn btn-primary" on:click={openEnrollModal}>Enroll Participant</button>
  </header>

  <section class="card controls">
    <label>
      Project
      <select bind:value={selectedProjectId}>
        {#each projects as project}
          <option value={project.id}>{project.label} ({project.type})</option>
        {/each}
      </select>
    </label>
    <label>
      Group
      <select bind:value={selectedGroupId} disabled={!availableGroups.length}>
        {#each availableGroups as group}
          <option value={group.id}>{group.label}</option>
        {/each}
      </select>
    </label>
  </section>

  <section class="stats">
    <article class="card stat">
      <h2>Participants</h2>
      <p>{filteredParticipants.length}</p>
    </article>
    <article class="card stat">
      <h2>Completion Rate</h2>
      <p>{completionRate}%</p>
    </article>
    <article class="card stat">
      <h2>Completed Forms</h2>
      <p>{completedForms} / {totalRequiredForms}</p>
    </article>
    <article class="card stat">
      <h2>Fully Complete</h2>
      <p>{participantsFullyComplete}</p>
    </article>
  </section>

  <section class="card table-card">
    <h2>Form Status by Participant</h2>
    <p class="subtle">
      Cells with a completion date are green. Missing completion dates are red.
    </p>

    {#if !formColumns.length}
      <p class="empty-state">
        This project has no screening/pre/post forms configured.
      </p>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Participant</th>
              <th>Email</th>
              <th>Expiry</th>
              {#each formColumns as formName}
                <th>{formName}</th>
              {/each}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#if !filteredParticipants.length}
              <tr>
                <td colspan={formColumns.length + 4} class="empty-row">
                  No participants in this group.
                </td>
              </tr>
            {:else}
              {#each filteredParticipants as participant}
                <tr>
                  <td>{participant.name}</td>
                  <td>{participant.email}</td>
                  <td>{formatDate(participant.expiryDate)}</td>
                  {#each formColumns as formName}
                    {@const completedDate = participant.forms?.[formName]?.completedDate}
                    <td class={completedDate ? 'complete' : 'missing'}>
                      {completedDate ? formatDate(completedDate) : 'Missing'}
                    </td>
                  {/each}
                  <td>
                    <button class="btn btn-outline" on:click={() => openAssignModal(participant.id)}>
                      Assign Form
                    </button>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    {/if}
  </section>
</section>

{#if showEnrollModal}
  <div class="modal-backdrop" on:click={closeModals}>
    <section class="modal" on:click|stopPropagation>
      <h2>Enroll Participant</h2>
      <form on:submit|preventDefault={handleEnroll}>
        <label>
          Full Name
          <input name="name" type="text" required />
        </label>
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Phone
          <input name="phone" type="tel" />
        </label>
        <label>
          Expiry Date
          <input name="expiryDate" type="date" required />
        </label>
        <div class="actions">
          <button class="btn btn-outline" type="button" on:click={closeModals}>Cancel</button>
          <button class="btn btn-primary" type="submit">Save Participant</button>
        </div>
      </form>
    </section>
  </div>
{/if}

{#if showAssignFormModal && selectedParticipant}
  <div class="modal-backdrop" on:click={closeModals}>
    <section class="modal" on:click|stopPropagation>
      <h2>Assign Form</h2>
      <p class="subtle">Participant: {selectedParticipant.name}</p>
      <form on:submit|preventDefault={handleAssignForm}>
        <label>
          Form
          <select name="formName" required>
            <option value="">Select a form</option>
            {#each assignableForms as formName}
              <option value={formName}>{formName}</option>
            {/each}
          </select>
        </label>
        <label>
          Due Date
          <input name="dueDate" type="date" required />
        </label>
        <div class="actions">
          <button class="btn btn-outline" type="button" on:click={closeModals}>Cancel</button>
          <button class="btn btn-primary" type="submit">Assign</button>
        </div>
      </form>
    </section>
  </div>
{/if}

<style>
  .intake-page {
    max-width: 1280px;
    margin: 0 auto;
    padding: 1.5rem;
    display: grid;
    gap: 1rem;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 1rem;
    flex-wrap: wrap;
  }

  h1,
  h2 {
    margin: 0;
    color: #0f172a;
  }

  .page-header p,
  .subtle {
    margin: 0.35rem 0 0;
    color: #475569;
  }

  .card {
    border: 1px solid #dbe1ea;
    border-radius: 0.8rem;
    background: #fff;
    padding: 1rem;
  }

  .controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1rem;
  }

  label {
    display: grid;
    gap: 0.4rem;
    font-weight: 600;
    color: #334155;
  }

  input,
  select {
    padding: 0.6rem 0.8rem;
    border-radius: 0.5rem;
    border: 1px solid #cbd5e1;
    background: #fff;
    font: inherit;
  }

  .stats {
    display: grid;
    gap: 0.8rem;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .stat h2 {
    font-size: 0.95rem;
    color: #475569;
  }

  .stat p {
    margin: 0.35rem 0 0;
    font-size: 1.6rem;
    font-weight: 700;
    color: #0f172a;
  }

  .table-card h2 {
    margin-bottom: 0.25rem;
  }

  .table-wrap {
    overflow: auto;
    margin-top: 0.8rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 760px;
  }

  th,
  td {
    border-bottom: 1px solid #e2e8f0;
    padding: 0.7rem;
    text-align: left;
    white-space: nowrap;
    font-size: 0.9rem;
  }

  th {
    background: #f8fafc;
    color: #334155;
    font-weight: 700;
  }

  td.complete {
    background: #dcfce7;
    color: #166534;
    font-weight: 600;
  }

  td.missing {
    background: #fee2e2;
    color: #991b1b;
    font-weight: 600;
  }

  .empty-state,
  .empty-row {
    color: #64748b;
    padding: 1rem 0;
  }

  .btn {
    border: 1px solid transparent;
    border-radius: 0.55rem;
    padding: 0.55rem 0.8rem;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-primary {
    background: #1d4ed8;
    color: #fff;
  }

  .btn-primary:hover {
    background: #1e40af;
  }

  .btn-outline {
    border-color: #cbd5e1;
    background: #fff;
    color: #334155;
  }

  .btn-outline:hover {
    background: #f8fafc;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgb(15 23 42 / 45%);
    display: grid;
    place-items: center;
    padding: 1rem;
    z-index: 20;
  }

  .modal {
    width: min(520px, 100%);
    background: #fff;
    border-radius: 0.8rem;
    padding: 1rem;
    border: 1px solid #dbe1ea;
    display: grid;
    gap: 0.8rem;
  }

  .modal form {
    display: grid;
    gap: 0.8rem;
  }

  .actions {
    display: flex;
    justify-content: end;
    gap: 0.6rem;
  }

  @media (max-width: 700px) {
    .intake-page {
      padding: 1rem;
    }
  }
</style>
