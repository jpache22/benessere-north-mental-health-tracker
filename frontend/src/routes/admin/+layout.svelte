<script>
  let open = true;
</script>

<div class="admin-shell">
  <aside class="admin-aside" aria-label="Admin navigation">
    <a class="brand-link" href="/landing">
      <span class="logo">BN</span>
      <span class="brand-text">Admin</span>
    </a>

    <nav class="side-nav">
      <a class="side-link" href="/admin">Dashboard</a>
      <a class="side-link" href="/admin/users">Users & Roles</a>
      <a class="side-link" href="/admin/forms">Forms</a>
      <a class="side-link" href="/admin/attendance">Attendance</a>
      <a class="side-link" href="/admin/access">Access Control</a>
    </nav>
  </aside>

  <main class="container admin-content">
    <slot />
  </main>
</div>

<style>
  .admin-shell {
    display: grid;
    grid-template-columns: 260px 1fr;
    min-height: 100vh;
    background: #f8f9fb; /* FIX */
  }

  .admin-aside {
    position: sticky;
    top: 0;
    height: 100vh;
    padding: 20px 16px;
    background: linear-gradient(180deg,#22c55e 0%,#16a34a 100%);
    color: #fff;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .brand-link {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fff;
    text-decoration: none;
    margin-bottom: 6px;
  }

  .logo {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: #fff;
    color: #16a34a;
    display: grid;
    place-items: center;
    font-weight: 800;
  }

  .side-nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }

  .side-link {
    color:#e6ffef;
    text-decoration:none;
    padding:10px 12px;
    border-radius:10px;
    border:1px solid rgba(255,255,255,.15)
  }

  .side-link:hover {
    background: rgba(255,255,255,.12);
  }

  .admin-content {
    padding: 24px 24px 48px;
    background: #f8f9fb; /* FIX */
  }

  @media (max-width:1024px) {
    .admin-shell { grid-template-columns: 1fr; }
    .admin-aside { display: none; }
  }
</style>
