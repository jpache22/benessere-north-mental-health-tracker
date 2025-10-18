
<!-- src/routes/participant/+layout.svelte -->
<div class="shell" style="display:grid;grid-template-columns:260px 1fr;gap:20px;align-items:start;min-height:calc(100vh - 140px)">
  <aside class="sidebar" style="background:linear-gradient(180deg,#f0f9ff,#fef3ff);border:1px solid var(--border);border-radius:14px;padding:16px;position:sticky;top:88px;height:fit-content">
    <div class="side-title muted" style="margin:0 0 10px;font-size:1rem">Participant</div>
    <nav class="side-nav" style="display:grid;gap:8px">
      <a href="/participant" class="side-link">Overview</a>
      <a href="/participant/forms" class="side-link">My Forms</a>
      <a href="/participant/history" class="side-link">Form History</a>
      <a href="/participant/profile" class="side-link">Profile</a>
      <a href="/participant/settings" class="side-link">Settings</a>
    </nav>
  </aside>

  <main class="main">
    <div class="container">
      <slot />
    </div>
  </main>
</div>

<style>
  .side-link{display:block;padding:10px 12px;border-radius:12px;text-decoration:none;color:inherit}
  .side-link:hover{background:#fff;border:1px solid var(--border)}
  :global(a[aria-current="page"].side-link){
    background:#fff;border:1px solid var(--border);box-shadow:0 10px 20px rgba(0,0,0,.05)
  }
  .muted{color:var(--muted)}
</style>