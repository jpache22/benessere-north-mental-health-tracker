<script>
  // Later fetched from /api/admin/access
  let requests = []; // empty until backend is ready
  let statusFilter = 'pending';
  let search = '';

  // Derived filtered requests
  $: filtered = requests.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch =
      !search ||
      r.user?.toLowerCase().includes(search.toLowerCase()) ||
      r.project?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Placeholder action handlers
  function approve(id) {
    console.log('Approved access request:', id);
  }

  function deny(id) {
    console.log('Denied access request:', id);
  }
</script>

<section class="content page-access">
  <header class="content-head">
    <div>
      <h1>Access Control</h1>
      <p class="muted">
        Grant or deny group and project access for users.
      </p>
    </div>

    <div class="filters">
      <input
        class="input"
        type="search"
        placeholder="Search by user or project..."
        bind:value={search}
      />
      <select class="input" bind:value={statusFilter}>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="denied">Denied</option>
        <option value="all">All</option>
      </select>
    </div>
  </header>

  <div class="card">
    {#if requests.length === 0}
      <div class="empty">
        <p>No pending access requests. Connect database to load data.</p>
      </div>
    {:else}
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Requested Project</th>
              <th>Role Requested</th>
              <th>Status</th>
              <th class="right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each filtered as req}
              <tr>
                <td>{req.user}</td>
                <td>{req.email}</td>
                <td>{req.project}</td>
                <td>{req.roleRequested}</td>
                <td style="text-transform:capitalize">{req.status}</td>
                <td class="right actions">
                  {#if req.status === 'pending'}
                    <button class="btn small" on:click={() => approve(req.id)}>
                      Approve
                    </button>
                    <button class="btn small outline red" on:click={() => deny(req.id)}>
                      Deny
                    </button>
                  {:else}
                    <span class="muted">Processed</span>
                  {/if}
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

  .card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
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

  .empty {
    padding: 40px;
    text-align: center;
    color: var(--muted);
  }

  .actions {
    display: flex;
    gap: 6px;
    justify-content: flex-end;
  }

  .btn.small {
    padding: 8px 10px;
    font-size: 0.9rem;
  }

  .btn.small.outline.red {
    border-color: #ef4444;
    color: #ef4444;
  }

  .btn.small.outline.red:hover {
    background: #ef4444;
    color: #fff;
  }
</style>
