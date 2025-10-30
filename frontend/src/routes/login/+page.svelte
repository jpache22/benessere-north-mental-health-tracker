<script>
  import { goto } from '$app/navigation';

  let username = '';
  let password = '';
  let remember = false;

  let userErr = '';
  let passErr = '';
  let serverErr = '';

  async function onSubmit(e) {
    e.preventDefault();
    userErr = passErr = serverErr = '';

    if (!username.trim()) userErr = 'Please enter your username.';
    if (!password.trim()) passErr = 'Please enter your password.';
    else if (password.length < 6) passErr = 'Password must be at least 6 characters.';

    if (userErr || passErr) return;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password, remember })
      });

      if (!res.ok) {
        const msg = (await res.json().catch(() => null))?.error ?? 'Sign in failed.';
        serverErr = msg;
        return;
      }

      // success → go to therapist dashboard
      goto('/therapist');
    } catch {
      serverErr = 'Network error. Please try again.';
    }
  }
</script>

<main class="container" style="min-height:calc(100vh - 160px);display:grid;place-items:center;padding:40px 24px">
  <section class="card" style="width:100%;max-width:380px;border:1px solid var(--border);border-radius:18px;padding:28px;box-shadow:0 10px 25px rgba(0,0,0,0.05),0 2px 8px rgba(0,0,0,0.04)">
    <div style="text-align:center;margin-bottom:18px">
      <div class="logo" style="width:54px;height:54px;border-radius:14px;background:var(--brand);color:#fff;display:grid;place-items:center;margin:0 auto 10px;font-weight:800">BN</div>
      <h1 style="font-size:1.35rem;margin:0">Welcome back</h1>
      <p class="muted" style="margin:6px 0 0">Sign in to continue</p>
    </div>

    {#if serverErr}
      <div style="background:#fef2f2;border:1px solid #fecaca;color:#991b1b;border-radius:12px;padding:10px 12px;margin-bottom:12px">
        {serverErr}
      </div>
    {/if}

    <form on:submit={onSubmit} novalidate>
      <label style="display:block;margin-bottom:14px">
        <span class="muted" style="display:inline-block;font-size:.9rem;margin-bottom:6px">Username</span>
        <input class="input" type="text" placeholder="therapist01" bind:value={username} />
        {#if userErr}<small style="color:#ef4444;font-size:.85rem;margin-top:6px;display:block">{userErr}</small>{/if}
      </label>

      <label style="display:block;margin-bottom:14px">
        <span class="muted" style="display:inline-block;font-size:.9rem;margin-bottom:6px">Password</span>
        <input class="input" type="password" placeholder="••••••••" bind:value={password} />
        {#if passErr}<small style="color:#ef4444;font-size:.85rem;margin-top:6px;display:block">{passErr}</small>{/if}
      </label>

      <div style="display:flex;justify-content:space-between;align-items:center;margin:6px 0 14px">
        <label class="muted" style="display:inline-flex;align-items:center;gap:8px">
          <input type="checkbox" bind:checked={remember} /> <span>Remember me</span>
        </label>
        <a class="btn outline small" href="/landing#contact">Need help?</a>
      </div>

      <button type="submit" class="btn" style="width:100%">Sign In</button>
    </form>

    <p class="muted" style="margin:14px 0 0;text-align:center">
      Don’t have an account? <a class="btn outline small" href="/register">Sign Up</a>
    </p>
  </section>
</main>
