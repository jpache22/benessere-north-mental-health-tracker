
<!-- src/routes/participant/+layout.svelte -->
<div class="shell">
  <nav class="top-nav" aria-label="Participant navigation">
    <span class="top-title muted">Participant</span>
    <div class="top-links">
      <a href="/participant" class="side-link">Overview</a>
      <a href="/participant/forms" class="side-link">My Forms</a>
      <a href="/participant/history" class="side-link">Form History</a>
      <a href="/participant/profile" class="side-link">Profile</a>
      <a href="/participant/settings" class="side-link">Settings</a>
    </div>
  </nav>

  <main class="main">
    <div class="container">
      <slot />
    </div>
  </main>
</div>

<style>
  .shell{display:block;min-height:calc(100vh - 140px)}
  .top-nav{display:flex;align-items:center;gap:12px;background:linear-gradient(180deg,#f0f9ff,#fef3ff);border:1px solid var(--border);border-radius:14px;padding:12px 14px;margin:0 0 16px;flex-wrap:wrap}
  .top-title{margin:2px 6px 2px 2px;font-size:1rem}
  .top-links{display:flex;flex-wrap:wrap;gap:8px}
  .side-link{display:block;padding:10px 12px;border-radius:12px;text-decoration:none;color:inherit}
  .side-link:hover{background:#fff;border:1px solid var(--border)}
  :global(a[aria-current="page"].side-link){
    background:#fff;border:1px solid var(--border);box-shadow:0 10px 20px rgba(0,0,0,.05)
  }
  .muted{color:var(--muted)}
</style>
