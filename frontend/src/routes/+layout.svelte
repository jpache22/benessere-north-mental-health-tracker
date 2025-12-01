<script>
  import "../app.css";
  import { page } from "$app/stores";

  let open = false;

  // current year
  if (typeof window !== "undefined") {
    setTimeout(() => {
      const y = document.getElementById("year");
      if (y) y.textContent = new Date().getFullYear();
    }, 0);
  }

  // logout
  async function signout() {
    await fetch("/api/auth/logout", { method: "POST" });
    location.href = "/login";
  }

  $: hideSignOut =
    $page.url.pathname.startsWith("/login") ||
    $page.url.pathname.startsWith("/landing");
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
        <li><a href="/landing#features">Features</a></li>
        <li><a href="/landing#roles">Roles</a></li>
        <li><a href="/landing#contact">Contact</a></li>

        {#if hideSignOut}
          <li><a class="btn small outline" href="/login">Log in</a></li>
        {:else}
          <li><button class="btn small outline" on:click={signout}>Sign out</button></li>
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
</style>
