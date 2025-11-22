<!-- frontend/src/routes/participant/forms/+page.svelte -->
<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  // PHQ-9 Questions 
  const questions = [
    { id: 1, text: 'Little interest or pleasure in doing things' },
    { id: 2, text: 'Feeling down, depressed or hopeless' },
    { id: 3, text: 'Trouble falling asleep, staying asleep, or sleeping too much' },
    { id: 4, text: 'Feeling tired or having little energy' },
    { id: 5, text: 'Poor appetite or overeating' },
    { id: 6, text: 'Feeling bad about yourself - or that you\'re a failure or have let yourself or your family down' },
    { id: 7, text: 'Trouble concentrating on things, such as reading the newspaper or watching television' },
    { id: 8, text: 'Moving or speaking so slowly that other people could have noticed. Or, the opposite - being so fidgety or restless that you have been moving around a lot more than usual' },
    { id: 9, text: 'Thoughts that you would be better off dead or of hurting yourself in some way' }
  ];

  const answerOptions = [
    { value: 0, label: 'Not at all' },
    { value: 1, label: 'Several days' },
    { value: 2, label: 'More than half the days' },
    { value: 3, label: 'Nearly every day' }
  ];

  // Form state
  let answers = {};
  let totalScore = 0;
  let isSubmitting = false;
  let errorMessage = '';
  let successMessage = '';
  let showConfirmation = false;

  // TODO: Get actual userId from authentication/session
  // For now using hardcoded value - replace with actual user authentication
  let userId = null;
  const API_BASE = "https://benessere-north-mental-health-tracker-backend.julissa-school101.workers.dev";

  // Calculate total score when answers change
  $: {
    totalScore = Object.values(answers).reduce((sum, val) => sum + (Number(val) || 0), 0);
  }

  // Check if all questions are answered
  $: isFormComplete = Object.keys(answers).length === 9;
  
  // Get severity level based on score
  $: severityLevel = getSeverityLevel(totalScore);

  function getSeverityLevel(score) {
    if (score <= 4) return { level: 'None-minimal', color: '#22c55e', description: 'Minimal depression' };
    if (score <= 9) return { level: 'Mild', color: '#84cc16', description: 'Mild depression' };
    if (score <= 14) return { level: 'Moderate', color: '#eab308', description: 'Moderate depression' };
    if (score <= 19) return { level: 'Moderately Severe', color: '#f97316', description: 'Moderately severe depression' };
    return { level: 'Severe', color: '#ef4444', description: 'Severe depression' };
  }

  function handleSubmit() {
    if (!isFormComplete) {
      errorMessage = 'Please answer all questions before submitting.';
      setTimeout(() => errorMessage = '', 5000);
      return;
    }

    // Show confirmation dialog
    showConfirmation = true;
  }

  async function confirmSubmit() {
    showConfirmation = false;
    isSubmitting = true;
    errorMessage = '';
    successMessage = '';

    // Check if userId exists
    if (!userId) {
      errorMessage = 'User not logged in. Please log in again.';
      isSubmitting = false;
      setTimeout(() => goto('/login'), 2000);
      return;
    }


    try {
      // Prepare data in the format expected by backend
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
        q9: parseInt(answers[9])
      };

      console.log('Submitting PHQ-9 form:', formData);

      const response = await fetch(`${API_BASE}/phq9`, {
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
        successMessage = `Form submitted successfully! Form ID: ${result.formId}. Redirecting...`;
        
        // Clear the draft from localStorage on successful submission
        localStorage.removeItem('phq9_draft');

        // Log success for debugging
        console.log('PHQ-9 Form submitted successfully:', {
          formId: result.formId,
          totalScore,
          severity: severityLevel.level
        });

        // Redirect after 2 seconds
        setTimeout(() => {
          goto('/participant');
        }, 2000);
      } else {
        // Handle error from backend
        errorMessage = result.error || 'Failed to submit form. Please try again.';
        console.error('Backend error:', result.error);
        isSubmitting = false;
      }
    } catch (error) {
      console.error('Network error submitting PHQ-9 form:', error);
      errorMessage = 'Network error. Please check your connection and try again.';
      isSubmitting = false;
    }
  }

  function cancelSubmit() {
    showConfirmation = false;
  }

  function saveDraft() {
    // Save to localStorage
    const draftData = {
      answers,
      totalScore,
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('phq9_draft', JSON.stringify(draftData));
    successMessage = 'Draft saved successfully!';
    
    setTimeout(() => {
      successMessage = '';
    }, 3000);
  }

  function goBack() {
    goto('/participant');
  }

  // Load draft on mount
  onMount(() => {
    // Get userId from localStorage
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      errorMessage = 'Please log in to access this form.';
      setTimeout(() => goto('/login'), 2000);
      return;
    }
    userId = storedUserId;
    console.log('Loaded userId from localStorage:', userId);

    // Load draft if exists
    const savedDraft = localStorage.getItem('phq9_draft');
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
  <title>PHQ-9 Form - Mental Health Tracker</title>
</svelte:head>

<section class="phq9-form" style="max-width:900px;margin:0 auto;padding:20px">
  <!-- Header -->
  <div class="page-head" style="margin-bottom:30px">
    <button 
      on:click={goBack}
      class="back-btn"
      style="background:none;border:none;color:#6366f1;cursor:pointer;font-size:1rem;margin-bottom:12px;padding:8px 0;display:flex;align-items:center;gap:6px"
    >
      ← Back to Dashboard
    </button>
    <h1 style="margin:0 0 12px;font-size:2rem;color:#1e293b">PHQ-9 Depression Screening</h1>
    <p class="muted" style="margin:0;line-height:1.6">
      <strong>Patient Health Questionnaire-9 (PHQ-9)</strong><br/>
      Over the last 2 weeks, how often have you been bothered by the following problems?
    </p>
  </div>

  <!-- Alert Messages -->
  {#if errorMessage}
    <div class="alert alert-error" style="background:#fee2e2;border:1px solid #fca5a5;padding:14px 16px;border-radius:10px;margin-bottom:20px;color:#991b1b;display:flex;align-items:start;gap:10px">
      <span style="font-size:1.2rem">⚠</span>
      <span>{errorMessage}</span>
    </div>
  {/if}

  {#if successMessage}
    <div class="alert alert-success" style="background:#d1fae5;border:1px solid #6ee7b7;padding:14px 16px;border-radius:10px;margin-bottom:20px;color:#065f46;display:flex;align-items:start;gap:10px">
      <span style="font-size:1.2rem">✓</span>
      <span>{successMessage}</span>
    </div>
  {/if}

  <!-- Form Card -->
  <div class="card" style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:24px;margin-bottom:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
    <form on:submit|preventDefault={handleSubmit}>
      <!-- Questions -->
      {#each questions as question, index}
        <div class="question-block" style="margin-bottom:32px;padding-bottom:24px;border-bottom:{index < questions.length - 1 ? '1px solid #f3f4f6' : 'none'}">
          <h3 style="margin-bottom:16px;font-size:1rem;font-weight:600;color:#1e293b;line-height:1.5">
            {question.id}. {question.text}
          </h3>
          
          <div class="options" style="display:grid;gap:10px">
            {#each answerOptions as option}
              <label 
                class="option-label"
                style="
                  display:flex;
                  align-items:center;
                  padding:14px 16px;
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

      <!-- Score Display -->
      <div style="background:#f8fafc;padding:20px;border-radius:12px;margin:20px 0">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="font-size:1.1rem;font-weight:600;color:#1e293b">Current Score</span>
          <span style="font-size:1.5rem;font-weight:700;color:{severityLevel.color}">{totalScore} / 27</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="color:#64748b">Severity Level:</span>
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
          <span style="font-size:0.85rem;font-weight:600;color:#6366f1">{Object.keys(answers).length} / 9 questions answered</span>
        </div>
        <div style="width:100%;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden">
          <div style="width:{(Object.keys(answers).length / 9) * 100}%;height:100%;background:#6366f1;transition:width 0.3s"></div>
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
          💾 Save Draft
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
          {isSubmitting ? '⏳ Submitting...' : '✓ Submit Form'}
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
        Are you sure you want to submit this PHQ-9 form? Your responses will be saved and sent to your therapist.
      </p>
      
      <div style="background:#f8fafc;padding:16px;border-radius:10px;margin-bottom:24px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:#64748b">Total Score:</span>
          <span style="font-weight:700;color:{severityLevel.color};font-size:1.1rem">{totalScore} / 27</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:#64748b">Severity:</span>
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

  /* Ensure radio buttons are visible */
  input[type="radio"] {
    flex-shrink: 0;
  }

  /* Animation for success/error messages */
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