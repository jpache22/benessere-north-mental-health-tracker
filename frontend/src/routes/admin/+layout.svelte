<script>
  import { page } from '$app/stores';
  const is = (p) => $page.url.pathname === p || $page.url.pathname.startsWith(p + '/');
</script>

<div class="admin-shell">
  <nav class="top-nav" aria-label="Admin navigation">
    <span class="top-title">Admin</span>
    <div class="top-links">
      <a class:active={is('/admin')} href="/admin">Dashboard</a>
      <a class:active={is('/admin/users')} href="/admin/users">Users & Roles</a>
      <a class:active={is('/admin/groups-projects')} href="/admin/groups-projects">Groups & Projects</a>
      <a class:active={is('/admin/forms')} href="/admin/forms">Forms</a>
      <a class:active={is('/admin/attendance')} href="/admin/attendance">Attendance</a>
      <a class:active={is('/admin/access')} href="/admin/access">Access Control</a>
    </div>
  </nav>

  <main class="container admin-content">
    <slot />
  </main>
</div>

<style>
  .admin-shell {
    display: block;
    min-height: calc(100vh - 140px);
    background: #f8f9fb; /* FIX */
  }

  .top-nav {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 auto;
    max-width: 1120px;
    padding: 14px 24px;
    background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
    border-radius: 14px;
    color: #fff;
    flex-wrap: wrap;
  }

  .top-title {
    font-weight: 700;
    margin-right: 8px;
  }

  .top-links {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .top-links a {
    color: #e6ffef;
    text-decoration: none;
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .top-links a:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .top-links a.active {
    background: #fff;
    color: #166534;
    border-color: #fff;
  }

  .admin-content {
    padding: 24px 24px 48px;
    background: #f8f9fb; /* FIX */
  }

  @media (max-width: 640px) {
    .top-nav,
    .admin-content {
      padding-left: 14px;
      padding-right: 14px;
    }
  }
</style>
