<!-- src/routes/landing/+page.svelte -->
<main>
  <!-- Header/nav come from +layout.svelte automatically -->

  <!-- Hero -->
  <section class="hero container">
    <div class="hero-copy">
      <h1>Track outcomes. Simplify workflows. Support well-being.</h1>
      <p class="sub">
        A simple, secure platform for coordinators, therapists, and participants to
        complete forms, monitor progress, and keep projects moving.
      </p>
      <div class="cta-row">
        <a class="btn" href="/login">Get started</a>
        <a class="btn outline" href="#features">See features</a>
      </div>
      <p class="note">Privacy-first design • Cloudflare-backed • Role-based access</p>
      <ul class="badges" aria-label="Trust badges">
        <li>Encrypted in transit</li>
        <li>Least-privilege roles</li>
        <li>Auditability</li>
      </ul>
    </div>

    <!-- Abstract product preview (no PHQ-9/averages) -->
    <div class="hero-art" aria-hidden="true">
      <div class="card preview">
        <div class="preview-header">
          <div class="dot"></div><div class="dot"></div><div class="dot"></div>
        </div>
        <div class="preview-body">
          <div class="line"></div>
          <div class="line short"></div>
          <div class="pill"></div>
          <div class="grid-ghost">
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features -->
  <section id="features" class="features container">
    <h2>Built for clinical and research teams</h2>
    <div class="grid">
      <article class="feat">
        <h3>Form library</h3>
        <p>Evidence-based and custom forms with version control.</p>
      </article>
      <article class="feat">
        <h3>Assignments</h3>
        <p>Assign form sets per project; automate reminders.</p>
      </article>
      <article class="feat">
        <h3>Dashboards</h3>
        <p>See trends, completion, and follow-ups at a glance.</p>
      </article>
      <article class="feat">
        <h3>Secure & simple</h3>
        <p>Role-based permissions and Cloudflare-backed storage.</p>
      </article>
    </div>
  </section>

  <!-- Roles -->
  <section id="roles" class="roles container">
    <h2>Choose your role</h2>
    <div class="role-grid">
      <a class="role" href="/login"><h3>Therapist</h3><p>Review sessions, assign forms, track outcomes.</p></a>
      <a class="role" href="/login"><h3>Coordinator</h3><p>Manage projects, groups, and study form sets.</p></a>
      <a class="role" href="/login"><h3>Participant</h3><p>Complete forms and view your progress.</p></a>
      <a class="role" href="/login"><h3>Admin</h3><p>Manage users, permissions, and settings.</p></a>
    </div>
  </section>

  <!-- Contact / CTA -->
  <section id="contact" class="cta container">
    <div class="cta-card">
      <h2>Ready to try it with your team?</h2>
      <p>Spin up a pilot, import your groups, and start collecting data in minutes.</p>
      <div class="cta-row">
        <a class="btn" href="/login">Log in</a>
        <a class="btn outline" href="/register">Sign Up</a>
      </div>
    </div>
  </section>
</main>

<style>
  /* You can move these to src/app.css later if you prefer */
  .hero{display:grid;grid-template-columns:1.1fr .9fr;gap:28px;align-items:center;min-height:60vh}
  .hero-copy h1{font-size:2.2rem;line-height:1.15;margin:0 0 10px}
  .sub{color:var(--muted);margin:0 0 18px}
  .cta-row{display:flex;gap:12px;flex-wrap:wrap}
  .note{color:var(--muted);font-size:.95rem;margin-top:10px}
  .badges{display:flex;gap:10px;padding:0;margin:14px 0 0;list-style:none;flex-wrap:wrap}
  .badges li{padding:6px 10px;border:1px solid var(--border);border-radius:10px;background:#fff}
  .hero-art{position:relative;min-height:280px}
  .card.preview{position:absolute;right:0;top:0;width:340px;background:var(--card);border:1px solid var(--border);border-radius:16px;box-shadow:0 16px 30px rgba(0,0,0,.06);overflow:hidden}
  .preview-header{display:flex;gap:6px;padding:10px 12px;border-bottom:1px solid var(--border);background:linear-gradient(180deg,#fafafa,#fff)}
  .preview-header .dot{width:10px;height:10px;border-radius:50%;background:#e5e7eb}
  .preview-body{padding:14px}
  .line{height:10px;background:#eef2f7;border-radius:6px;margin:8px 0 6px}
  .line.short{width:58%}
  .pill{height:32px;border-radius:10px;border:1px dashed var(--border);background:#fafcff;margin:12px 0}
  .grid-ghost{margin-top:8px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .grid-ghost span{display:block;height:46px;border:1px dashed var(--border);border-radius:10px;background:#fbfdff}
  .features .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .features .feat{padding:16px;border:1px solid var(--border);border-radius:16px;background:#fff}
  .roles .role-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .roles .role{display:block;text-decoration:none;color:inherit;padding:16px;border:1px solid var(--border);border-radius:16px;background:#fff}
  .cta .cta-card{background:linear-gradient(180deg,#fff,#f8fafc);border:1px solid var(--border);border-radius:18px;padding:28px;display:grid;gap:10px;text-align:center}
  @media (max-width: 960px){ .hero{grid-template-columns:1fr} }
</style>