<!-- frontend/src/routes/participant/forms/epds/+page.svelte -->
<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  // EPDS Questions with their specific answer options
  const questions = [
    {
      id: 1,
      text: 'I have been able to laugh and see the funny side of things',
      options: [
        { value: 0, label: 'As much as I always could' },
        { value: 1, label: 'Not quite so much now' },
        { value: 2, label: 'Definitely not so much now' },
        { value: 3, label: 'Not at all' }
      ]
    },
    {
      id: 2,
      text: 'I have looked forward with enjoyment to things',
      options: [
        { value: 0, label: 'As much as I ever did' },
        { value: 1, label: 'Rather less than I used to' },
        { value: 2, label: 'Definitely less than I used to' },
        { value: 3, label: 'Hardly at all' }
      ]
    },
    {
      id: 3,
      text: 'I have blamed myself unnecessarily when things went wrong',
      options: [
        { value: 3, label: 'Yes, most of the time' },
        { value: 2, label: 'Yes, some of the time' },
        { value: 1, label: 'Not very often' },
        { value: 0, label: 'No, never' }
      ]
    },
    {
      id: 4,
      text: 'I have been anxious or worried for no good reason',
      options: [
        { value: 0, label: 'No, not at all' },
        { value: 1, label: 'Hardly ever' },
        { value: 2, label: 'Yes, sometimes' },
        { value: 3, label: 'Yes, very often' }
      ]
    },
    {
      id: 5,
      text: 'I have felt scared or panicky for no very good reason',
      options: [
        { value: 3, label: 'Yes, quite a lot' },
        { value: 2, label: 'Yes, sometimes' },
        { value: 1, label: 'No, not much' },
        { value: 0, label: 'No, not at all' }
      ]
    },
    {
      id: 6,
      text: 'Things have been getting on top of me',
      options: [
        { value: 3, label: "Yes, most of the time I haven't been able to cope at all" },
        { value: 2, label: "Yes, sometimes I haven't been coping as well as usual" },
        { value: 1, label: 'No, most of the time I have coped quite well' },
        { value: 0, label: 'No, I have been coping as well as ever' }
      ]
    },
    {
      id: 7,
      text: 'I have been so unhappy that I have had difficulty sleeping',
      options: [
        { value: 3, label: 'Yes, most of the time' },
        { value: 2, label: 'Yes, sometimes' },
        { value: 1, label: 'Not very often' },
        { value: 0, label: 'No, not at all' }
      ]
    },
    {
      id: 8,
      text: 'I have felt sad or miserable',
      options: [
        { value: 3, label: 'Yes, most of the time' },
        { value: 2, label: 'Yes, quite often' },
        { value: 1, label: 'Not very often' },
        { value: 0, label: 'No, not at all' }
      ]
    },
    {
      id: 9,
      text: 'I have been so unhappy that I have been crying',
      options: [
        { value: 3, label: 'Yes, most of the time' },
        { value: 2, label: 'Yes, quite often' },
        { value: 1, label: 'Only occasionally' },
        { value: 0, label: 'No, never' }
      ]
    },
    {
      id: 10,
      text: 'The thought of harming myself has occurred to me',
      options: [
        { value: 3, label: 'Yes, quite often' },
        { value: 2, label: 'Sometimes' },
        { value: 1, label: 'Hardly ever' },
        { value: 0, label: 'Never' }
      ]
    }
  ];

  // Form state
  let answers = {};
  let totalScore = 0;
  let isSubmitting = false;
  let errorMessage = '';
  let successMessage = '';
  let showConfirmation = false;

  let userId = null;
  const API_BASE = "https://benessere-north-mental-health-tracker-backend.julissa-school101.workers.dev";

  // Calculate total score when answers change
  $: {
    totalScore = Object.values(answers).reduce((sum, val) => sum + (Number(val) || 0), 0);
  }

  // Check if all questions are answered
  $: isFormComplete = Object.keys(answers).length === 10;
  
  // Get severity level based on score
  $: severityLevel = getSeverityLevel(totalScore);

  function getSeverityLevel(score) {
    if (score <= 9) return { level: 'Low Risk', color: '#22c55e', description: 'Low risk of postnatal depression' };
    if (score <= 12) return { level: 'Moderate Risk', color: '#eab308', description: 'Moderate risk - follow-up recommended' };
    return { level: 'High Risk', color: '#ef4444', description: 'High risk - immediate attention recommended' };
  }

  function handleSubmit() {
    if (!isFormComplete) {
      errorMessage = 'Please answer all questions before submitting.';
      setTimeout(() => errorMessage = '', 5000);
      return;
    }

    showConfirmation = true;
  }

  async function confirmSubmit() {
    showConfirmation = false;
    isSubmitting = true;
    errorMessage = '';
    successMessage = '';

    if (!userId) {
      errorMessage = 'User not logged in. Please log in again.';
      isSubmitting = false;
      setTimeout(() => goto('/login'), 2000);
      return;
    }

    try {
      const currentUserId = localStorage.getItem('userId');     
      if (!currentUserId) {
        errorMessage = 'User not logged in. Please log in again.';
        isSubmitting = false;
        setTimeout(() => goto('/login'), 2000);
        return;
      }

      const formData = {
        user_id: parseInt(currentUserId),
        q1: parseInt(answers[1]),
        q2: parseInt(answers[2]),
        q3: parseInt(answers[3]),
        q4: parseInt(answers[4]),
        q5: parseInt(answers[5]),
        q6: parseInt(answers[6]),
        q7: parseInt(answers[7]),
        q8: parseInt(answers[8]),
        q9: parseInt(answers[9]),
        q10: parseInt(answers[10])
      };

      console.log('Submitting EPDS form:', formData);

      const response = await fetch(`${API_BASE}/epds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);

      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok && result.success) {
        successMessage = `EPDS form submitted successfully! Form ID: ${result.formId}. Redirecting...`;
        
        localStorage.removeItem('epds_draft');

        console.log('EPDS Form submitted successfully:', {
          formId: result.formId,
          totalScore,
          severity: severityLevel.level
        });

        setTimeout(() => {
          goto('/participant');
        }, 2000);
      } else {
        errorMessage = result.error || 'Failed to submit form. Please try again.';
        console.error('Backend error:', result.error);
        isSubmitting = false;
      }
    } catch (error) {
      console.error('Network error submitting EPDS form:', error);
      errorMessage = 'Network error. Please check your connection and try again.';
      isSubmitting = false;
    }
  }

  function cancelSubmit() {
    showConfirmation = false;
  }

  function saveDraft() {
    const draftData = {
      answers,
      totalScore,
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('epds_draft', JSON.stringify(draftData));
    successMessage = 'Draft saved successfully!';
    
    setTimeout(() => {
      successMessage = '';
    }, 3000);
  }

  function goBack() {
    goto('/participant/forms');
  }

  onMount(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      errorMessage = 'Please log in to access this form.';
      setTimeout(() => goto('/login'), 2000);
      return;
    }
    userId = storedUserId;
    console.log('Loaded userId from localStorage:', userId);

    const savedDraft = localStorage.getItem('epds_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        answers = draft.answers || {};
        console.log('Loaded draft from localStorage');
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  });
</script>

<svelte:head>
  <title>EPDS Form - Mental Health Tracker</title>
</svelte:head>

<section class="epds-form" style="max-width:900px;margin:0 auto;padding:20px">
  <!-- Header -->
  <div class="page-head" style="margin-bottom:30px">
    <button 
      on:click={goBack}
      class="back-btn"
      style="background:none;border:none;color:#6366f1;cursor:pointer;font-size:1rem;margin-bottom:12px;padding:8px 0;display:flex;align-items:center;gap:6px"
    >
      ← Back to Forms
    </button>
    <h1 style="margin:0 0 12px;font-size:2rem;color:#1e293b">Edinburgh Postnatal Depression Scale (EPDS)</h1>
    <p class="muted" style="margin:0;line-height:1.6">
      Please select the answer that comes closest to how you have felt in the <strong>past 7 days</strong>. 
      This tool is for screening only and does not make a diagnosis.
    </p>
  </div>

  <!-- Messages -->
  {#if errorMessage}
    <div class="alert" style="background:#fee;border:1px solid #fcc;color:#c33;padding:16px;border-radius:10px;margin-bottom:20px">
      {errorMessage}
    </div>
  {/if}

  {#if successMessage}
    <div class="alert" style="background:#efe;border:1px solid #cfc;color:#3c3;padding:16px;border-radius:10px;margin-bottom:20px">
      {successMessage}
    </div>
  {/if}

  <!-- Form -->
  <div class="form-container">
    <form on:submit|preventDefault={handleSubmit}>
      {#each questions as question}
        <div class="question-card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:16px">
          <h3 style="margin:0 0 16px;font-size:1.05rem;color:#1e293b;font-weight:600">
            {question.id}. {question.text}
          </h3>
          <div class="options-grid" style="display:grid;gap:10px">
            {#each question.options as option}
              <label
                style="
                  display:flex;
                  align-items:center;
                  padding:14px;
                  border:2px solid {answers[question.id] === option.value ? '#6366f1' : '#e5e7eb'};
                  border-radius:10px;
                  cursor:pointer;
                  background:{answers[question.id] === option.value ? '#eef2ff' : '#fff'};
                  transition:all 0.2s;
                  user-select:none
                "
                on:mouseenter={(e) => {
                  if (answers[question.id] !== option.value) {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.background = '#f8fafc';
                  }
                }}
                on:mouseleave={(e) => {
                  if (answers[question.id] !== option.value) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.background = '#fff';
                  }
                }}
              >
                <input 
                  type="radio" 
                  name="question{question.id}" 
                  value={option.value}
                  bind:group={answers[question.id]}
                  style="margin-right:12px;width:20px;height:20px;cursor:pointer;accent-color:#6366f1"
                />
                <span style="font-size:0.95rem;color:#1e293b;flex:1">{option.label}</span>
                <span style="font-weight:600;color:#6366f1;font-size:0.9rem">+{option.value}</span>
              </label>
            {/each}
          </div>
        </div>
      {/each}

      <!-- Important Safety Notice -->
      <div style="background:#fef2f2;border:2px solid #fca5a5;border-radius:12px;padding:20px;margin:20px 0">
        <p style="margin:0;color:#991b1b;font-weight:600;line-height:1.6">
          WARNING: If you have had <strong>any thoughts of harming yourself or your baby</strong>, or you are having hallucinations, 
          tell your doctor or midwife immediately, or go to your nearest hospital emergency room.
        </p>
      </div>

      <!-- Score Display -->
      <div style="background:#f8fafc;padding:20px;border-radius:12px;margin:20px 0">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="font-size:1.1rem;font-weight:600;color:#1e293b">Current Score</span>
          <span style="font-size:1.5rem;font-weight:700;color:{severityLevel.color}">{totalScore} / 30</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="color:#64748b">Risk Level:</span>
          <span style="
            padding:6px 12px;
            border-radius:8px;
            font-weight:600;
            background:{severityLevel.color}20;
            color:{severityLevel.color}
          ">
            {severityLevel.level}
          </span>
        </div>
        <p style="margin:12px 0 0;font-size:0.9rem;color:#64748b;line-height:1.5">
          {severityLevel.description}
        </p>
      </div>

      <!-- Progress Indicator -->
      <div style="margin:20px 0">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:0.85rem;color:#64748b">Progress</span>
          <span style="font-size:0.85rem;font-weight:600;color:#6366f1">{Object.keys(answers).length} / 10 questions answered</span>
        </div>
        <div style="width:100%;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden">
          <div style="width:{(Object.keys(answers).length / 10) * 100}%;height:100%;background:#6366f1;transition:width 0.3s"></div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="button-group" style="display:flex;gap:12px;justify-content:flex-end;margin-top:24px;flex-wrap:wrap">
        <button 
          type="button" 
          on:click={saveDraft}
          class="btn outline"
          style="padding:12px 24px;border-radius:10px;border:1px solid #e5e7eb;background:#fff;cursor:pointer;font-size:1rem;font-weight:500;color:#64748b;transition:all 0.2s"
          on:mouseenter={(e) => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          on:mouseleave={(e) => {
            e.currentTarget.style.background = '#fff';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          Save Draft
        </button>
        <button 
          type="submit" 
          disabled={!isFormComplete || isSubmitting}
          class="btn primary"
          style="
            padding:12px 32px;
            border-radius:10px;
            background:{!isFormComplete || isSubmitting ? '#cbd5e1' : '#6366f1'};
            color:#fff;
            border:none;
            cursor:{!isFormComplete || isSubmitting ? 'not-allowed' : 'pointer'};
            font-size:1rem;
            font-weight:600;
            transition:all 0.2s;
            box-shadow:{!isFormComplete || isSubmitting ? 'none' : '0 4px 6px rgba(99, 102, 241, 0.25)'}
          "
          on:mouseenter={(e) => {
            if (!(!isFormComplete || isSubmitting)) {
              e.currentTarget.style.background = '#4f46e5';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          on:mouseleave={(e) => {
            if (!(!isFormComplete || isSubmitting)) {
              e.currentTarget.style.background = '#6366f1';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Form'}
        </button>
      </div>
    </form>
  </div>
</section>

<!-- Confirmation Modal -->
{#if showConfirmation}
  <div 
    class="modal-overlay" 
    style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px"
    on:click={cancelSubmit}
  >
    <div 
      class="modal-content" 
      style="background:#fff;border-radius:16px;padding:32px;max-width:500px;width:100%;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1)"
      on:click|stopPropagation
    >
      <h2 style="margin:0 0 16px;font-size:1.5rem;color:#1e293b">Confirm Submission</h2>
      <p style="margin:0 0 20px;color:#64748b;line-height:1.6">
        Are you sure you want to submit this EPDS form? Your responses will be saved and sent to your therapist.
      </p>
      
      <div style="background:#f8fafc;padding:16px;border-radius:10px;margin-bottom:24px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:#64748b">Total Score:</span>
          <span style="font-weight:700;color:{severityLevel.color};font-size:1.1rem">{totalScore} / 30</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:#64748b">Risk Level:</span>
          <span style="font-weight:600;color:{severityLevel.color}">{severityLevel.level}</span>
        </div>
      </div>

      <div style="display:flex;gap:12px;justify-content:flex-end">
        <button 
          on:click={cancelSubmit}
          style="padding:10px 20px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;cursor:pointer;font-size:0.95rem;font-weight:500;color:#64748b"
          on:mouseenter={(e) => {
            e.currentTarget.style.background = '#f8fafc';
          }}
          on:mouseleave={(e) => {
            e.currentTarget.style.background = '#fff';
          }}
        >
          Cancel
        </button>
        <button 
          on:click={confirmSubmit}
          style="padding:10px 24px;border-radius:8px;background:#6366f1;color:#fff;border:none;cursor:pointer;font-size:0.95rem;font-weight:600"
          on:mouseenter={(e) => {
            e.currentTarget.style.background = '#4f46e5';
          }}
          on:mouseleave={(e) => {
            e.currentTarget.style.background = '#6366f1';
          }}
        >
          Yes, Submit
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .muted { 
    color: #64748b; 
  }
  
  .btn { 
    font-family: inherit;
    font-weight: 500;
  }
  
  .btn:disabled { 
    cursor: not-allowed !important; 
  }

  .back-btn:hover {
    text-decoration: underline;
  }

  input[type="radio"] {
    flex-shrink: 0;
  }

  .alert {
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from {
      transform: translateY(-10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>