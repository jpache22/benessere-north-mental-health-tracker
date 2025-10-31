<!-- Therapist Overview page content (no header/footer here) -->
<div class="page-head">
  <h1>Dashboard</h1>
  <p class="muted">Overview of your work. Data will appear once connected.</p>
</div>

<!-- KPI shells -->
<section class="kpis" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
  <div class="card kpi" style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:14px;display:grid;gap:6px">
    <span class="k-label muted">Patients Assigned</span>
    <strong class="k-value" id="kPatients">—</strong>
    <span class="k-delta" id="kPatientsDelta"></span>
  </div>

  <div class="card kpi" style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:14px;display:grid;gap:6px">
    <span class="k-label muted">Forms Due Today</span>
    <strong class="k-value" id="kFormsDue">—</strong>
    <span class="k-delta" id="kFormsDelta"></span>
  </div>

  <!-- Sessions card links to the sessions route -->
  <a href="/therapist/sessions" class="card kpi link-card" style="text-decoration:none;color:inherit;background:#fff;border:1px solid var(--border);border-radius:14px;padding:14px;display:grid;gap:6px;transition:transform .08s, box-shadow .16s">
    <span class="k-label muted">Sessions This Week</span>
    <strong class="k-value" id="kSessions">—</strong>
    <span class="k-delta" id="kSessionsDelta"></span>
  </a>

  <div class="card kpi kpi-donut" style="background:#fff;border:1px solid var(--border);border-radius:14px;padding:14px;display:flex;gap:12px;align-items:center">
    <div class="donut" role="img" aria-label="Completion 0%" style="width:64px;height:64px;border-radius:50%;background:conic-gradient(#22c55e 0%, #eef2f7 0);display:grid;place-items:center">
      <div style="width:44px;height:44px;border-radius:50%;background:#fff;border:1px solid var(--border)"></div>
    </div>
    <div class="donut-meta">
      <span class="k-label muted">Form Completion</span>
      <strong class="k-value" id="kCompletion">0%</strong>
      <span class="k-delta muted">Last 7 days</span>
    </div>
  </div>
</section>

<!-- Two-column shells -->
<section class="grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px">
  <!-- Actions -->
  <div class="card section-card" style="background:#fff;border:1px solid var(--border);border-radius:16px">
    <div class="card-head" style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid var(--border)">
      <h2>Today’s Actions</h2>
      <button class="tiny" disabled>+ Add</button>
    </div>
    <div class="empty" style="padding:16px;text-align:center">
      <p>No actions to show yet.</p>
      <small class="muted">This will populate from your database.</small>
    </div>
  </div>

  <!-- Patients table -->
  <div class="card table" style="background:#fff;border:1px solid var(--border);border-radius:16px">
    <div class="card-head" style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid var(--border)">
      <h2>Patients Overview</h2>
      <a class="tiny outline" href="#" aria-disabled="true">View all</a>
    </div>
    <div class="table-wrap" role="region" aria-label="Patients" style="overflow:auto;border-radius:16px">
      <table style="width:100%;border-collapse:separate;border-spacing:0">
        <thead>
          <tr>
            <th style="padding:12px 14px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted)">Patient</th>
            <th style="padding:12px 14px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted)">Group</th>
            <th style="padding:12px 14px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted)">Last Activity</th>
            <th style="padding:12px 14px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted)">Forms Due</th>
            <th style="padding:12px 14px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted)">Status</th>
          </tr>
        </thead>
        <tbody id="patientsBody">
          <!-- empty -->
        </tbody>
      </table>
      <div class="empty table-empty" style="padding:16px;text-align:center">
        <p>No patients loaded.</p>
        <small class="muted">Connect API to populate this table.</small>
      </div>
    </div>
  </div>
</section>

<style>
  .muted{color:var(--muted)}
  .link-card:hover{transform:translateY(-2px);box-shadow:0 8px 18px rgba(0,0,0,.06)}
</style>