<script>
  import { goto } from '$app/navigation';

  const API_BASE =
    import.meta.env.VITE_BACKEND_URL ??
    'https://benessere-north-mental-health-tracker-backend.julissa-school101.workers.dev';

  const SELF_PASSWORD_URL = `${API_BASE}/users/self/password`;

  let newPassword = '';
  let confirmPassword = '';
  let loading = false;
  let successMsg = '';
  let errorMsg = '';

  async function updatePassword(event) {
    event.preventDefault();
    successMsg = '';
    errorMsg = '';

    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      goto('/login');
      return;
    }

    if (!newPassword.trim()) {
      errorMsg = 'Please enter a new password.';
      return;
    }

    if (newPassword.length < 6) {
      errorMsg = 'Password must be at least 6 characters.';
      return;
    }

    if (newPassword !== confirmPassword) {
      errorMsg = 'Passwords do not match.';
      return;
    }

    loading = true;

    try {
      const res = await fetch(SELF_PASSWORD_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: Number(userId),
          password: newPassword
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        errorMsg = data.error || 'Unable to update password.';
        return;
      }

      successMsg = 'Password updated successfully.';
      newPassword = '';
      confirmPassword = '';
    } catch (err) {
      errorMsg = 'Connection error. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<section class="settings-page">
  <header class="head">
    <h1>Settings</h1>
    <p class="muted">Update your account password.</p>
  </header>

  {#if successMsg}
    <div class="alert success">{successMsg}</div>
  {/if}

  {#if errorMsg}
    <div class="alert error">{errorMsg}</div>
  {/if}

  <div class="card panel">
    <h2>Change Password</h2>

    <form on:submit={updatePassword}>
      <label class="field">
        <span>New Password</span>
        <input
          class="input"
          type="password"
          placeholder="Enter new password"
          bind:value={newPassword}
          minlength="6"
          required
        />
      </label>

      <label class="field">
        <span>Confirm New Password</span>
        <input
          class="input"
          type="password"
          placeholder="Confirm new password"
          bind:value={confirmPassword}
          minlength="6"
          required
        />
      </label>

      <button class="btn" type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  </div>
</section>

<style>
  .settings-page {
    max-width: 640px;
  }

  .head {
    margin-bottom: 16px;
  }

  .head h1 {
    margin: 0 0 6px;
  }

  .muted {
    margin: 0;
    color: var(--muted);
  }

  .panel {
    padding: 20px;
  }

  .panel h2 {
    margin: 0 0 14px;
    font-size: 1.1rem;
  }

  form {
    display: grid;
    gap: 12px;
  }

  .field {
    display: grid;
    gap: 6px;
  }

  .field span {
    font-size: 0.92rem;
    color: var(--muted);
  }

  .alert {
    padding: 10px 14px;
    border-radius: 10px;
    margin-bottom: 12px;
  }

  .alert.success {
    background: #e8ffe8;
    border: 1px solid #a5d6a7;
    color: #2e7d32;
  }

  .alert.error {
    background: #ffe8e8;
    border: 1px solid #ef9a9a;
    color: #c62828;
  }

  .btn[disabled] {
    opacity: 0.7;
    cursor: not-allowed;
  }
</style>
