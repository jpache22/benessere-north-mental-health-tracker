<script>
  // DB-ready — this will later fetch from /api/admin/forms
  let forms = [];
  let search = '';
  let statusFilter = 'all';

  $: filtered = forms.filter((f) => {
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    const matchesSearch =
      !search ||
      f.participant?.toLowerCase().includes(search.toLowerCase()) ||
      f.formName?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  function reviewForm(id) {
    console.log('Review form:', id);
  }
</script>

<section class="content page-forms">
  <header class="content-head">
    <div>
      <h1>Submitted Forms</h1>
      <p class="muted">View and manage all submitted participant forms.</p>
    </div>

    <div class="filters">
      <input
        class="input"
        type="search"
        placeholder="Search by participant or form name…"
        bind:value={search}
      />
      <select class="input" bind:value={statusFilter}>
        <option value="all">All statuses</option>
        <option value="pending">Pending</option>
        <option value="reviewed">Reviewed</option>
        <option value="flagged">Flagged</option>
      </select>
    </div>
  </header>

  <div class="card">
    {#if forms.length === 0}
      <div class="empty">
        <p>No form data available. Connect to the database to load records.</p>
      </div>
    {:else}
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Participant</th>
              <th>Form Name</th>
              <th>Project</th>
              <th>Date Submitted</th>
              <th>Status</th>
              <th class="right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each filtered as f}
              <tr>
                <td>{f.participant}</td>
                <td>{f.formName}</td>
                <td>{f.project}</td>
                <td>{f.submittedAt}</td>
                <td style="text-transform:capitalize">{f.status}</td>
                <td class="right">
                  <button class="btn small outline" on:click={() => reviewForm(f.id)}>
                    Review
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

  .card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 16px;
  }

  .table-wrap {
    overflow-x: auto;
  }

  table {
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

  .btn.small {
    padding: 8px 10px;
    font-size: 0.9rem;
  }
</style>
