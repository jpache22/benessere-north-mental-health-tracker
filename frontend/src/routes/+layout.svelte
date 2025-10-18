<script>
  import '../app.css';
  let open = false;
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      const y = document.getElementById('year');
      if (y) y.textContent = new Date().getFullYear();
    }, 0);
  }
</script>

<header class="site-header">
  <nav class="nav container" aria-label="Primary">
    <a class="brand" href="/landing">
      <span class="logo" aria-hidden="true">BN</span>
      <span class="brand-text">Benessere North</span>
    </a>
    <button class="menu-btn" aria-label="Toggle menu" aria-expanded={open} aria-controls="navList" on:click={() => (open = !open)}>☰</button>
    <ul id="navList" class="nav-list {open ? 'show' : ''}">
      <li><a href="/landing#features">Features</a></li>
      <li><a href="/landing#roles">Roles</a></li>
      <li><a href="/landing#contact">Contact</a></li>
      <li><a class="btn small outline" href="/login">Log in</a></li>
    </ul>
  </nav>
</header>

<slot />

<footer class="site-footer">
  <div class="container foot">
    <span>© <span id="year"></span> Benessere North</span>
    <nav class="foot-nav" aria-label="Footer">
      <a href="/landing#features">Features</a>
      <a href="/landing#roles">Roles</a>
      <a href="/landing">Privacy</a>
    </nav>
  </div>
</footer>