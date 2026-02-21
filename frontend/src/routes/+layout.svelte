<script>
  import "../app.css";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { clearAuthSession, getAuthSession, getRoleHomePath } from "$lib/auth";

  let open = false;
  let navCollapsed = false;
  let darkMode = false;
  let isAuthenticated = false;
  let dashboardPath = "/landing";

  // current year
  if (typeof window !== "undefined") {
    setTimeout(() => {
      const y = document.getElementById("year");
      if (y) y.textContent = new Date().getFullYear();
    }, 0);
  }

  // logout
  async function signout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (_) {
      // Local-only auth still needs to be cleared if server logout route is unavailable.
    }
    clearAuthSession();
    location.href = "/login";
  }

  function applyTheme(isDark) {
    darkMode = isDark;
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    }
  }

  function toggleTheme() {
    applyTheme(!darkMode);
  }

  function toggleNavCollapsed() {
    navCollapsed = !navCollapsed;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("navCollapsed", navCollapsed ? "1" : "0");
    }
  }

  onMount(() => {
    syncAuth();

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      applyTheme(savedTheme === "dark");
    } else {
      applyTheme(false);
    }

    navCollapsed = localStorage.getItem("navCollapsed") === "1";
  });

  function syncAuth() {
    const session = getAuthSession();
    isAuthenticated = session.authenticated;
    dashboardPath = getRoleHomePath(session.role);
  }

  function enforceSession(pathname) {
    const protectedPrefixes = ["/admin", "/coordinator", "/therapist", "/participant", "/intake", "/profile"];
    const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
    const session = getAuthSession();
    isAuthenticated = session.authenticated;
    dashboardPath = getRoleHomePath(session.role);

    if (isProtected && !session.authenticated) {
      goto("/login");
      return;
    }

    if (pathname.startsWith("/login") && session.authenticated) {
      goto(getRoleHomePath(session.role));
      return;
    }

    const roleHome = getRoleHomePath(session.role);
    if (session.authenticated && pathname.startsWith("/admin") && session.role !== "admin") goto(roleHome);
    if (session.authenticated && pathname.startsWith("/coordinator") && session.role !== "coordinator") goto(roleHome);
    if (session.authenticated && pathname.startsWith("/therapist") && session.role !== "therapist") goto(roleHome);
    if (session.authenticated && pathname.startsWith("/participant") && session.role !== "patient") goto(roleHome);
    if (session.authenticated && pathname.startsWith("/intake") && session.role !== "intake") goto(roleHome);
  }

  $: if (browser) enforceSession($page.url.pathname);
</script>

<!-- 📌 FULL-PAGE FLEX WRAPPER -->
<div class="layout-wrapper">
  <header class="site-header">
    <nav class="nav container" aria-label="Primary">
      <a class="brand" href="/landing">
        <span class="logo">BN</span>
        <span class="brand-text">Benessere North</span>
      </a>
      <button
        class="nav-collapse-btn {navCollapsed ? 'collapsed' : ''}"
        on:click={toggleNavCollapsed}
        aria-label={navCollapsed ? "Expand navigation links" : "Collapse navigation links"}
        aria-pressed={navCollapsed}
        title={navCollapsed ? "Expand navigation" : "Collapse navigation"}
      >
        <span aria-hidden="true">&#10094;</span>
      </button>

      <button
        class="menu-btn"
        aria-label="Toggle menu"
        aria-expanded={open}
        aria-controls="navList"
        on:click={() => (open = !open)}
      >
        ☰
      </button>

      <ul id="navList" class="nav-list {open ? 'show' : ''} {navCollapsed ? 'collapsed' : ''}">
        <li><a class="nav-item" href="/landing#features">Features</a></li>
        <li><a class="nav-item" href="/landing#roles">Roles</a></li>
        <li><a class="nav-item" href="/landing#contact">Contact</a></li>
        {#if isAuthenticated}
          <li><a class="nav-item" href={dashboardPath}>Dashboard</a></li>
          <li><a class="nav-item" href="/profile">Profile</a></li>
        {/if}
        {#if isAuthenticated}
          <li><button class="nav-item" on:click={signout}>Sign out</button></li>
        {:else}
          <li><a class="nav-item" href="/login">Log in</a></li>
        {/if}
      </ul>
    </nav>
    <button
      class="theme-fab {darkMode ? 'dark' : 'light'}"
      on:click={toggleTheme}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={darkMode}
    >
      <span class="theme-switch" aria-hidden="true">
        <span class="theme-knob"></span>
      </span>
      <span class="theme-fab-label">{darkMode ? "Dark mode" : "Light mode"}</span>
    </button>
  </header>

  <!-- FLEXED MAIN CONTENT -->
  <main class="page-body">
    <slot />
  </main>

  <!-- FOOTER ALWAYS AT BOTTOM -->
  <footer class="site-footer">
    <div class="container foot">
      <span>© <span id="year"></span> Benessere North</span>
      <nav class="foot-nav">
        <a href="/landing#features">Features</a>
        <a href="/landing#roles">Roles</a>
        <a href="/landing">Privacy</a>
      </nav>
    </div>
  </footer>
</div>

<style>
  /* CORE STICKY-FOOTER STRUCTURE */
  html, body {
    height: 100%;
  }

  .layout-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;      /* full screen */
  }

  .page-body {
    flex: 1;                /* push footer to bottom */
    display: block;
  }

  .nav {
    padding-right: 120px;
  }

  .nav-collapse-btn {
    margin-left: auto;
    width: 30px;
    height: 30px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: color-mix(in srgb, var(--card) 84%, transparent);
    color: var(--nav-link);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform .2s, border-color .2s, color .2s;
  }

  .nav-collapse-btn:hover {
    border-color: color-mix(in srgb, var(--brand) 55%, var(--border));
    color: var(--brand);
  }

  .nav-collapse-btn span {
    font-size: 0.85rem;
    transform: translateX(-1px);
    transition: transform .2s;
  }

  .nav-collapse-btn.collapsed span {
    transform: rotate(180deg) translateX(1px);
  }

  .theme-fab {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 40;
    height: 42px;
    padding: 0 12px 0 10px;
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--text);
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color .2s, box-shadow .2s, background .2s;
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
  }

  .theme-fab:hover {
    border-color: color-mix(in srgb, var(--brand) 55%, var(--border));
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
  }

  .theme-switch {
    width: 42px;
    height: 22px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: #e2e8f0;
    position: relative;
    transition: background .25s;
  }

  .theme-knob {
    position: absolute;
    top: 1px;
    left: 1px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.22);
    transition: transform .25s ease;
  }

  .theme-fab.dark .theme-switch {
    background: color-mix(in srgb, var(--brand) 38%, #0f172a);
  }

  .theme-fab.dark .theme-knob {
    transform: translateX(20px);
  }

  .theme-fab-label {
    min-width: 74px;
    text-align: left;
  }

  @media (max-width: 960px) {
    .nav-collapse-btn {
      display: none;
    }

    .nav {
      padding-right: 108px;
    }

    .theme-fab-label {
      display: none;
    }

    .theme-fab {
      padding-right: 10px;
    }
  }
</style>
