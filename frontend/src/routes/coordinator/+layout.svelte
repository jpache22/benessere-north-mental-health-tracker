<script>
  import { page } from '$app/stores';
  const is = (p) => $page.url.pathname === p || $page.url.pathname.startsWith(p + '/');
</script>

<div class="shell">
  <aside class="sidebar" aria-label="Coordinator navigation">
    <div class="side-title">Coordinator</div>
    <nav class="side-nav">
      <a class:active={is('/coordinator')} href="/coordinator">Overview</a>
      <a class:active={is('/coordinator/groups')} href="/coordinator/groups">Groups</a>
      <a class:active={is('/coordinator/assignments')} href="/coordinator/assignments">Assignments</a>
      <a class:active={is('/coordinator/participants')} href="/coordinator/participants">Participants</a>
    </nav>
  </aside>

  <main class="main">
    <div class="container">
      <slot />
    </div>
  </main>
</div>

<style>
  .shell{display:grid;grid-template-columns:280px 1fr;gap:24px;align-items:start}
  .sidebar{background:linear-gradient(180deg,#f8fffb, #f4f9ff);border:1px solid var(--border);border-radius:16px;padding:16px;position:sticky;top:92px}
  .side-title{font-weight:700;color:#6b7a90;margin:2px 6px 10px}
  .side-nav{display:grid;gap:6px}
  .side-nav a{padding:12px 14px;border-radius:12px;text-decoration:none;color:#0f172a;border:1px solid transparent}
  .side-nav a:hover{background:#f8fafc;border-color:#e5e7eb}
  .side-nav a.active{background:#ffffff;border-color:#e5e7eb;box-shadow:0 1px 0 rgba(0,0,0,.02)}
  .main .container{padding:8px 0}
  @media (max-width: 980px){ .shell{grid-template-columns:1fr} .sidebar{position:static} }
</style>
