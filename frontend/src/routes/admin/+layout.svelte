<script>
  import { page } from '$app/stores';
  const is = (p) => $page.url.pathname === p || $page.url.pathname.startsWith(p + '/');
</script>

<div class="shell">
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

  <main class="main">
    <div class="container admin-content">
      <slot />
    </div>
  </main>
</div>

<style>
  .shell{display:block;min-height:calc(100vh - 140px)}
  .top-nav{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:12px;background:linear-gradient(180deg,#f8fffb,#f4f9ff);border:1px solid var(--border);border-radius:16px;padding:12px 14px;margin:0 0 16px}
  .top-title{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 14px;border-radius:10px;background:linear-gradient(180deg,#1f9f50 0%,#187f3f 100%);color:#ffffff;font-weight:700;text-decoration:none;white-space:nowrap}
  .top-links{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;width:100%}
  .top-links a{padding:10px 12px;border-radius:12px;text-decoration:none;color:#1e293b;border:1px solid #d9e5dc;text-align:center;background:#f7faf7;white-space:nowrap}
  .top-links a:hover{background:#ecf8ef;border-color:#b7d9bf}
  .top-links a.active{background:#1f9f50;color:#ffffff;border-color:#1f9f50;box-shadow:0 3px 10px rgba(31,159,80,.3)}
  .main .admin-content{padding:8px 0 24px}
  @media (max-width: 640px){.top-nav{grid-template-columns:1fr}.top-links{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>
