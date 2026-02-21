<script>
  import "../app.css";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { clearAuthSession, getAuthSession, getRoleHomePath } from "$lib/auth";

  let open = false;
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

  onMount(() => {
    syncAuth();

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      applyTheme(savedTheme === "dark");
      return;
    }
    applyTheme(false);
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
        class="menu-btn"
        aria-label="Toggle menu"
        aria-expanded={open}
        aria-controls="navList"
        on:click={() => (open = !open)}
      >
        ☰
      </button>

      <ul id="navList" class="nav-list {open ? 'show' : ''}">
        <li><a class="nav-item" href="/landing#features">Features</a></li>
        <li><a class="nav-item" href="/landing#roles">Roles</a></li>
        <li><a class="nav-item" href="/landing#contact">Contact</a></li>
        {#if isAuthenticated}
          <li><a class="nav-item" href={dashboardPath}>Dashboard</a></li>
          <li><a class="nav-item" href="/profile">Profile</a></li>
        {/if}
        <li>
          <button class="nav-item theme-toggle" on:click={toggleTheme}>
            {darkMode ? "Light mode" : "Dark mode"}
          </button>
        </li>

        {#if isAuthenticated}
          <li><button class="nav-item" on:click={signout}>Sign out</button></li>
        {:else}
          <li><a class="nav-item" href="/login">Log in</a></li>
        {/if}
      </ul>
    </nav>
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

  .theme-toggle {
    min-width: 108px;
  }
</style>
