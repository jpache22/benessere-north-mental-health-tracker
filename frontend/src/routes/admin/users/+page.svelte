<script>
  // Eventually will fetch from backend: /api/admin/users
  let users = []; // leave empty until DB integration
  let search = '';
  let roleFilter = 'all';

  // Derived filtered users
  $: filtered = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch = !search || u.name.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Placeholders for future actions
  function assignRole(userId, newRole) {
    console.log('Assign role', userId, newRole);
  }

  function resetPassword(userId) {
    console.log('Reset password for user', userId);
  }
</script>

<section class="content page-users">
  <header class="content-head">
    <div>
      <h1>Users & Roles</h1>
      <p class="muted">Manage roles and permissions for system users.</p>
    </div>

    <div class="filters">
      <input
        class="input"
        type="search"
        placeholder="Search user..."
        bind:value={search}
      />
      <select class="input" bind:value={roleFilter}>
        <option value="all">All roles</option>
        <option value="admin">Admin</option>
        <option value="coordinator">Coordinator</option>
        <option value="therapist">Therapist</option>
        <option value="intake">Intake</option>
      </select>
    </div>
  </header>

  <div class="card">
    {#if users.length === 0}
      <div class="empty">
        <p>No users loaded. Connect to the database to view records.</p>
      </div>
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
                  </select>
                </td>
                <td>{user.status ?? 'Active'}</td>
                <td class="right">
                  <button
                    class="btn small outline"
                    on:click={() => resetPassword(user.id)}
                  >
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
  .page-users .content-head {
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

  .table-wrap {
    overflow-x: auto;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
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
