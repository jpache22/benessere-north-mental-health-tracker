<script>
  import { page } from '$app/stores';
  const is = (p) => $page.url.pathname === p || $page.url.pathname.startsWith(p + '/');
</script>

<div class="shell">
  <nav class="top-nav" aria-label="Coordinator navigation">
    <span class="top-title">Coordinator</span>
    <div class="top-links">
      <a class:active={is('/coordinator')} href="/coordinator">Overview</a>
      <a class:active={is('/coordinator/groups')} href="/coordinator/groups">Groups</a>
      <a class:active={is('/coordinator/users')} href="/coordinator/users">Users & Roles</a>
      <a class:active={is('/coordinator/assignments')} href="/coordinator/assignments">Assignments</a>
      <a class:active={is('/coordinator/forms')} href="/coordinator/forms">Forms</a>
      <a class:active={is('/coordinator/participants')} href="/coordinator/participants">Participants</a>
    </div>
  </nav>

  <main class="main">
    <div class="container">
      <slot />
    </div>
  </main>
</div>

<style>
  .shell{display:block}
  .top-nav{display:flex;align-items:center;gap:12px;background:linear-gradient(180deg,#f8fffb,#f4f9ff);border:1px solid var(--border);border-radius:16px;padding:12px 14px;margin:0 0 16px;flex-wrap:wrap}
  .top-title{font-weight:700;color:#6b7a90;margin:2px 6px 2px 2px}
  .top-links{display:flex;flex-wrap:wrap;gap:6px}
  .top-links a{padding:10px 12px;border-radius:12px;text-decoration:none;color:#0f172a;border:1px solid transparent}
  .top-links a:hover{background:#f8fafc;border-color:#e5e7eb}
  .top-links a.active{background:#ffffff;border-color:#e5e7eb;box-shadow:0 1px 0 rgba(0,0,0,.02)}
  .main .container{padding:8px 0}
</style>
