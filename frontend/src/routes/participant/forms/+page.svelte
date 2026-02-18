<!-- frontend/src/routes/participant/forms/+page.svelte -->
<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let phq9Draft = false;
  let epdsDraft = false;

  function goToPHQ9() {
    goto('/participant/forms/phq9');
  }

  function goToEPDS() {
    goto('/participant/forms/epds');
  }

  function goBack() {
    goto('/participant');
  }

  onMount(() => {
    // Check for existing drafts
    phq9Draft = !!localStorage.getItem('phq9_draft');
    epdsDraft = !!localStorage.getItem('epds_draft');
  });
</script>

<svelte:head>
  <title>Assessment Forms - Mental Health Tracker</title>
</svelte:head>

<section class="forms-landing" style="max-width:900px;margin:0 auto;padding:20px">
  <!-- Header -->
  <div class="page-head" style="margin-bottom:40px">
    <button 
      on:click={goBack}
      class="back-btn"
      style="background:none;border:none;color:#6366f1;cursor:pointer;font-size:1rem;margin-bottom:12px;padding:8px 0;display:flex;align-items:center;gap:6px"
    >
      ← Back to Dashboard
    </button>
    <h1 style="margin:0 0 12px;font-size:2rem;color:#1e293b">Assessment Forms</h1>
    <p class="muted" style="margin:0;line-height:1.6">
      Select an assessment form to complete
    </p>
  </div>

  <!-- Form Selection Cards -->
  <div style="display:grid;gap:20px;margin-bottom:40px">
    <!-- PHQ-9 Card -->
    <div 
      class="form-card"
      style="
        background:#fff;
        border:2px solid #e5e7eb;
        border-radius:16px;
        padding:28px;
        cursor:pointer;
        transition:all 0.3s;
        position:relative;
      "
      on:click={goToPHQ9}
      on:mouseenter={(e) => {
        e.currentTarget.style.borderColor = '#6366f1';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      on:mouseleave={(e) => {
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {#if phq9Draft}
        <div style="position:absolute;top:16px;right:16px;background:#f59e0b;color:#fff;padding:4px 12px;border-radius:20px;font-size:0.8rem;font-weight:600">
          Draft Saved
        </div>
      {/if}

      <div style="display:flex;align-items:start;gap:20px">
        <div style="
          background:#eef2ff;
          width:56px;
          height:56px;
          border-radius:12px;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:1.2rem;
          font-weight:700;
          color:#6366f1;
          flex-shrink:0;
        ">
          PHQ
        </div>

        <div style="flex:1">
          <h2 style="margin:0 0 8px;font-size:1.4rem;color:#1e293b;font-weight:700">
            PHQ-9
          </h2>
          <h3 style="margin:0 0 12px;font-size:1.05rem;color:#6366f1;font-weight:600">
            Patient Health Questionnaire-9
          </h3>
          <p style="margin:0 0 16px;color:#64748b;line-height:1.6">
            Screening tool for depression. Assesses how often you've been bothered by problems over the last 2 weeks.
          </p>

          <div style="display:flex;gap:16px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:6px;color:#64748b;font-size:0.9rem">
              <span style="font-weight:600;color:#1e293b">9</span> questions
            </div>
            <div style="display:flex;align-items:center;gap:6px;color:#64748b;font-size:0.9rem">
              <span style="font-weight:600;color:#1e293b">~5</span> minutes
            </div>
            <div style="display:flex;align-items:center;gap:6px;color:#64748b;font-size:0.9rem">
              <span style="font-weight:600;color:#1e293b">0-27</span> score range
            </div>
          </div>
        </div>

        <div style="
          background:#6366f1;
          color:#fff;
          padding:10px 16px;
          border-radius:8px;
          font-weight:600;
          font-size:0.95rem;
          flex-shrink:0;
          align-self:center;
        ">
          Start →
        </div>
      </div>
    </div>

    <!-- EPDS Card -->
    <div 
      class="form-card"
      style="
        background:#fff;
        border:2px solid #e5e7eb;
        border-radius:16px;
        padding:28px;
        cursor:pointer;
        transition:all 0.3s;
        position:relative;
      "
      on:click={goToEPDS}
      on:mouseenter={(e) => {
        e.currentTarget.style.borderColor = '#6366f1';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      on:mouseleave={(e) => {
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {#if epdsDraft}
        <div style="position:absolute;top:16px;right:16px;background:#f59e0b;color:#fff;padding:4px 12px;border-radius:20px;font-size:0.8rem;font-weight:600">
          Draft Saved
        </div>
      {/if}

      <div style="display:flex;align-items:start;gap:20px">
        <div style="
          background:#fef3c7;
          width:56px;
          height:56px;
          border-radius:12px;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:1.1rem;
          font-weight:700;
          color:#f59e0b;
          flex-shrink:0;
        ">
          EPDS
        </div>

        <div style="flex:1">
          <h2 style="margin:0 0 8px;font-size:1.4rem;color:#1e293b;font-weight:700">
            EPDS
          </h2>
          <h3 style="margin:0 0 12px;font-size:1.05rem;color:#6366f1;font-weight:600">
            Edinburgh Postnatal Depression Scale
          </h3>
          <p style="margin:0 0 16px;color:#64748b;line-height:1.6">
            Screening tool for postnatal depression. Assesses how you have felt in the past 7 days.
          </p>

          <div style="display:flex;gap:16px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:6px;color:#64748b;font-size:0.9rem">
              <span style="font-weight:600;color:#1e293b">10</span> questions
            </div>
            <div style="display:flex;align-items:center;gap:6px;color:#64748b;font-size:0.9rem">
              <span style="font-weight:600;color:#1e293b">~5</span> minutes
            </div>
            <div style="display:flex;align-items:center;gap:6px;color:#64748b;font-size:0.9rem">
              <span style="font-weight:600;color:#1e293b">0-30</span> score range
            </div>
          </div>
        </div>

        <div style="
          background:#6366f1;
          color:#fff;
          padding:10px 16px;
          border-radius:8px;
          font-weight:600;
          font-size:0.95rem;
          flex-shrink:0;
          align-self:center;
        ">
          Start →
        </div>
      </div>
    </div>
  </div>

  <!-- Info Section -->
  <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:24px">
    <h3 style="margin:0 0 12px;font-size:1.1rem;color:#1e293b;font-weight:600">
      About These Assessments
    </h3>
    <ul style="margin:0;padding-left:20px;color:#64748b;line-height:1.8">
      <li>These forms are screening tools and do not provide a clinical diagnosis</li>
      <li>Your responses are confidential and will be shared with your therapist</li>
      <li>You can save drafts and complete forms later if needed</li>
      <li>If you're experiencing a crisis, please contact emergency services immediately</li>
    </ul>
  </div>
</section>

<style>
  .muted { 
    color: #64748b; 
  }

  .back-btn:hover {
    text-decoration: underline;
  }

  .form-card {
    user-select: none;
  }
</style>