<!-- src/routes/participant/history/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  const API_BASE = "https://benessere-north-mental-health-tracker-backend.julissa-school101.workers.dev";

  // Forms data
  let phq9History = [];
  let epdsHistory = [];
  let loading = true;
  let error = '';
  let selectedForm = 'all'; // 'all', 'phq9', 'epds'

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

  // Computed: Combine and filter form submissions
  $: allSubmissions = (() => {
    let submissions = [];

    if (selectedForm === 'all' || selectedForm === 'phq9') {
      const phq9Forms = phq9History.map(form => {
        const severity = getPhq9SeverityInfo(form.total_score);
        return {
          type: 'PHQ-9',
          date: new Date(form.completion_date),
          dateString: new Date(form.completion_date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          score: `${form.total_score}/27`,
          severity: severity.level,
          severityColor: severity.color,
          severityTextColor: severity.textColor,
          formId: form.form_submission_id
        };
      });
      submissions = [...submissions, ...phq9Forms];
    }

    if (selectedForm === 'all' || selectedForm === 'epds') {
      const epdsForms = epdsHistory.map(form => {
        const severity = getEpdsSeverityInfo(form.total_score);
        return {
          type: 'EPDS',
          date: new Date(form.completion_date),
          dateString: new Date(form.completion_date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          score: `${form.total_score}/30`,
          severity: severity.level,
          severityColor: severity.color,
          severityTextColor: severity.textColor,
          formId: form.form_submission_id
        };
      });
      submissions = [...submissions, ...epdsForms];
    }

    // Sort by date (most recent first)
    return submissions.sort((a, b) => b.date - a.date);
  })();

  // Summary stats
  $: stats = {
    totalPhq9: phq9History.length,
    totalEpds: epdsHistory.length,
    totalSubmissions: phq9History.length + epdsHistory.length,
    lastSubmission: allSubmissions.length > 0 ? allSubmissions[0].dateString : 'None'
  };

  async function loadFormHistory() {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      goto('/login');
      return;
    }

    try {
      // Fetch PHQ-9 history
      const phq9Res = await fetch(`${API_BASE}/phq9/${userId}`);
      const phq9Data = await phq9Res.json();

      if (phq9Data.success && phq9Data.phq9) {
        phq9History = phq9Data.phq9;
        console.log('Loaded PHQ-9 history:', phq9History.length, 'submissions');
      } else if (phq9Res.status === 404) {
        phq9History = [];
        console.log('No PHQ-9 submissions found');
      }

      // Fetch EPDS history
      const epdsRes = await fetch(`${API_BASE}/epds/${userId}`);
      const epdsData = await epdsRes.json();

      if (epdsData.success && epdsData.epds) {
        epdsHistory = epdsData.epds;
        console.log('Loaded EPDS history:', epdsHistory.length, 'submissions');
      } else if (epdsRes.status === 404) {
        epdsHistory = [];
        console.log('No EPDS submissions found');
      }

      loading = false;
    } catch (err) {
      console.error('Error loading form history:', err);
      error = 'Failed to load form history. Please try refreshing the page.';
      loading = false;
    }
  }

  onMount(() => {
    loadFormHistory();
  });
</script>

<svelte:head>
  <title>Form History - Mental Health Tracker</title>
</svelte:head>

<section class="form-history">
  <!-- Header -->
  <div class="page-head" style="margin-bottom:30px">
    <h1 style="margin:0 0 8px">Form Submission History</h1>
    <p class="muted" style="margin:0">
      View all your completed PHQ-9 and EPDS assessments
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
      <p style="margin:0;font-size:1.1rem">Loading your form history...</p>
    </div>
  {:else}
    <!-- Summary Stats -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px">
      <div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:20px">
        <div style="color:#64748b;font-size:0.875rem;margin-bottom:4px">Total Submissions</div>
        <div style="font-size:2rem;font-weight:700;color:#1e293b">{stats.totalSubmissions}</div>
      </div>
      <div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:20px">
        <div style="color:#64748b;font-size:0.875rem;margin-bottom:4px">PHQ-9 Submissions</div>
        <div style="font-size:2rem;font-weight:700;color:#6366f1">{stats.totalPhq9}</div>
      </div>
      <div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:20px">
        <div style="color:#64748b;font-size:0.875rem;margin-bottom:4px">EPDS Submissions</div>
        <div style="font-size:2rem;font-weight:700;color:#f59e0b">{stats.totalEpds}</div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:20px">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button
          on:click={() => selectedForm = 'all'}
          style="
            padding:8px 20px;
            border-radius:8px;
            border:1px solid {selectedForm === 'all' ? '#6366f1' : 'var(--border)'};
            background:{selectedForm === 'all' ? '#eef2ff' : '#fff'};
            color:{selectedForm === 'all' ? '#6366f1' : '#64748b'};
            cursor:pointer;
            font-weight:500;
            transition:all 0.2s;
          "
        >
          All Forms ({stats.totalSubmissions})
        </button>
        <button
          on:click={() => selectedForm = 'phq9'}
          style="
            padding:8px 20px;
            border-radius:8px;
            border:1px solid {selectedForm === 'phq9' ? '#6366f1' : 'var(--border)'};
            background:{selectedForm === 'phq9' ? '#eef2ff' : '#fff'};
            color:{selectedForm === 'phq9' ? '#6366f1' : '#64748b'};
            cursor:pointer;
            font-weight:500;
            transition:all 0.2s;
          "
        >
          PHQ-9 Only ({stats.totalPhq9})
        </button>
        <button
          on:click={() => selectedForm = 'epds'}
          style="
            padding:8px 20px;
            border-radius:8px;
            border:1px solid {selectedForm === 'epds' ? '#6366f1' : 'var(--border)'};
            background:{selectedForm === 'epds' ? '#eef2ff' : '#fff'};
            color:{selectedForm === 'epds' ? '#6366f1' : '#64748b'};
            cursor:pointer;
            font-weight:500;
            transition:all 0.2s;
          "
        >
          EPDS Only ({stats.totalEpds})
        </button>
      </div>
    </div>

    <!-- Submissions Table -->
    {#if allSubmissions.length === 0}
      <div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:60px 20px;text-align:center">
        <p style="margin:0;color:#94a3b8;font-size:1.1rem">
          No form submissions found.
          {#if selectedForm !== 'all'}
            Try selecting "All Forms" or complete a new assessment.
          {:else}
            Complete your first assessment to get started!
          {/if}
        </p>
      </div>
    {:else}
      <div style="background:#fff;border:1px solid var(--border);border-radius:12px;overflow:hidden">
        <div class="table-wrap" style="overflow:auto">
          <table style="width:100%;border-collapse:separate;border-spacing:0">
            <thead>
              <tr>
                <th style="padding:14px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Form Type</th>
                <th style="padding:14px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Submission Date</th>
                <th style="padding:14px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Score</th>
                <th style="padding:14px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Severity/Risk</th>
                <th style="padding:14px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Form ID</th>
              </tr>
            </thead>
            <tbody>
              {#each allSubmissions as submission}
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid var(--border)">
                    <span style="
                      padding:4px 10px;
                      border-radius:6px;
                      font-size:0.875rem;
                      font-weight:600;
                      background:{submission.type === 'PHQ-9' ? '#eef2ff' : '#fef3c7'};
                      color:{submission.type === 'PHQ-9' ? '#6366f1' : '#f59e0b'};
                    ">
                      {submission.type}
                    </span>
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid var(--border);color:#64748b">
                    {submission.dateString}
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid var(--border);font-weight:600;color:#1e293b">
                    {submission.score}
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid var(--border)">
                    <span style="
                      padding:4px 12px;
                      border-radius:12px;
                      font-size:0.875rem;
                      font-weight:500;
                      background:{submission.severityColor};
                      color:{submission.severityTextColor};
                    ">
                      {submission.severity}
                    </span>
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid var(--border);color:#94a3b8;font-family:monospace;font-size:0.875rem">
                    #{submission.formId}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

    <!-- Back Link -->
    <div style="margin-top:32px;text-align:center">
      <a href="/participant" style="color:var(--brand);text-decoration:none;font-size:1rem">
        [← Back to Dashboard]
      </a>
    </div>
  {/if}
</section>

<style>
  .muted {
    color: var(--muted);
  }
  
  button:hover {
    transform: translateY(-1px);
  }
</style>