<script>
  import { onMount } from "svelte";
  import { getAuthSession, getRoleHomePath } from "$lib/auth";

  let tiltX = 0;
  let tiltY = 0;
  let glowX = 50;
  let glowY = 40;
  let isAuthenticated = false;
  let dashboardPath = "/landing";
  let reveal = false;
  const roleCards = [
    {
      role: "Coordinator",
      summary: "Manage projects, groups, schedules, and assignment cycles.",
      insight: "Owns team operations, timeline setup, and participant flow across the full care program."
    },
    {
      role: "Therapist",
      summary: "Review participant progress and maintain session continuity.",
      insight: "Tracks outcomes over time, documents attendance patterns, and acts on missed-session risk quickly."
    },
    {
      role: "Participant",
      summary: "Complete forms and monitor personal milestones in one portal.",
      insight: "Sees upcoming forms, completion history, and progress in a simple, private experience."
    }
  ];

  function handleCardMove(event) {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - left) / width;
    const py = (event.clientY - top) / height;

    glowX = Math.max(0, Math.min(100, px * 100));
    glowY = Math.max(0, Math.min(100, py * 100));
    tiltY = (px - 0.5) * 10;
    tiltX = (0.5 - py) * 8;
  }

  function resetCard() {
    tiltX = 0;
    tiltY = 0;
    glowX = 50;
    glowY = 40;
  }

  onMount(() => {
    const session = getAuthSession();
    isAuthenticated = session.authenticated;
    dashboardPath = getRoleHomePath(session.role);
    requestAnimationFrame(() => {
      reveal = true;
    });
  });
</script>

<main class="landing-shell {reveal ? 'is-visible' : ''}">
  <section class="hero container reveal delay-1">
    <div class="hero-copy reveal delay-2">
      <p class="eyebrow">Mental health operations platform</p>
      <h1>A professional workspace for outcomes, attendance, and care coordination.</h1>
      <p class="sub">
        Benessere North helps coordinators, therapists, and participants stay aligned
        with role-based workflows, progress visibility, and secure form operations.
      </p>
      <div class="cta-row">
        <a class="btn" href={isAuthenticated ? dashboardPath : "/login"}>
          {isAuthenticated ? "Go to dashboard" : "Open workspace"}
        </a>
        <a class="btn outline" href="#features">Explore platform</a>
      </div>
      <ul class="trust-row" aria-label="Trust and security highlights">
        <li>Encrypted traffic</li>
        <li>Role-scoped access</li>
        <li>Cloudflare deployment</li>
      </ul>
    </div>

    <div class="hero-art reveal delay-3">
      <div
        class="interactive-panel"
        on:mousemove={handleCardMove}
        on:mouseleave={resetCard}
        style={`--tilt-x:${tiltX}deg; --tilt-y:${tiltY}deg; --glow-x:${glowX}%; --glow-y:${glowY}%;`}
      >
        <div class="panel-header">
          <span class="panel-title">Live Program Snapshot</span>
          <span class="panel-status">Healthy</span>
        </div>
        <div class="panel-grid">
          <article>
            <h3>Completion</h3>
            <p>92%</p>
          </article>
          <article>
            <h3>Engagement</h3>
            <p>High</p>
          </article>
          <article>
            <h3>Open actions</h3>
            <p>14</p>
          </article>
        </div>
        <div class="bars" aria-hidden="true">
          <span style="--h:36%"></span>
          <span style="--h:58%"></span>
          <span style="--h:44%"></span>
          <span style="--h:72%"></span>
          <span style="--h:65%"></span>
          <span style="--h:84%"></span>
          <span style="--h:68%"></span>
        </div>
      </div>
    </div>
  </section>

  <section id="features" class="features container reveal delay-2">
    <h2>Designed for teams that need clarity and control</h2>
    <div class="feature-grid">
      <article class="feature-card">
        <h3>Structured Form Delivery</h3>
        <p>Assign standard and custom forms by role, group, and timeline.</p>
      </article>
      <article class="feature-card">
        <h3>Attendance Overview</h3>
        <p>Track participation patterns and identify follow-up needs quickly.</p>
      </article>
      <article class="feature-card">
        <h3>Operational Visibility</h3>
        <p>See completion health, exceptions, and throughput in one place.</p>
      </article>
      <article class="feature-card">
        <h3>Secure by Default</h3>
        <p>Built with role boundaries and least-privilege access patterns.</p>
      </article>
    </div>
  </section>

  <section id="roles" class="roles container reveal delay-3">
    <h2>Purpose-built for each role</h2>
    <div class="role-grid">
      {#each roleCards as role}
        <button type="button" class="role-flip" aria-label={"Flip " + role.role + " role card"}>
          <div class="role-flip-inner">
            <div class="role-face role-front">
              <h3>{role.role}</h3>
              <p>{role.summary}</p>
            </div>
            <div class="role-face role-back">
              <h3>{role.role} Insight</h3>
              <p>{role.insight}</p>
            </div>
          </div>
        </button>
      {/each}
    </div>
  </section>

  <section id="contact" class="cta container reveal delay-4">
    <div class="cta-card">
      <h2>Launch your next program with a cleaner workflow.</h2>
      <p>Set up teams, assign forms, and start tracking progress in minutes.</p>
      <div class="cta-row">
        {#if isAuthenticated}
          <a class="btn" href={dashboardPath}>Go to dashboard</a>
          <a class="btn outline" href="/profile">Profile</a>
        {:else}
          <a class="btn" href="/login">Log in</a>
          <a class="btn outline" href="/register">Request access</a>
        {/if}
      </div>
    </div>
  </section>
</main>

<style>
  .landing-shell .reveal {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 700ms ease, transform 700ms ease;
  }

  .landing-shell.is-visible .reveal {
    opacity: 1;
    transform: none;
  }

  .landing-shell .delay-1 { transition-delay: 60ms; }
  .landing-shell .delay-2 { transition-delay: 140ms; }
  .landing-shell .delay-3 { transition-delay: 220ms; }
  .landing-shell .delay-4 { transition-delay: 300ms; }

  @media (prefers-reduced-motion: reduce) {
    .landing-shell .reveal {
      opacity: 1;
      transform: none;
      transition: none;
    }
  }

  .hero {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 28px;
    align-items: center;
    min-height: 64vh;
  }

  .eyebrow {
    margin: 0 0 10px;
    color: #0f766e;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .hero-copy h1 {
    margin: 0 0 12px;
    font-size: clamp(2rem, 2.8vw, 3rem);
    line-height: 1.1;
  }

  .sub {
    margin: 0 0 18px;
    color: var(--muted);
    max-width: 62ch;
  }

  .cta-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .trust-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    list-style: none;
    margin: 16px 0 0;
    padding: 0;
  }

  .trust-row li {
    padding: 7px 12px;
    border-radius: 999px;
    border: 1px solid #dbe7de;
    background: #ffffff;
    color: #1f2937;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .hero-art {
    position: relative;
    min-height: 320px;
    display: grid;
    place-items: center;
  }

  .interactive-panel {
    width: min(420px, 100%);
    border-radius: 20px;
    border: 1px solid #d8e2db;
    background:
      radial-gradient(circle at var(--glow-x) var(--glow-y), rgba(34, 197, 94, 0.25), transparent 42%),
      linear-gradient(160deg, #ffffff 0%, #f7fbf7 55%, #eef7f0 100%);
    padding: 18px;
    box-shadow: 0 20px 44px rgba(15, 23, 42, 0.12);
    transform: perspective(1000px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
    transition: transform 120ms ease-out, box-shadow 200ms ease;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }

  .panel-title {
    font-weight: 700;
    color: #0f172a;
  }

  .panel-status {
    font-size: 0.8rem;
    font-weight: 700;
    color: #166534;
    background: #dcfce7;
    padding: 5px 10px;
    border-radius: 999px;
  }

  .panel-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 14px;
  }

  .panel-grid article {
    background: #ffffff;
    border: 1px solid #deeadf;
    border-radius: 12px;
    padding: 10px;
  }

  .panel-grid h3 {
    margin: 0 0 4px;
    font-size: 0.82rem;
    color: #475569;
    font-weight: 600;
  }

  .panel-grid p {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 800;
    color: #0f172a;
  }

  .bars {
    display: flex;
    align-items: end;
    gap: 8px;
    padding: 10px;
    height: 108px;
    background: #ffffff;
    border: 1px solid #deeadf;
    border-radius: 12px;
  }

  .bars span {
    flex: 1;
    height: var(--h);
    border-radius: 8px 8px 4px 4px;
    background: linear-gradient(180deg, #34d399 0%, #22c55e 100%);
  }

  .features h2,
  .roles h2,
  .cta h2 {
    margin: 0 0 14px;
  }

  .feature-grid,
  .role-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .feature-card {
    background: #ffffff;
    border: 1px solid #e2e8e4;
    border-radius: 14px;
    padding: 16px;
  }

  .feature-card h3 {
    margin: 0 0 8px;
    font-size: 1rem;
  }

  .feature-card p {
    margin: 0;
    color: var(--muted);
  }

  .role-flip {
    width: 100%;
    border: 0;
    background: transparent;
    padding: 0;
    text-align: left;
    cursor: pointer;
    perspective: 1000px;
    min-height: 168px;
  }

  .role-flip:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--brand) 70%, #ffffff);
    outline-offset: 4px;
    border-radius: 16px;
  }

  .role-flip-inner {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 168px;
    transform-style: preserve-3d;
    transition: transform 600ms cubic-bezier(.2, .7, .2, 1);
  }

  .role-flip:hover .role-flip-inner,
  .role-flip:focus-within .role-flip-inner,
  .role-flip:focus .role-flip-inner {
    transform: rotateY(180deg);
  }

  .role-face {
    position: absolute;
    inset: 0;
    border-radius: 14px;
    border: 1px solid #d9e7dc;
    padding: 16px;
    backface-visibility: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
  }

  .role-front {
    background: linear-gradient(180deg, #ffffff 0%, #f6fbf8 100%);
  }

  .role-back {
    transform: rotateY(180deg);
    background: linear-gradient(180deg, #f0fff4 0%, #dcfce7 100%);
    border-color: #bfe9cb;
  }

  .role-face h3 {
    margin: 0;
    font-size: 1rem;
  }

  .role-face p {
    margin: 0;
    color: #475569;
  }

  :global(:root[data-theme='dark']) .role-front {
    background: linear-gradient(180deg, #111827 0%, #1f2937 100%);
    border-color: #334155;
  }

  :global(:root[data-theme='dark']) .role-back {
    background: linear-gradient(180deg, #0f172a 0%, #14532d 100%);
    border-color: #166534;
  }

  :global(:root[data-theme='dark']) .role-face h3,
  :global(:root[data-theme='dark']) .role-face p {
    color: #e2e8f0;
  }

  .cta-card {
    background: linear-gradient(180deg, #ffffff 0%, #f1f9f3 100%);
    border: 1px solid #d9e7dc;
    border-radius: 18px;
    padding: 28px;
    text-align: center;
  }

  .cta-card p {
    color: var(--muted);
    margin: 0 0 16px;
  }

  .cta-card .cta-row {
    justify-content: center;
  }

  @media (max-width: 1020px) {
    .hero {
      grid-template-columns: 1fr;
      min-height: auto;
    }

    .feature-grid,
    .role-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .feature-grid,
    .role-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
