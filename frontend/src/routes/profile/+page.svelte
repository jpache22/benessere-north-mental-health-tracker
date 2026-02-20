<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { getAuthSession, getRoleHomePath } from "$lib/auth";

  const API_BASE =
    import.meta.env.VITE_BACKEND_URL ??
    "https://benessere-north-mental-health-tracker-backend.julissa-school101.workers.dev";

  let session = null;
  let loading = true;
  let newPassword = "";
  let confirmPassword = "";
  let savingPassword = false;
  let successMsg = "";
  let errorMsg = "";

  function formatDate(iso) {
    if (!iso) return "Not available";
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
  }

  function loadSession() {
    session = getAuthSession();
    if (!session.authenticated) {
      goto("/login");
      return;
    }
    loading = false;
  }

  async function updatePassword(event) {
    event.preventDefault();
    successMsg = "";
    errorMsg = "";

    if (!newPassword.trim()) {
      errorMsg = "Please enter a new password.";
      return;
    }

    if (newPassword.length < 6) {
      errorMsg = "Password must be at least 6 characters.";
      return;
    }

    if (newPassword !== confirmPassword) {
      errorMsg = "Passwords do not match.";
      return;
    }

    savingPassword = true;

    try {
      const res = await fetch(`${API_BASE}/users/self/password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: Number(session.userId),
          password: newPassword
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        errorMsg = data.error || "Unable to update password.";
        return;
      }

      successMsg = "Password updated successfully.";
      newPassword = "";
      confirmPassword = "";
    } catch {
      errorMsg = "Connection error. Please try again.";
    } finally {
      savingPassword = false;
    }
  }

  onMount(loadSession);
</script>

{#if !loading && session}
  <section class="profile-page">
    <header class="profile-head">
      <div>
        <h1>Profile</h1>
        <p class="muted">Session and account details for your signed-in user.</p>
      </div>
      <a class="btn outline small" href={getRoleHomePath(session.role)}>Go to Dashboard</a>
    </header>

    <div class="grid">
      <article class="card panel">
        <h2>Account</h2>
        <dl>
          <div><dt>Name</dt><dd>{session.username || "Not available"}</dd></div>
          <div><dt>Email</dt><dd>{session.email || "Not available"}</dd></div>
          <div><dt>Role</dt><dd>{session.role || "Not available"}</dd></div>
          <div><dt>User ID</dt><dd>{session.userId || "Not available"}</dd></div>
        </dl>
      </article>

      <article class="card panel">
        <h2>Session</h2>
        <dl>
          <div><dt>Status</dt><dd>{session.authenticated ? "Active" : "Expired"}</dd></div>
          <div><dt>Last login</dt><dd>{formatDate(session.lastLoginAt)}</dd></div>
          <div><dt>Token expires</dt><dd>{formatDate(session.expMs)}</dd></div>
        </dl>
      </article>
    </div>

    <article class="card panel password-panel">
      <h2>Security</h2>
      <p class="muted">Change your password for the current account.</p>

      {#if successMsg}
        <div class="alert success">{successMsg}</div>
      {/if}
      {#if errorMsg}
        <div class="alert error">{errorMsg}</div>
      {/if}

      <form on:submit={updatePassword}>
        <label class="field">
          <span>New Password</span>
          <input class="input" type="password" minlength="6" bind:value={newPassword} required />
        </label>

        <label class="field">
          <span>Confirm Password</span>
          <input class="input" type="password" minlength="6" bind:value={confirmPassword} required />
        </label>

        <button class="btn" type="submit" disabled={savingPassword}>
          {savingPassword ? "Updating..." : "Update Password"}
        </button>
      </form>
    </article>
  </section>
{/if}

<style>
  .profile-page {
    max-width: 980px;
    margin: 0 auto;
    padding: 8px 0 24px;
  }

  .profile-head {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 12px;
    margin-bottom: 14px;
  }

  h1 {
    margin: 0 0 4px;
  }

  .muted {
    margin: 0;
    color: var(--muted);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 12px;
  }

  .panel {
    padding: 16px;
  }

  .panel h2 {
    margin: 0 0 12px;
    font-size: 1.05rem;
  }

  dl {
    margin: 0;
    display: grid;
    gap: 10px;
  }

  dt {
    font-size: 0.84rem;
    color: var(--muted);
  }

  dd {
    margin: 2px 0 0;
    font-weight: 600;
  }

  .password-panel form {
    display: grid;
    gap: 10px;
    max-width: 420px;
    margin-top: 10px;
  }

  .field {
    display: grid;
    gap: 6px;
  }

  .field span {
    font-size: 0.9rem;
    color: var(--muted);
  }

  .alert {
    padding: 10px 12px;
    border-radius: 10px;
    margin-top: 10px;
  }

  .alert.success {
    background: #e8ffe8;
    border: 1px solid #9ad19a;
    color: #236b23;
  }

  .alert.error {
    background: #ffe9e9;
    border: 1px solid #ec9999;
    color: #8f1f1f;
  }

  @media (max-width: 840px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
