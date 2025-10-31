<script>
  import { goto } from '$app/navigation';

  // form fields
  let username = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let role = 'participant';
  let message = '';
  let loading = false;

  async function registerUser(e) {
    e.preventDefault();
    message = '';
    loading = true;

    if (password !== confirmPassword) {
      message = 'Passwords do not match.';
      loading = false;
      return;
    }

    // later will connect to: /api/auth/register
    try {
      console.log('Registering user:', { username, email, role });
      await new Promise((r) => setTimeout(r, 500)); // fake delay
      message = 'Registration successful! Redirecting to login...';
      setTimeout(() => goto('/login'), 1200);
    } catch (err) {
      message = 'Registration failed. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Register – Benessere North</title>
</svelte:head>

<main class="auth container">
  <section class="card">
    <div class="brand-center">
      <div class="logo">BN</div>
      <h1>Create an Account</h1>
      <p class="subtitle">Join Benessere North today</p>
    </div>

    <form on:submit={registerUser} novalidate>
      <label class="field">
        <span>Username</span>
        <input type="text" bind:value={username} placeholder="e.g., jsmith" required />
      </label>

      <label class="field">
        <span>Email</span>
        <input type="email" bind:value={email} placeholder="you@example.com" required />
      </label>

      <label class="field">
        <span>Password</span>
        <input type="password" bind:value={password} placeholder="••••••••" minlength="6" required />
      </label>

      <label class="field">
        <span>Confirm Password</span>
        <input type="password" bind:value={confirmPassword} placeholder="••••••••" minlength="6" required />
      </label>

      <label class="field">
        <span>Role</span>
        <select bind:value={role} class="input">
          <option value="participant">Participant</option>
          <option value="intake">Intake</option>
          <option value="therapist">Therapist</option>
          <option value="coordinator">Coordinator</option>
        </select>
      </label>

      <button type="submit" class="primary btn" disabled={loading}>
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>
    </form>

    {#if message}
      <p class="msg {message.includes('successful') ? 'success' : 'error'}">{message}</p>
    {/if}

    <p class="footnote">
      Already have an account? <a class="link" href="/login">Log in</a>
    </p>
  </section>
</main>

<style>
  .auth {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 50px 16px;
    min-height: calc(100vh - 120px);
  }

  .card {
    max-width: 420px;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px 28px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
  }

  .brand-center {
    text-align: center;
    margin-bottom: 20px;
  }

  .logo {
    width: 46px;
    height: 46px;
    margin: 0 auto 12px;
    background: var(--brand);
    border-radius: 12px;
    color: #fff;
    display: grid;
    place-items: center;
    font-weight: 800;
    box-shadow: 0 8px 18px var(--ring);
  }

  .subtitle {
    color: var(--muted);
    margin-top: 4px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 12px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .field span {
    font-weight: 600;
    font-size: 0.9rem;
  }

  .field input, select {
    height: 42px;
    padding: 0 12px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: #fff;
    font-size: 1rem;
  }

  .field input:focus, select:focus {
    border-color: var(--brand);
    box-shadow: 0 0 0 4px var(--ring);
    outline: none;
  }

  .btn.primary {
    background: var(--brand);
    color: #fff;
    font-weight: 700;
    padding: 12px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: 0.15s;
  }

  .btn.primary:hover:not(:disabled) {
    background: var(--brand-strong);
  }

  .btn.primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .msg {
    text-align: center;
    font-size: 0.9rem;
    margin-top: 8px;
  }

  .msg.success {
    color: #16a34a;
  }

  .msg.error {
    color: #dc2626;
  }

  .footnote {
    margin-top: 16px;
    text-align: center;
    color: var(--muted);
  }

  .link {
    color: var(--brand-strong);
    text-decoration: none;
    font-weight: 600;
  }

  .link:hover {
    text-decoration: underline;
  }
</style>
