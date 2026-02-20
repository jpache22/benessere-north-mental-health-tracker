<script>
  import { page } from '$app/stores';
  const is = (p) => $page.url.pathname === p || $page.url.pathname.startsWith(p + '/');
</script>

<div class="admin-shell">
  <nav class="top-nav" aria-label="Admin navigation">
    <a class="top-title" href="/admin" aria-label="Admin dashboard">Admin</a>
    <div class="top-links">
      <a class:active={is('/admin')} href="/admin">Dashboard</a>
      <a class:active={is('/admin/users')} href="/admin/users">Users & Roles</a>
      <a class:active={is('/admin/groups-projects')} href="/admin/groups-projects">Groups & Projects</a>
      <a class:active={is('/admin/forms')} href="/admin/forms">Forms</a>
      <a class:active={is('/admin/attendance-overview')} href="/admin/attendance-overview">Attendance Overview</a>
      <a class:active={is('/admin/group-overview')} href="/admin/group-overview">Group Overview</a>
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
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
    margin: 0 auto;
    max-width: 1160px;
    padding: 14px 16px;
    background: #ffffff;
    border: 1px solid #dbe5dc;
    border-radius: 16px;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
    color: #fff;
  }

  .top-title {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    padding: 0 14px;
    border-radius: 10px;
    background: linear-gradient(180deg, #1f9f50 0%, #187f3f 100%);
    color: #ffffff;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
  }

  .top-links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .top-links a {
    color: #1e293b;
    text-decoration: none;
    font-weight: 600;
    padding: 9px 12px;
    border-radius: 10px;
    border: 1px solid #d9e5dc;
    text-align: center;
    background: #f7faf7;
    white-space: nowrap;
  }

  .top-links a:hover {
    background: #ecf8ef;
    border-color: #b7d9bf;
  }

  .top-links a.active {
    background: #1f9f50;
    color: #ffffff;
    border-color: #1f9f50;
    box-shadow: 0 3px 10px rgba(31, 159, 80, 0.3);
  }

  .admin-content {
    padding: 24px 24px 48px;
    background: #f8f9fb; /* FIX */
  }

  @media (max-width: 640px) {
    .top-nav {
      padding: 12px;
    }

    .top-title {
      width: 100%;
    }

    .top-links {
      width: 100%;
    }

    .top-links a {
      flex: 1 1 calc(50% - 8px);
    }

    .top-nav,
    .admin-content {
      padding-left: 14px;
      padding-right: 14px;
    }
  }
</style>
