<script>
  // DB-ready — later fetched from /api/admin/attendance
  let records = [];
  let search = '';
  let dateFilter = '';

  $: filtered = records.filter((r) => {
    const matchesSearch =
      !search ||
      r.participant?.toLowerCase().includes(search.toLowerCase()) ||
      r.group?.toLowerCase().includes(search.toLowerCase());
    const matchesDate = !dateFilter || r.date === dateFilter;
    return matchesSearch && matchesDate;
  });

  function editAttendance(id) {
    console.log('Edit attendance:', id);
  }
</script>

<section class="content page-attendance">
  <header class="content-head">
    <div>
      <h1>Attendance Overview</h1>
      <p class="muted">Monitor, review, or edit participant attendance records.</p>
    </div>

    <div class="filters">
      <input
        class="input"
        type="search"
        placeholder="Search by participant or group…"
        bind:value={search}
      />
      <input
        class="input"
        type="date"
        bind:value={dateFilter}
      />
    </div>
  </header>

  <div class="card">
    {#if records.length === 0}
      <div class="empty">
        <p>No attendance data yet. Connect to the database to view logs.</p>
      </div>
    {:else}
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Participant</th>
              <th>Group</th>
              <th>Project</th>
              <th>Status</th>
              <th class="right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each filtered as r}
              <tr>
                <td>{r.date}</td>
                <td>{r.participant}</td>
                <td>{r.group}</td>
                <td>{r.project}</td>
                <td>{r.status}</td>
                <td class="right">
                  <button class="btn small outline" on:click={() => editAttendance(r.id)}>
                    Edit
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
