<!-- frontend/src/routes/intake/+page.svelte -->
<script>
  import { goto } from '$app/navigation';

  // Mock data 
  let intakeUser = {
    name: 'Intake Coordinator',
    role: 'Intake'
  };

  // Projects and Groups
  let selectedProject = 'Perinatal Mental Health Research';
  let selectedGroup = 'Group 1';

  let projects = [
    { id: 1, name: 'Perinatal Mental Health Research', type: 'research' }
  ];

  let groups = [
    { id: 1, name: 'Group 1', projectId: 1 }
  ];

  // Forms required
  let requiredForms = [
    { name: 'PHQ-9', type: 'screening' },
    { name: 'EPDS', type: 'pre-group' },
    { name: 'GAD-7', type: 'pre-group' },
    { name: 'Q-LES', type: 'post-group' }
  ];

  // EXAMPLE 
  let participants = [
    {
      id: 1,
      name: 'Example User',
      email: 'example@gmail.com',
      enrolledDate: '2025-10-01',
      forms: {
        'PHQ-9': { completed: true, date: '2025-10-05', score: 12 },
        'EPDS': { completed: true, date: '2025-10-08', score: 15 },
        'GAD-7': { completed: false, date: null, score: null },
        'Q-LES': { completed: false, date: null, score: null }
      }
    }
  ];

  // Stats calculations
  $: totalParticipants = participants.length;
  $: totalFormsRequired = totalParticipants * requiredForms.length;
  $: completedForms = participants.reduce((total, p) => {
    return total + Object.values(p.forms).filter(f => f.completed).length;
  }, 0);
  $: completionRate = totalFormsRequired > 0 ? Math.round((completedForms / totalFormsRequired) * 100) : 0;
  $: participantsFullyCompleted = participants.filter(p => {
    return requiredForms.every(form => p.forms[form.name]?.completed);
  }).length;

  // Filter groups by selected project
  $: availableGroups = groups.filter(g => {
    const project = projects.find(p => p.name === selectedProject);
    return g.projectId === project?.id;
  });

  // Modal states
  let showEnrollModal = false;
  let showAssignFormModal = false;
  let selectedParticipant = null;

  function viewParticipantDetails(participant) {
    selectedParticipant = participant;
  }

  function assignForm(participant) {
    selectedParticipant = participant;
    showAssignFormModal = true;
  }

  function enrollNewParticipant() {
    showEnrollModal = true;
  }

  function closeModals() {
    showEnrollModal = false;
    showAssignFormModal = false;
    selectedParticipant = null;
  }

  function handleEnroll(event) {
    const formData = new FormData(event.target);
    const newParticipant = {
      id: participants.length + 1,
      name: formData.get('name'),
      email: formData.get('email'),
      enrolledDate: new Date().toISOString().split('T')[0],
      forms: {}
    };

    requiredForms.forEach(form => {
      newParticipant.forms[form.name] = { completed: false };
    });

    participants = [...participants, newParticipant];
    closeModals();
  }

  function handleAssignForm(event) {
    const formData = new FormData(event.target);
    const formName = formData.get('formName');
    const dueDate = formData.get('dueDate');

    participants = participants.map(p => {
      if (p.id === selectedParticipant.id) {
        return {
          ...p,
          forms: {
            ...p.forms,
            [formName]: {
              completed: false,
              assigned: true,
              dueDate: dueDate
            }
          }
        };
      }
      return p;
    });

    closeModals();
  }
</script>

<svelte:head>
  <title>Intake Dashboard - Mental Health Tracker</title>
</svelte:head>

<section class="intake-dashboard" style="max-width:1400px;margin:0 auto;padding:20px">
  <!-- Header -->
  <div class="page-head" style="margin-bottom:30px">
    <h1 style="margin:0 0 8px;font-size:2rem;color:#1e293b">Intake Dashboard</h1>
    <p class="muted" style="margin:0;font-size:1rem">
      Welcome back, <strong>{intakeUser.name}</strong> • Role: {intakeUser.role}
    </p>
  </div>

  <!-- Project & Group Selection -->
  <div class="card" style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:24px;margin-bottom:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
    <div style="display:flex;gap:20px;align-items:end;flex-wrap:wrap">
      <div style="flex:1;min-width:250px">
        <label style="display:block;margin-bottom:8px;font-weight:600;color:#1e293b;font-size:0.9rem">
          Select Project
        </label>
        <select 
          bind:value={selectedProject}
          style="width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;font-size:1rem;cursor:pointer"
        >
          {#each projects as project}
            <option value={project.name}>{project.name}</option>
          {/each}
        </select>
      </div>

      <div style="flex:1;min-width:250px">
        <label style="display:block;margin-bottom:8px;font-weight:600;color:#1e293b;font-size:0.9rem">
          Select Group
        </label>
        <select 
          bind:value={selectedGroup}
          style="width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;font-size:1rem;cursor:pointer"
        >
          {#each availableGroups as group}
            <option value={group.name}>{group.name}</option>
          {/each}
        </select>
      </div>

      <button 
        on:click={enrollNewParticipant}
        style="padding:12px 24px;border-radius:10px;background:#6366f1;color:#fff;border:none;cursor:pointer;font-size:1rem;font-weight:600;box-shadow:0 4px 6px rgba(99,102,241,0.25);transition:all 0.2s"
        on:mouseenter={(e) => {
          e.currentTarget.style.background = '#4f46e5';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        on:mouseleave={(e) => {
          e.currentTarget.style.background = '#6366f1';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        + Enroll Participant
      </button>
    </div>
  </div>

  <!-- Stats Cards -->
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-bottom:24px">
    <div class="stat-card" style="background:linear-gradient(135deg,#e0f2fe,#bae6fd);border:1px solid #7dd3fc;border-radius:12px;padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div>
          <p style="margin:0;font-size:0.85rem;color:#0c4a6e;font-weight:500">Total Participants</p>
          <p style="margin:8px 0 0;font-size:2rem;font-weight:700;color:#0c4a6e">{totalParticipants}</p>
        </div>
        <span style="font-size:2rem">👥</span>
      </div>
    </div>

    <div class="stat-card" style="background:linear-gradient(135deg,#d1fae5,#a7f3d0);border:1px solid #6ee7b7;border-radius:12px;padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div>
          <p style="margin:0;font-size:0.85rem;color:#064e3b;font-weight:500">Completion Rate</p>
          <p style="margin:8px 0 0;font-size:2rem;font-weight:700;color:#064e3b">{completionRate}%</p>
        </div>
        <span style="font-size:2rem">📊</span>
      </div>
    </div>

    <div class="stat-card" style="background:linear-gradient(135deg,#fef3c7,#fde68a);border:1px solid #fcd34d;border-radius:12px;padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div>
          <p style="margin:0;font-size:0.85rem;color:#78350f;font-weight:500">Forms Completed</p>
          <p style="margin:8px 0 0;font-size:2rem;font-weight:700;color:#78350f">{completedForms} / {totalFormsRequired}</p>
        </div>
        <span style="font-size:2rem">📝</span>
      </div>
    </div>

    <div class="stat-card" style="background:linear-gradient(135deg,#ddd6fe,#c4b5fd);border:1px solid #a78bfa;border-radius:12px;padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div>
          <p style="margin:0;font-size:0.85rem;color:#4c1d95;font-weight:500">Fully Completed</p>
          <p style="margin:8px 0 0;font-size:2rem;font-weight:700;color:#4c1d95">{participantsFullyCompleted}</p>
        </div>
        <span style="font-size:2rem">✅</span>
      </div>
    </div>
  </div>

  <!-- Participants Table -->
  <div class="card" style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
    <div style="padding:24px;border-bottom:1px solid #e5e7eb">
      <h2 style="margin:0;font-size:1.25rem;color:#1e293b">
        Participants in {selectedProject} - {selectedGroup}
      </h2>
    </div>

    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse">
        <thead style="background:#f8fafc">
          <tr>
            <th style="padding:14px 16px;text-align:left;font-weight:600;font-size:0.85rem;color:#64748b;border-bottom:1px solid #e5e7eb">
              Name
            </th>
            <th style="padding:14px 16px;text-align:left;font-weight:600;font-size:0.85rem;color:#64748b;border-bottom:1px solid #e5e7eb">
              Email
            </th>
            <th style="padding:14px 16px;text-align:left;font-weight:600;font-size:0.85rem;color:#64748b;border-bottom:1px solid #e5e7eb">
              Enrolled
            </th>
            {#each requiredForms as form}
              <th style="padding:14px 16px;text-align:center;font-weight:600;font-size:0.85rem;color:#64748b;border-bottom:1px solid #e5e7eb">
                {form.name}
              </th>
            {/each}
            <th style="padding:14px 16px;text-align:center;font-weight:600;font-size:0.85rem;color:#64748b;border-bottom:1px solid #e5e7eb">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {#each participants as participant}
            <tr style="transition:background 0.2s" 
                on:mouseenter={(e) => e.currentTarget.style.background = '#f8fafc'}
                on:mouseleave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;font-weight:500;color:#1e293b">
                {participant.name}
              </td>
              <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;color:#64748b">
                {participant.email}
              </td>
              <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;color:#64748b">
                {participant.enrolledDate}
              </td>
              {#each requiredForms as form}
                <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;text-align:center">
                  {#if participant.forms[form.name]?.completed}
                    <div 
                      style="
                        background:#10b981;
                        color:#fff;
                        padding:8px;
                        border-radius:8px;
                        cursor:pointer;
                        transition:all 0.2s
                      "
                      on:mouseenter={(e) => {
                        e.currentTarget.style.background = '#059669';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      on:mouseleave={(e) => {
                        e.currentTarget.style.background = '#10b981';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      title="Completed on {participant.forms[form.name].date}"
                    >
                      <div style="font-weight:600;font-size:0.9rem">✓</div>
                      <div style="font-size:0.75rem;margin-top:2px">{participant.forms[form.name].date}</div>
                      {#if participant.forms[form.name].score !== null}
                        <div style="font-size:0.75rem;font-weight:600;margin-top:2px">Score: {participant.forms[form.name].score}</div>
                      {/if}
                    </div>
                  {:else}
                    <div 
                      style="
                        background:#ef4444;
                        color:#fff;
                        padding:8px;
                        border-radius:8px;
                        cursor:pointer;
                        transition:all 0.2s
                      "
                      on:mouseenter={(e) => {
                        e.currentTarget.style.background = '#dc2626';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      on:mouseleave={(e) => {
                        e.currentTarget.style.background = '#ef4444';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      on:click={() => assignForm(participant)}
                      title="Click to assign form"
                    >
                      <div style="font-weight:600;font-size:0.9rem">✗</div>
                      <div style="font-size:0.7rem;margin-top:2px">Not Complete</div>
                    </div>
                  {/if}
                </td>
              {/each}
              <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;text-align:center">
                <button 
                  on:click={() => viewParticipantDetails(participant)}
                  style="padding:6px 14px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;cursor:pointer;font-size:0.85rem;font-weight:500;color:#64748b;transition:all 0.2s"
                  on:mouseenter={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  on:mouseleave={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  View Details
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</section>

<!-- Enroll Participant Modal -->
{#if showEnrollModal}
  <div 
    class="modal-overlay" 
    style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px"
    on:click={closeModals}
  >
    <div 
      class="modal-content" 
      style="background:#fff;border-radius:16px;padding:32px;max-width:500px;width:100%;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1)"
      on:click|stopPropagation
    >
      <h2 style="margin:0 0 24px;font-size:1.5rem;color:#1e293b">Enroll New Participant</h2>
      
      <form on:submit|preventDefault={handleEnroll}>
        <div style="margin-bottom:20px">
          <label style="display:block;margin-bottom:8px;font-weight:600;color:#1e293b;font-size:0.9rem">
            Full Name
          </label>
          <input 
            type="text" 
            name="name"
            placeholder="Enter participant name"
            style="width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:10px;font-size:1rem"
            required
          />
        </div>

        <div style="margin-bottom:20px">
          <label style="display:block;margin-bottom:8px;font-weight:600;color:#1e293b;font-size:0.9rem">
            Email Address
          </label>
          <input 
            type="email" 
            name="email"
            placeholder="participant@email.com"
            style="width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:10px;font-size:1rem"
            required
          />
        </div>

        <div style="margin-bottom:24px">
          <label style="display:block;margin-bottom:8px;font-weight:600;color:#1e293b;font-size:0.9rem">
            Phone Number (Optional)
          </label>
          <input 
            type="tel" 
            name="phone"
            placeholder="+1 (555) 123-4567"
            style="width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:10px;font-size:1rem"
          />
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end">
          <button 
            type="button"
            on:click={closeModals}
            style="padding:10px 20px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;cursor:pointer;font-size:0.95rem;font-weight:500;color:#64748b"
          >
            Cancel
          </button>
          <button 
            type="submit"
            style="padding:10px 24px;border-radius:8px;background:#6366f1;color:#fff;border:none;cursor:pointer;font-size:0.95rem;font-weight:600"
          >
            Enroll Participant
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Assign Form Modal -->
{#if showAssignFormModal && selectedParticipant}
  <div 
    class="modal-overlay" 
    style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px"
    on:click={closeModals}
  >
    <div 
      class="modal-content" 
      style="background:#fff;border-radius:16px;padding:32px;max-width:500px;width:100%;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1)"
      on:click|stopPropagation
    >
      <h2 style="margin:0 0 16px;font-size:1.5rem;color:#1e293b">Assign Form</h2>
      <p style="margin:0 0 24px;color:#64748b">
        Assign a form to <strong>{selectedParticipant.name}</strong>
      </p>
      
      <form on:submit|preventDefault={handleAssignForm}>
        <div style="margin-bottom:20px">
          <label style="display:block;margin-bottom:8px;font-weight:600;color:#1e293b;font-size:0.9rem">
            Select Form
          </label>
          <select 
            name="formName"
            style="width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:10px;font-size:1rem;cursor:pointer"
            required
          >
            <option value="">Choose a form...</option>
            {#each requiredForms as form}
              <option value={form.name}>{form.name} ({form.type})</option>
            {/each}
          </select>
        </div>

        <div style="margin-bottom:24px">
          <label style="display:block;margin-bottom:8px;font-weight:600;color:#1e293b;font-size:0.9rem">
            Due Date
          </label>
          <input 
            type="date" 
            name="dueDate"
            style="width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:10px;font-size:1rem"
            required
          />
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end">
          <button 
            type="button"
            on:click={closeModals}
            style="padding:10px 20px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;cursor:pointer;font-size:0.95rem;font-weight:500;color:#64748b"
          >
            Cancel
          </button>
          <button 
            type="submit"
            style="padding:10px 24px;border-radius:8px;background:#6366f1;color:#fff;border:none;cursor:pointer;font-size:0.95rem;font-weight:600"
          >
            Assign Form
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .muted { 
    color: #64748b; 
  }

  .stat-card {
    transition: transform 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    table {
      font-size: 0.85rem;
    }
  }
</style>