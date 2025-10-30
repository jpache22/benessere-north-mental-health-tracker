<!-- src/routes/participant/+page.svelte -->
<script>
  // Mock data - replace with real data from API
  let participant = {
    name: 'Participant Name',
    group: 'Group 1',
    session: 8,
    totalSessions: 15,
    nextSession: 'Oct 22'
  };

  let formsToComplete = [
    { name: 'PHQ-9', assigned: 'Oct 15', due: 'Oct 22', status: 'not_started' },
    { name: 'GAD-7', assigned: 'Oct 08', due: 'Oct 22', status: 'not_started' },
    { name: 'EPDS', assigned: 'Oct 02', due: 'Oct 22', status: 'draft', progress: 60 }
  ];

  let completedForms = [
    { name: 'Q-LES', assigned: 'Sep 15, 2025', score: '18/27' },
    { name: 'Y-BOCS', assigned: 'Sep 15, 2025', score: '12/24' },
    { name: 'SPS', assigned: 'Sep 01, 2025', score: '10/30' }
  ];

  let showCompleted = true;
</script>

<section class="participant-dashboard">
  <!-- Header -->
  <div class="page-head" style="background:linear-gradient(135deg,#e0f2fe,#fce7f3);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:20px">
    <h1 style="margin:0 0 8px">Welcome back, {participant.name}</h1>
    <p class="muted" style="margin:0">
      Group: {participant.group} • Session {participant.session} of {participant.totalSessions} • Next session: {participant.nextSession}
    </p>
  </div>

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
                  <button class="btn small" style="background:#3b82f6;color:#fff;border:none;padding:6px 14px;border-radius:8px;cursor:pointer">
                    Continue Draft →
                  </button>
                {:else}
                  <button class="btn small" style="background:#22c55e;color:#fff;border:none;padding:6px 14px;border-radius:8px;cursor:pointer">
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
      </h2>
    </div>
    {#if showCompleted}
      <div class="table-wrap" style="overflow:auto">
        <table style="width:100%;border-collapse:separate;border-spacing:0">
          <thead>
            <tr>
              <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Form Name</th>
              <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Assigned</th>
              <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Score</th>
              <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">Action</th>
            </tr>
          </thead>
          <tbody>
            {#each completedForms as form}
              <tr>
                <td style="padding:12px 16px;border-bottom:1px solid var(--border)">{form.name}</td>
                <td style="padding:12px 16px;border-bottom:1px solid var(--border)">{form.assigned}</td>
                <td style="padding:12px 16px;border-bottom:1px solid var(--border)">{form.score}</td>
                <td style="padding:12px 16px;border-bottom:1px solid var(--border)">
                  <button class="btn small outline" style="padding:6px 14px;border-radius:8px;cursor:pointer">
                    View Details
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
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
</style>