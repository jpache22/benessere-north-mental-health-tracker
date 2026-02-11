<script>
  // keep active link handling simple; highlight current route
  import { page } from '$app/stores';
  const is = (p) => $page.url.pathname === p || $page.url.pathname.startsWith(p + '/');
</script>

<div class="shell">
  <nav class="top-nav" aria-label="Therapist navigation">
    <span class="top-title">Therapist</span>
    <div class="top-links">
      <a class:active={is('/therapist')} href="/therapist">Overview</a>
      <a class:active={is('/therapist/sessions')} href="/therapist/sessions">Sessions</a>
      <a class:active={is('/therapist/forms')} href="/therapist/forms">Assigned Forms</a>
      <a class:active={is('/therapist/patients')} href="/therapist/patients">Patients</a>
      <a class:active={is('/therapist/groupOverview')} href="/therapist/groupOverview">Group Overview</a>
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
  .top-nav{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:12px;background:linear-gradient(180deg,#f8fffb,#f4f9ff);border:1px solid var(--border);border-radius:16px;padding:12px 14px;margin:0 0 16px}
  .top-title{font-weight:700;color:#6b7a90;margin:2px 6px 2px 2px}
  .top-links{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:6px;width:100%}
  .top-links a{padding:10px 12px;border-radius:12px;text-decoration:none;color:#0f172a;border:1px solid transparent;text-align:center}
  .top-links a:hover{background:#f8fafc;border-color:#e5e7eb}
  .top-links a.active{background:#ffffff;border-color:#e5e7eb;box-shadow:0 1px 0 rgba(0,0,0,.02)}
  .main .container{padding:8px 0}
  @media (max-width: 640px){.top-nav{grid-template-columns:1fr}.top-title{margin-right:0}}
</style>
