<!-- src/routes/participant/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  const API_BASE = "https://benessere-north-mental-health-tracker-backend.julissa-school101.workers.dev";

  // User data - will be loaded from localStorage and API
  let participant = {
    name: '',
    email: '',
    group: 'Group 1', // TODO: fetch from backend when group support is added
    session: 8,
    totalSessions: 15,
    nextSession: 'TBD'
  };

  // Forms data
  let phq9History = [];
  let loading = true;
  let error = '';
  let showCompleted = true; 

  // Available forms (static for now)

  let formsToComplete = [
    { 
      name: 'PHQ-9', 
      status: 'available', 
      link: '/participant/forms',
      assigned: 'Available',
      due: 'Anytime'
    }
  ];

  // Computed: Map PHQ-9 history to completed forms
  $: completedForms = phq9History.slice(0, 3).map(form => ({
    name: 'PHQ-9',
    date: new Date(form.completion_date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }),
    score: `${form.total_score}/27`,
    severity: form.depression_severity
  }));

  async function loadUserData() {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');

    if (!userId) {
      goto('/login');
      return;
    }

    // Set basic user info from localStorage
    participant.name = userName || 'Participant';
    participant.email = userEmail || '';

    try {
      // Fetch PHQ-9 history
      const phq9Res = await fetch(`${API_BASE}/phq9/${userId}`);
      const phq9Data = await phq9Res.json();

      if (phq9Data.success && phq9Data.phq9) {
        phq9History = phq9Data.phq9;
        console.log(' Loaded PHQ-9 history:', phq9History.length, 'submissions');
      } else if (phq9Res.status === 404) {
        // No submissions yet - this is OK
        phq9History = [];
        console.log(' No submissions found for this user');
      }

      loading = false;
    } catch (err) {
      console.error('Error loading participant data:', err);
      error = 'Failed to load your data. Please try refreshing the page.';
      loading = false;
    }
  }

  onMount(() => {
    loadUserData();
  });
</script>

<section class="participant-dashboard">
  <!-- Header -->
  <div class="page-head" style="background:linear-gradient(135deg,#e0f2fe,#fce7f3);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:20px">
    <h1 style="margin:0 0 8px">Welcome back, {participant.name}</h1>
    <p class="muted" style="margin:0">
      {#if participant.email}
        {participant.email} • 
      {/if}
      Group: {participant.group} • Session {participant.session} of {participant.totalSessions} • Next session: {participant.nextSession}
    </p>
  </div>

  <!-- ADDED: Error message -->
  {#if error}
    <div style="background:#fee2e2;border:1px solid #fca5a5;color:#991b1b;border-radius:12px;padding:14px 16px;margin-bottom:20px">
      {error}
    </div>
  {/if}

  <!--  ADDED: Loading state -->
  {#if loading}
    <div style="text-align:center;padding:60px 20px;color:#64748b">
      <p style="margin:0;font-size:1.1rem">Loading your dashboard...</p>
    </div>
  {:else}
    <!-- Forms To Complete -->
    <div class="card section-card" style="background:#fff;border:1px solid var(--border);border-radius:16px;margin-bottom:20px">
      <div class="card-head" style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--border);background:#fefce8">
        <h2 style="margin:0;display:flex;align-items:center;gap:8px">
          Forms To Complete
        </h2>
      </div>
      <div class="table-wrap" style="overflow:auto">
        <table style="width:100%;border-collapse:separate;border-spacing:0">
          <thead>
            <tr>
              <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Form Name</th>
              <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Assigned</th>
              <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Due</th>
              <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Action</th>
            </tr>
          </thead>
          <tbody>
            {#each formsToComplete as form}
              <tr>
                <td style="padding:12px 16px;border-bottom:1px solid var(--border)">{form.name}</td>
                <td style="padding:12px 16px;border-bottom:1px solid var(--border)">{form.assigned}</td>
                <td style="padding:12px 16px;border-bottom:1px solid var(--border)">{form.due}</td>
                <td style="padding:12px 16px;border-bottom:1px solid var(--border)">
                  <a href={form.link} style="text-decoration:none">
                    {#if form.status === 'draft'}
                      <button class="btn small" style="background:#3b82f6;color:#fff;border:none;padding:6px 14px;border-radius:8px;cursor:pointer">
                        Continue Draft →
                      </button>
                    {:else}
                      <button class="btn small" style="background:#22c55e;color:#fff;border:none;padding:6px 14px;border-radius:8px;cursor:pointer">
                        Start Form →
                      </button>
                    {/if}
                  </a>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recently Completed Forms -->
    <div class="card section-card" style="background:#fff;border:1px solid var(--border);border-radius:16px">
      <div class="card-head" style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--border)">
        <h2 style="margin:0;display:flex;align-items:center;gap:8px">
          <button on:click={() => showCompleted = !showCompleted} style="background:none;border:none;cursor:pointer;font-size:0.9rem;color:#64748b">
            [{showCompleted ? 'hide' : 'show'}]
          </button>
          Recently Completed Forms
        </h2>
      </div>
      {#if showCompleted}
        <!--  ADDED: Empty state when no submissions -->
        {#if completedForms.length === 0}
          <div style="padding:40px 20px;text-align:center;color:#94a3b8">
            <p style="margin:0">No form submissions yet. Complete your first form to get started!</p>
          </div>
        {:else}
          <div class="table-wrap" style="overflow:auto">
            <table style="width:100%;border-collapse:separate;border-spacing:0">
              <thead>
                <tr>
                  <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Form Name</th>
                  <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Date</th>
                  <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Score</th>
                  <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Severity</th>
                </tr>
              </thead>
              <tbody>
                {#each completedForms as form}
                  <tr>
                    <td style="padding:12px 16px;border-bottom:1px solid var(--border)">{form.name}</td>
                    <td style="padding:12px 16px;border-bottom:1px solid var(--border)">{form.date}</td>
                    <td style="padding:12px 16px;border-bottom:1px solid var(--border);font-weight:600">{form.score}</td>
                    <td style="padding:12px 16px;border-bottom:1px solid var(--border)">
                      <span style="padding:4px 12px;border-radius:12px;font-size:0.875rem;font-weight:500;background:{
                        form.severity === 'None-minimal' ? '#d1fae5' :
                        form.severity === 'Mild' ? '#fef3c7' :
                        form.severity === 'Moderate' ? '#fed7aa' :
                        form.severity === 'Moderately Severe' ? '#fecaca' :
                        '#fee2e2'
                      };color:{
                        form.severity === 'None-minimal' ? '#065f46' :
                        form.severity === 'Mild' ? '#78350f' :
                        form.severity === 'Moderate' ? '#9a3412' :
                        form.severity === 'Moderately Severe' ? '#991b1b' :
                        '#7f1d1d'
                      }">
                        {form.severity}
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      {/if}
    </div>

    <!-- View All History Link -->
    <div style="margin-top:20px;text-align:center">
      <a href="/participant/history" style="color:var(--brand);text-decoration:none;font-size:1rem">
        [View All Form History →]
      </a>
    </div>
  {/if}
</section>

<style>
  .muted{color:var(--muted)}
  .btn.small{font-size:.9rem}
  .btn.outline{background:#fff;border:1px solid var(--border);color:inherit}
  .btn.outline:hover{background:#f8fafc}
</style>