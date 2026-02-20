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
  let epdsHistory = [];
  let loading = true;
  let error = '';
  let showCompleted = true; 

  // Available forms (static for now)
  let formsToComplete = [
    { 
      name: 'PHQ-9', 
      status: 'available', 
      link: '/participant/forms/phq9',
      assigned: 'Available',
      due: 'Anytime'
    },
    { 
      name: 'EPDS', 
      status: 'available', 
      link: '/participant/forms/epds',
      assigned: 'Available',
      due: 'Anytime'
    }
  ];

  // Helper function to get severity level info for PHQ-9
  function getPhq9SeverityInfo(score) {
    if (score <= 4) return { level: 'None-minimal', color: '#d1fae5', textColor: '#065f46' };
    if (score <= 9) return { level: 'Mild', color: '#fef3c7', textColor: '#78350f' };
    if (score <= 14) return { level: 'Moderate', color: '#fed7aa', textColor: '#9a3412' };
    if (score <= 19) return { level: 'Moderately Severe', color: '#fecaca', textColor: '#991b1b' };
    return { level: 'Severe', color: '#fee2e2', textColor: '#7f1d1d' };
  }

  // Helper function to get severity level info for EPDS
  function getEpdsSeverityInfo(score) {
    if (score <= 9) return { level: 'Low Risk', color: '#d1fae5', textColor: '#065f46' };
    if (score <= 12) return { level: 'Moderate Risk', color: '#fed7aa', textColor: '#9a3412' };
    return { level: 'High Risk', color: '#fee2e2', textColor: '#7f1d1d' };
  }

  // Computed: Combine and sort PHQ-9 and EPDS history
  $: completedForms = (() => {
    const phq9Forms = phq9History.map(form => {
      const severity = getPhq9SeverityInfo(form.total_score);
      return {
        name: 'PHQ-9',
        date: new Date(form.completion_date),
        dateString: new Date(form.completion_date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        score: `${form.total_score}/27`,
        severity: severity.level,
        severityColor: severity.color,
        severityTextColor: severity.textColor
      };
    });

    const epdsForms = epdsHistory.map(form => {
      const severity = getEpdsSeverityInfo(form.total_score);
      return {
        name: 'EPDS',
        date: new Date(form.completion_date),
        dateString: new Date(form.completion_date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        score: `${form.total_score}/30`,
        severity: severity.level,
        severityColor: severity.color,
        severityTextColor: severity.textColor
      };
    });

    // Combine both arrays and sort by date (most recent first)
    return [...phq9Forms, ...epdsForms]
      .sort((a, b) => b.date - a.date)
      .slice(0, 5); // Show 5 most recent
  })();

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
        console.log('Loaded PHQ-9 history:', phq9History.length, 'submissions');
      } else if (phq9Res.status === 404) {
        phq9History = [];
        console.log('No PHQ-9 submissions found for this user');
      }

      // Fetch EPDS history
      const epdsRes = await fetch(`${API_BASE}/epds/${userId}`);
      const epdsData = await epdsRes.json();

      if (epdsData.success && epdsData.epds) {
        epdsHistory = epdsData.epds;
        console.log('Loaded EPDS history:', epdsHistory.length, 'submissions');
      } else if (epdsRes.status === 404) {
        epdsHistory = [];
        console.log('No EPDS submissions found for this user');
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

  <!-- Error message -->
  {#if error}
    <div style="background:#fee2e2;border:1px solid #fca5a5;color:#991b1b;border-radius:12px;padding:14px 16px;margin-bottom:20px">
      {error}
    </div>
  {/if}

  <!-- Loading state -->
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
        <!-- Empty state when no submissions -->
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
                    <td style="padding:12px 16px;border-bottom:1px solid var(--border)">{form.dateString}</td>
                    <td style="padding:12px 16px;border-bottom:1px solid var(--border);font-weight:600">{form.score}</td>
                    <td style="padding:12px 16px;border-bottom:1px solid var(--border)">
                      <span style="padding:4px 12px;border-radius:12px;font-size:0.875rem;font-weight:500;background:{form.severityColor};color:{form.severityTextColor}">
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