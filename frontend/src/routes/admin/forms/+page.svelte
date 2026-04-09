<script>
  import { onMount } from "svelte";

  const API_BASE =
    import.meta.env.VITE_BACKEND_URL ??
    "https://benessere-north-mental-health-tracker-backend.julissa-school101.workers.dev";

  const questionLabels = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed or hopeless",
    "Trouble falling asleep, staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself - or that you're a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed. Or, the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
    "Thoughts that you would be better off dead or of hurting yourself in some way"
  ];

  const answerLabels = [
    "Not at all",
    "Several days",
    "More than half the days",
    "Nearly every day"
  ];

  let forms = [];
  let search = "";
  let statusFilter = "all";

  let loading = true;
  let errorMsg = "";
  let reviewLoading = false;
  let reviewError = "";
  let selectedReview = null;

  // Fetch minimal PHQ-9 form list
  onMount(async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      errorMsg = "Not authenticated.";
      loading = false;
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/phq9/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!data.success) {
        errorMsg = "Unable to load submitted forms.";
      } else {
        // Convert backend → table rows
        forms = data.data.map((f) => ({
          id: f.form_submission_id,
          participant: f.user_id,
          participantName: f.username ?? `User ${f.user_id}`,
          participantEmail: f.email ?? "",
          formName: "PHQ-9",
          completionDate: f.completion_date,
          score: f.total_score,
          severity: f.depression_severity,
          status: "reviewed" // default for now
        }));
      }
    } catch (err) {
      console.error(err);
      errorMsg = "Network error.";
    }

    loading = false;
  });

  // Filtering
  $: filtered = forms.filter((f) => {
    const matchesStatus = statusFilter === "all" || f.status === statusFilter;

    const matchesSearch =
      !search ||
      f.participant?.toString().includes(search) ||
      f.formName.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  function formatDate(value) {
    if (!value) return "Unknown";

    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  }

  function answerLabel(value) {
    return answerLabels[Number(value)] ?? String(value ?? "-");
  }

  async function reviewForm(id) {
    const token = localStorage.getItem("authToken");
    if (!token) {
      errorMsg = "Not authenticated.";
      return;
    }

    reviewLoading = true;
    reviewError = "";
    selectedReview = null;

    try {
      const res = await fetch(`${API_BASE}/phq9/admin/submission/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        reviewError = data?.error ?? "Unable to load form details.";
        return;
      }

      const submission = data.submission;
      selectedReview = {
        id: submission.form_submission_id,
        participant: submission.user_id,
        participantName: submission.username ?? `User ${submission.user_id}`,
        participantEmail: submission.email ?? "",
        completionDate: submission.completion_date,
        score: submission.total_score,
        severity: submission.depression_severity,
        answers: questionLabels.map((question, index) => {
          const value = submission[`q${index + 1}`];
          return {
            id: index + 1,
            question,
            value,
            label: answerLabel(value)
          };
        })
      };
    } catch (err) {
      console.error(err);
      reviewError = "Network error while loading form details.";
    } finally {
      reviewLoading = false;
    }
  }

  function closeReview() {
    selectedReview = null;
    reviewError = "";
  }
</script>

<section class="content page-forms">
  <header class="content-head">
    <div>
      <h1>Submitted Forms</h1>
      <p class="muted">View and review PHQ-9 submissions.</p>
    </div>

    <div class="filters">
      <input
        class="input"
        type="search"
        placeholder="Search by user ID or form…"
        bind:value={search}
      />

      <select class="input" bind:value={statusFilter}>
        <option value="all">All statuses</option>
        <option value="reviewed">Reviewed</option>
      </select>
    </div>
  </header>

  <div class="card">
    {#if loading}
      <div class="empty"><p>Loading…</p></div>

    {:else if errorMsg}
      <div class="empty"><p>{errorMsg}</p></div>

    {:else if filtered.length === 0}
      <div class="empty"><p>No data available.</p></div>

    {:else}
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Form</th>
              <th>Score</th>
              <th>Severity</th>
              <th>Status</th>
              <th class="right">Action</th>
            </tr>
          </thead>

          <tbody>
            {#each filtered as f}
              <tr>
                <td>{f.participant}</td>
                <td>{f.formName}</td>
                <td>{f.score}</td>
                <td>{f.severity}</td>
                <td>{f.status}</td>
                <td class="right">
                  <button class="btn small outline" type="button" on:click={() => reviewForm(f.id)}>
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

{#if reviewLoading}
  <div class="review-overlay">
    <div class="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-title">
      <div class="review-head">
        <h2 id="review-title">Loading submission...</h2>
      </div>
      <div class="empty">Fetching PHQ-9 details.</div>
    </div>
  </div>
{/if}

{#if reviewError}
  <div class="review-overlay">
    <div class="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-error-title">
      <div class="review-head">
        <h2 id="review-error-title">Unable to open review</h2>
        <button class="btn small outline" type="button" on:click={closeReview}>Close</button>
      </div>
      <div class="empty">{reviewError}</div>
    </div>
  </div>
{/if}

{#if selectedReview}
  <div class="review-overlay">
    <div class="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-title">
      <div class="review-head">
        <div>
          <h2 id="review-title">PHQ-9 Review</h2>
          <p class="muted review-subtitle">
            Submission #{selectedReview.id} for {selectedReview.participantName}
          </p>
        </div>
        <button class="btn small outline" type="button" on:click={closeReview}>Close</button>
      </div>

      <div class="review-summary">
        <div class="summary-card">
          <span class="summary-label">Participant</span>
          <strong>{selectedReview.participantName}</strong>
          <span class="muted">User ID: {selectedReview.participant}</span>
          {#if selectedReview.participantEmail}
            <span class="muted">{selectedReview.participantEmail}</span>
          {/if}
        </div>
        <div class="summary-card">
          <span class="summary-label">Submitted</span>
          <strong>{formatDate(selectedReview.completionDate)}</strong>
        </div>
        <div class="summary-card">
          <span class="summary-label">Total Score</span>
          <strong>{selectedReview.score} / 27</strong>
        </div>
        <div class="summary-card">
          <span class="summary-label">Severity</span>
          <strong>{selectedReview.severity}</strong>
        </div>
      </div>

      <div class="answers">
        {#each selectedReview.answers as answer}
          <article class="answer-card">
            <div class="answer-question">{answer.id}. {answer.question}</div>
            <div class="answer-meta">
              <span class="answer-badge">{answer.label}</span>
              <span class="muted">Score: {answer.value}</span>
            </div>
          </article>
        {/each}
      </div>
    </div>
  </div>
{/if}

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

  th,
  td {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
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

  .review-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    display: grid;
    place-items: center;
    padding: 24px;
    z-index: 1000;
  }

  .review-modal {
    width: min(900px, 100%);
    max-height: min(90vh, 860px);
    overflow: auto;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 18px;
    box-shadow: 0 24px 80px rgba(15, 23, 42, 0.18);
    padding: 20px;
  }

  .review-head {
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 16px;
    margin-bottom: 18px;
  }

  .review-head h2 {
    margin: 0;
  }

  .review-subtitle {
    margin: 6px 0 0;
  }

  .review-summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 18px;
  }

  .summary-card {
    display: grid;
    gap: 4px;
    padding: 14px;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: #f8fafc;
  }

  .summary-label {
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .answers {
    display: grid;
    gap: 12px;
  }

  .answer-card {
    padding: 14px;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: #fff;
  }

  .answer-question {
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 10px;
  }

  .answer-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .answer-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 999px;
    background: #eef2ff;
    color: #4338ca;
    font-weight: 600;
  }

  @media (max-width: 760px) {
    .review-summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    .review-head {
      flex-direction: column;
      align-items: stretch;
    }

    .review-summary {
      grid-template-columns: 1fr;
    }
  }
</style>
