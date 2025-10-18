<!-- Sidebar wrapper applied to all /therapist pages -->
<div class="shell" style="display:grid;grid-template-columns:260px 1fr;gap:20px;align-items:start;min-height:calc(100vh - 140px)">
  <aside class="sidebar" style="background:linear-gradient(180deg,#f8fff9,#f5fbff);border:1px solid var(--border);border-radius:14px;padding:16px;position:sticky;top:88px;height:fit-content">
    <div class="side-title muted" style="margin:0 0 10px;font-size:1rem">Therapist</div>
    <nav class="side-nav" style="display:grid;gap:8px">
      <a href="/therapist" class="side-link">Overview</a>
      <a href="/therapist/sessions" class="side-link">Sessions</a>
      <a href="/therapist/forms" class="side-link">Assigned Forms</a>
      <a href="/therapist/patients" class="side-link">Patients</a>
      <a href="/therapist/messages" class="side-link">Messages</a>
      <a href="/therapist/settings" class="side-link">Settings</a>
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
</style>
