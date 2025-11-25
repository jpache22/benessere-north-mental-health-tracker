<script>
  import { onMount } from "svelte";

  const API_BASE =
    "https://benessere-north-mental-health-tracker-backend.julissa-school101.workers.dev";

  let forms = [];
  let search = "";
  let statusFilter = "all";

  let loading = true;
  let errorMsg = "";

  // Fetch PHQ-9 forms for admin
  onMount(async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      errorMsg = "Not authenticated.";
      loading = false;
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/forms`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!data.success) {
        errorMsg = "Unable to load submitted forms.";
      } else {
        // Convert DB → table UI format
        forms = data.phq9.map((f) => ({
          id: f.form_submission_id,
          participant: f.user_id,                    // Could later map to real username
          formName: "PHQ-9",
          project: "—",                              // undefined for now
          submittedAt: new Date(f.completion_date).toLocaleString(),
          status: "pending",                         // default until you add per-form status
          total: f.total_score,
          severity: f.depression_severity
        }));
      }
    } catch (err) {
      console.error(err);
      errorMsg = "Network error.";
    }

    loading = false;
  });

  // Filtering logic
  $: filtered = forms.filter((f) => {
    const matchesStatus = statusFilter === "all" || f.status === statusFilter;
    const matchesSearch =
      !search ||
      f.participant?.toString().toLowerCase().includes(search.toLowerCase()) ||
      f.formName.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  function reviewForm(id) {
    console.log("Review form:", id);
    // Later: goto(`/admin/forms/${id}`)
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
    {#if loading}
      <div class="empty"><p>Loading…</p></div>

    {:else if errorMsg}
      <div class="empty"><p>{errorMsg}</p></div>

    {:else if filtered.length === 0}
      <div class="empty"><p>No form data found.</p></div>

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
