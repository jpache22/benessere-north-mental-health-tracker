<script>
  import { onMount } from 'svelte';

  const API_BASE =
    "https://benessere-north-mental-health-tracker-backend.julissa-school101.workers.dev";

  let userCount = "—";
  let loading = true;

  // Fetch user data when admin dashboard loads
  onMount(async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.warn("No token found — not logged in.");
      loading = false;
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/adminFetchTable`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("AdminFetchTable:", data);

      if (data.success) {
        userCount = data.payload.count;
      } else {
        console.error("Backend error:", data.error);
      }
    } catch (err) {
      console.error("Network error:", err);
    } finally {
      loading = false;
    }
  });
</script>

<h1 style="margin:0 0 18px">Admin Dashboard</h1>

<!-- Summary cards -->
<div class="grid4">
  <div class="card kpi">
    <h3>System Users</h3>
    <div class="kpi-num">{userCount}</div>
    <p class="muted">Manage and assign user roles</p>
    <a class="btn small outline" href="/admin/users">Manage</a>
  </div>

  <div class="card kpi">
    <h3>Submitted Forms</h3>
    <div class="kpi-num">—</div>
    <p class="muted">View or edit any submitted form</p>
    <a class="btn small outline" href="/admin/forms">Review</a>
  </div>

  <div class="card kpi">
    <h3>Attendance Records</h3>
    <div class="kpi-num">—</div>
    <p class="muted">Monitor and edit attendance</p>
    <a class="btn small outline" href="/admin/attendance">View attendance</a>
  </div>

  <div class="card kpi">
    <h3>Access Requests</h3>
    <div class="kpi-num">—</div>
    <p class="muted">Grant or deny group/project access</p>
    <a class="btn small outline" href="/admin/access">Open queue</a>
  </div>
</div>

<!-- Users & Roles Section -->
<section class="card section">
  <header class="section-head">
    <h2>Users & Roles</h2>
    <a class="btn small" href="/admin/users">Manage</a>
  </header>

  {#if userCount === "—" || loading}
    <div class="empty">Loading user data...</div>
  {:else if userCount === 0}
    <div class="empty">No users found.</div>
  {:else}
    <div class="empty">{userCount} users found. View details inside Users section.</div>
  {/if}
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
  .grid4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 18px;
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
    padding: 18px;
  }

  .kpi h3 {
    margin: 0 0 6px;
  }

  .kpi-num {
    font-size: 1.8rem;
    font-weight: 800;
    margin-bottom: 6px;
  }

  .section {
    margin-bottom: 16px;
  }

  .section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .empty {
    padding: 20px;
    border: 1px dashed var(--border);
    border-radius: 12px;
    color: var(--muted);
    background: #fafafa;
  }
</style>
