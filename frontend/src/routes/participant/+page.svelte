<!-- src/routes/participant/+page.svelte -->
<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // TODO: Replace with actual user data from authentication
  let participant = {
    name: 'Participant Name',
    group: 'Group 1',
    session: 8,
    totalSessions: 15,
    nextSession: 'Oct 22'
  };

  // Forms configuration - map form names to their routes
  const formRoutes = {
    'PHQ-9': '/participant/forms',  // Your PHQ-9 form route
    'GAD-7': '/participant/forms/gad7',  // TODO: Create this form
    'EPDS': '/participant/forms/epds'    // TODO: Create this form
  };

  // TODO: Replace with real data from API
  let formsToComplete = [
    { name: 'PHQ-9', assigned: 'Oct 15', due: 'Oct 22', status: 'not_started' },
    { name: 'GAD-7', assigned: 'Oct 08', due: 'Oct 22', status: 'not_started' },
    { name: 'EPDS', assigned: 'Oct 02', due: 'Oct 22', status: 'draft', progress: 60 }
  ];

  // This will be replaced with real data from the database
  let completedForms = [];

  let showCompleted = true;
  let isLoading = false;
  let errorMessage = '';

  // Function to handle form navigation
  function startForm(formName) {
    const route = formRoutes[formName];
    if (route) {
      goto(route);
    } else {
      console.error(`Route not defined for form: ${formName}`);
      errorMessage = `Form ${formName} is not yet available`;
      setTimeout(() => errorMessage = '', 3000);
    }
  }

  // Function to continue a draft
  function continueDraft(formName) {
    // Same as startForm, but you might want to load saved draft data
    startForm(formName);
  }

  // Function to view form details
  function viewFormDetails(formId) {
    // TODO: Implement view details functionality
    console.log('View details for form:', formId);
  }

  // Fetch real completed forms data
  async function fetchCompletedForms() {
    isLoading = true;
    try {
      // TODO: Replace with actual user ID from authentication
      const userId = 1;
      const apiUrl = import.meta.env.VITE_API_URL;
      
      // Fetch PHQ-9 data for this user
      const response = await fetch(`${apiUrl}/phq9/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.phq9) {
          // Transform the data to match our display format
          completedForms = data.phq9.map(form => ({
            id: form.form_submission_id,
            name: 'PHQ-9',
            assigned: new Date(form.completion_date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            score: `${form.total_score}/27`,
            severity: form.depression_severity,
            rawData: form
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching completed forms:', error);
      // Keep the completed forms empty if there's an error
      completedForms = [];
    } finally {
      isLoading = false;
    }
  }

  // Fetch data on component mount
  onMount(() => {
    fetchCompletedForms();
  });
</script>

<section class="participant-dashboard">
  <!-- Header -->
  <div class="page-head" style="background:linear-gradient(135deg,#e0f2fe,#fce7f3);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:20px">
    <h1 style="margin:0 0 8px">Welcome back, {participant.name}</h1>
    <p class="muted" style="margin:0">
      Group: {participant.group} • Session {participant.session} of {participant.totalSessions} • Next session: {participant.nextSession}
    </p>
  </div>

  <!-- Error Message -->
  {#if errorMessage}
    <div class="alert error" style="background:#fee2e2;border:1px solid #fca5a5;padding:12px 16px;border-radius:10px;margin-bottom:20px;color:#991b1b">
      {errorMessage}
    </div>
  {/if}

  <!-- Forms To Complete -->
  <div class="card section-card" style="background:#fff;border:1px solid var(--border);border-radius:16px;margin-bottom:20px">
    <div class="card-head" style="display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--border);background:#fefce8">
      <h2 style="margin:0;display:flex;align-items:center;gap:8px">
        <span style="font-size:1.4rem">📋</span>
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
                {#if form.status === 'draft'}
                  <button 
                    class="btn small" 
                    style="background:#3b82f6;color:#fff;border:none;padding:6px 14px;border-radius:8px;cursor:pointer"
                    on:click={() => continueDraft(form.name)}
                  >
                    Continue Draft →
                  </button>
                {:else}
                  <button 
                    class="btn small" 
                    style="background:#22c55e;color:#fff;border:none;padding:6px 14px;border-radius:8px;cursor:pointer"
                    on:click={() => startForm(form.name)}
                  >
                    Start Form →
                  </button>
                {/if}
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
        <button on:click={() => showCompleted = !showCompleted} style="background:none;border:none;cursor:pointer;font-size:1rem">
          {showCompleted ? '✓' : '○'}
        </button>
        Recently Completed Forms
        {#if isLoading}
          <span style="font-size:0.8rem;color:#6366f1">(Loading...)</span>
        {/if}
      </h2>
    </div>
    {#if showCompleted}
      <div class="table-wrap" style="overflow:auto">
        {#if completedForms.length > 0}
          <table style="width:100%;border-collapse:separate;border-spacing:0">
            <thead>
              <tr>
                <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Form Name</th>
                <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Completed</th>
                <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Score</th>
                <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Severity</th>
                <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Action</th>
              </tr>
            </thead>
            <tbody>
              {#each completedForms as form}
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid var(--border)">{form.name}</td>
                  <td style="padding:12px 16px;border-bottom:1px solid var(--border)">{form.assigned}</td>
                  <td style="padding:12px 16px;border-bottom:1px solid var(--border);font-weight:600">{form.score}</td>
                  <td style="padding:12px 16px;border-bottom:1px solid var(--border)">
                    <span style="
                      padding:4px 8px;
                      border-radius:6px;
                      font-size:0.85rem;
                      background:{form.severity === 'None-minimal' ? '#d1fae5' : 
                                 form.severity === 'Mild' ? '#fed7aa' :
                                 form.severity === 'Moderate' ? '#fef3c7' :
                                 form.severity === 'Moderately Severe' ? '#fed7e2' :
                                 '#fee2e2'};
                      color:{form.severity === 'None-minimal' ? '#065f46' : 
                            form.severity === 'Mild' ? '#9a3412' :
                            form.severity === 'Moderate' ? '#92400e' :
                            form.severity === 'Moderately Severe' ? '#9f1239' :
                            '#991b1b'}
                    ">
                      {form.severity}
                    </span>
                  </td>
                  <td style="padding:12px 16px;border-bottom:1px solid var(--border)">
                    <button 
                      class="btn small outline" 
                      style="padding:6px 14px;border-radius:8px;cursor:pointer"
                      on:click={() => viewFormDetails(form.id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {:else if !isLoading}
          <div style="padding:40px;text-align:center;color:var(--muted)">
            <p style="margin:0">No completed forms yet</p>
            <p style="margin:8px 0 0;font-size:0.9rem">Complete your first form to see your progress here!</p>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- View All History Link -->
  <div style="margin-top:20px;text-align:center">
    <a href="/participant/history" style="color:var(--brand);text-decoration:none;font-size:1rem">
      [View All Form History →]
    </a>
  </div>
</section>

<style>
  .muted{color:var(--muted)}
  .btn.small{font-size:.9rem}
  .btn.outline{background:#fff;border:1px solid var(--border);color:inherit}
  .btn.outline:hover{background:#f8fafc}
  .btn:hover{opacity:0.9;transform:translateY(-1px);transition:all 0.2s}
</style>