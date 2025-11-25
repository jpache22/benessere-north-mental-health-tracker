<script>
  import { onMount } from 'svelte';

  const API_BASE =
    "https://benessere-north-mental-health-tracker-backend.julissa-school101.workers.dev";

  let userCount = "—";
  let accessCount = "—";
  let formsCount = "—";
  let attendanceCount = "—";

  let loading = true;

  onMount(async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      loading = false;
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/adminFetchTable`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        userCount = data.payload.count;
      }
    } catch (err) {
      console.error(err);
    }

    // Placeholder values until backend provides real counts:
    accessCount = "—";
    formsCount = "—";
    attendanceCount = "—";

    loading = false;
  });
</script>

<h1 style="margin:0 0 22px">Admin Dashboard</h1>

<!-- Summary Grid -->
<div class="grid4">
  <div class="card kpi">
    <h3>Users & Roles</h3>
    <div class="kpi-num">{userCount}</div>
    <p class="muted">Manage and assign user roles</p>
    <a class="btn small outline" href="/admin/users">Manage</a>
  </div>

  <div class="card kpi">
    <h3>Access Requests</h3>
    <div class="kpi-num">{accessCount}</div>
    <p class="muted">Approve or deny access</p>
    <a class="btn small outline" href="/admin/access">Open Queue</a>
  </div>

  <div class="card kpi">
    <h3>Submitted Forms</h3>
    <div class="kpi-num">{formsCount}</div>
    <p class="muted">View & edit submitted forms</p>
    <a class="btn small outline" href="/admin/forms">Review</a>
  </div>

  <div class="card kpi">
    <h3>Attendance</h3>
    <div class="kpi-num">{attendanceCount}</div>
    <p class="muted">Review participation lists</p>
    <a class="btn small outline" href="/admin/attendance">View Attendance</a>
  </div>
</div>


<!-- Users Section -->
<section class="card section">
  <header class="section-head">
    <h2>Users & Roles</h2>
    <a class="btn small" href="/admin/users">Manage</a>
  </header>

  {#if loading}
    <div class="empty">Loading user data...</div>
  {:else}
    <div class="empty">{userCount} users available.</div>
  {/if}
</section>

<!-- Access Requests -->
<section class="card section">
  <header class="section-head">
    <h2>Access Requests</h2>
    <a class="btn small" href="/admin/access">Open Queue</a>
  </header>
  <div class="empty">Access request data not yet available.</div>
</section>

<!-- Submitted Forms -->
<section class="card section">
  <header class="section-head">
    <h2>Submitted Forms</h2>
    <a class="btn small" href="/admin/forms">Review</a>
  </header>
  <div class="empty">No form data available.</div>
</section>

<!-- Attendance -->
<section class="card section">
  <header class="section-head">
    <h2>Attendance Overview</h2>
    <a class="btn small" href="/admin/attendance">View Attendance</a>
  </header>
  <div class="empty">Attendance data not yet available.</div>
</section>

<style>
  h1 {
    font-size: 1.8rem;
    font-weight: 700;
  }

  .grid4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
    margin-bottom: 24px;
  }

  @media (max-width: 1100px) {
    .grid4 {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 640px) {
    .grid4 {
      grid-template-columns: 1fr;
    }
  }

  .card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
  }

  .kpi h3 {
    margin: 0 0 6px;
  }

  .kpi-num {
    font-size: 1.9rem;
    font-weight: 800;
    margin-bottom: 6px;
  }

  .section {
    margin-bottom: 24px;
  }

  .section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .empty {
    padding: 22px;
    border: 1px dashed var(--border);
    border-radius: 12px;
    background: #fafafa;
    color: var(--muted);
  }
</style>
