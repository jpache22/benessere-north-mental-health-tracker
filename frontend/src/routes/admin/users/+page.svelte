<script>
  import { onMount } from 'svelte';

  let users = [];
  let filtered = [];
  let search = '';
  let roleFilter = 'all';

  let loading = true;
  let errorMsg = '';
  let successMsg = '';

  const FETCH_URL =
    "https://benessere-north-mental-health-tracker-backend.julissa-school101.workers.dev/adminFetchTable";

  const UPDATE_URL =
    "https://benessere-north-mental-health-tracker-backend.julissa-school101.workers.dev/userUpdate";

  // Load users from backend
  onMount(async () => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      errorMsg = "No admin token found. Please log in.";
      loading = false;
      return;
    }

    try {
      const res = await fetch(FETCH_URL, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await res.json();

      if (!data.success) {
        errorMsg = "Failed to load user list.";
      } else {
        users = data.payload.data.map(u => ({
          id: u.id,
          name: u.username,
          email: u.email ?? "—",
          role: u.role ?? "none",
          status: "Active"
        }));
      }

    } catch (err) {
      errorMsg = "Connection error.";
    }

    loading = false;
  });

  // Recalculate filtering
  $: filtered = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch =
      !search || u.name.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Send updated role to backend
  async function assignRole(userId, newRole) {
    successMsg = "";
    errorMsg = "";

    const token = localStorage.getItem("authToken");
    const user = users.find(u => u.id === userId);

    if (!token || !user) return;

    try {
      const res = await fetch(UPDATE_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: userId,
          username: user.name,
          role: newRole
        })
      });

      const data = await res.json();

      if (data.success) {
        successMsg = `Updated role for ${user.name}`;
      } else {
        errorMsg = "Unable to update role.";
      }
    } catch (err) {
      errorMsg = "Connection error.";
    }
  }

  // Reset password to a default temp password
  async function resetPassword(userId) {
    successMsg = "";
    errorMsg = "";

    const newTempPassword = "TempPass123";
    const token = localStorage.getItem("authToken");
    const user = users.find(u => u.id === userId);

    if (!token || !user) return;

    try {
      const res = await fetch(UPDATE_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: userId,
          username: user.name,
          password: newTempPassword
        })
      });

      const data = await res.json();

      if (data.success) {
        successMsg = `Password reset for ${user.name}`;
      } else {
        errorMsg = "Unable to reset password.";
      }
    } catch (err) {
      errorMsg = "Connection error.";
    }
  }
</script>

<section class="content page-users">
  <header class="content-head">
    <div>
      <h1>Users & Roles</h1>
      <p class="muted">Manage user accounts and permissions.</p>
    </div>

    <div class="filters">
      <input class="input" type="search" placeholder="Search user..." bind:value={search} />

      <select class="input" bind:value={roleFilter}>
        <option value="all">All roles</option>
        <option value="admin">Admin</option>
        <option value="coordinator">Coordinator</option>
        <option value="therapist">Therapist</option>
        <option value="intake">Intake</option>
        <option value="none">None</option>
      </select>
    </div>
  </header>

  {#if successMsg}
    <div class="success-box">{successMsg}</div>
  {/if}

  {#if errorMsg}
    <div class="error-box">{errorMsg}</div>
  {/if}

  <div class="card">
    {#if loading}
      <div class="empty"><p>Loading users...</p></div>

    {:else if users.length === 0}
      <div class="empty"><p>No users found.</p></div>

    {:else}
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th class="right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {#each filtered as user}
              <tr>
                <td>{user.name}</td>
                <td>{user.email}</td>

                <td>
                  <select
                    class="input small"
                    bind:value={user.role}
                    on:change={(e) => assignRole(user.id, e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="coordinator">Coordinator</option>
                    <option value="therapist">Therapist</option>
                    <option value="intake">Intake</option>
                    <option value="none">None</option>
                  </select>
                </td>

                <td>{user.status}</td>

                <td class="right">
                  <button class="btn small outline" on:click={() => resetPassword(user.id)}>
                    Reset Password
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</section>

<style>
  .content-head {
    display: flex;
    justify-content: space-between;
    align-items: end;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
  }

  .filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .success-box {
    background: #e8ffe8;
    border: 1px solid #a5d6a7;
    padding: 10px 14px;
    border-radius: 10px;
    margin-bottom: 14px;
    color: #2e7d32;
  }

  .error-box {
    background: #ffe8e8;
    border: 1px solid #ef9a9a;
    padding: 10px 14px;
    border-radius: 10px;
    margin-bottom: 14px;
    color: #c62828;
  }

  .table-wrap {
    overflow-x: auto;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
    text-align: left;
  }

  .right {
    text-align: right;
  }

  .card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
  }

  .empty {
    padding: 40px;
    text-align: center;
    color: var(--muted);
  }

  select.input.small {
    height: 34px;
    font-size: 0.9rem;
  }

  .btn.small {
    padding: 8px 10px;
    font-size: 0.9rem;
  }
</style>
