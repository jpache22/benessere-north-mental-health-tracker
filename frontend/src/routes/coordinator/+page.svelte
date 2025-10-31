<script>
  // Pure UI shells; numbers will show once API wired via +page.js later.
</script>

<div class="page-head">
  <h1>Dashboard</h1>
  <p class="muted">Coordinator overview. Data will appear once connected.</p>
</div>

<section class="kpis" style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
  <div class="card kpi"><span class="k-label">Active Groups</span><strong class="k-value">—</strong></div>
  <div class="card kpi"><span class="k-label">Participants</span><strong class="k-value">—</strong></div>
  <div class="card kpi"><span class="k-label">Assignments Due Today</span><strong class="k-value">—</strong></div>
  <div class="card kpi"><span class="k-label">Overdue</span><strong class="k-value">—</strong></div>
</section>

<section class="grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px">
  <div class="card section-card">
    <div class="card-head" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border)">
      <h2>Today’s Actions</h2><button class="tiny" disabled>+ Add</button>
    </div>
    <div class="empty" style="padding:18px;text-align:center">
      <p>No actions to show yet.</p>
      <small class="muted">Connect your API to populate this list.</small>
    </div>
  </div>

  <div class="card table">
    <div class="card-head" style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border)">
      <h2>Recent Activity</h2>
      <a class="tiny outline" href="/coordinator/assignments">View assignments</a>
    </div>
    <div class="empty" style="padding:18px;text-align:center">
      <p>No recent activity.</p>
      <small class="muted">This will populate from your database.</small>
    </div>
  </div>
</section>

<style>
  .card{background:#fff;border:1px solid var(--border);border-radius:16px}
  .kpi{padding:14px;display:grid;gap:6px}
  .k-label{color:var(--muted)} .k-value{font-size:1.4rem;font-weight:800}
</style>
