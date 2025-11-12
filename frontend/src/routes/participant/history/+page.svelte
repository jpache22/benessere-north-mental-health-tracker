<!-- src/routes/participant/history/+page.svelte -->
<script>
  import { onMount } from 'svelte';

  let forms = [];
  let isLoading = false;

  let filterForm = 'all';
  let filterTime = 'last6';
  let searchQuery = '';

  // Fetch user's PHQ-9 submissions
  async function fetchForms() {
    isLoading = true;
    try {
      const userId = 20;
      const apiUrl = import.meta.env.VITE_API_URL;
      
      console.log('Fetching forms for user:', userId);
      
      const response = await fetch(`${apiUrl}/phq9/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('History data:', data);
        
        if (data.success && data.phq9) {
          forms = data.phq9.map(form => ({
            name: 'PHQ-9',
            date: new Date(form.completion_date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            score: `${form.total_score}/27`,
            status: form.depression_severity,
            statusColor: getSeverityColor(form.depression_severity),
            rawScore: form.total_score,
            rawData: form
          }));
          console.log('Processed forms:', forms);
        }
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      isLoading = false;
    }
  }

  function getSeverityColor(severity) {
    const colors = {
      'None-minimal': '#22c55e',
      'Mild': '#fb923c',
      'Moderate': '#eab308',
      'Moderately Severe': '#f97316',
      'Severe': '#ef4444'
    };
    return colors[severity] || '#94a3b8';
  }

  $: filtered = forms.filter(f => {
    if (filterForm !== 'all' && f.name !== filterForm) return false;
    if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Calculate trend data from actual submissions
  $: trendData = forms.map(form => ({
    date: form.date,
    score: form.rawScore
  }));

  let selectedForm = 'PHQ-9';
  let showAllForms = false;
  let compareForms = false;

  onMount(() => {
    fetchForms();
  });
</script>

<section class="form-history">
  <div class="page-head" style="margin-bottom:20px">
    <h1>Form History</h1>
  </div>

  <!-- Filters -->
  <div class="filters" style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;align-items:center">
    <span style="color:var(--muted)">Filter:</span>
    <select bind:value={filterForm} class="input" style="padding:8px 12px;border:1px solid var(--border);border-radius:10px;background:#fff">
      <option value="all">All Forms ▼</option>
      <option value="PHQ-9">PHQ-9</option>
      <option value="GAD-7">GAD-7</option>
      <option value="EPDS">EPDS</option>
      <option value="Q-LES">Q-LES</option>
    </select>
    <select bind:value={filterTime} class="input" style="padding:8px 12px;border:1px solid var(--border);border-radius:10px;background:#fff">
      <option value="last6">Last 6 months ▼</option>
      <option value="last3">Last 3 months</option>
      <option value="lastyear">Last year</option>
      <option value="all">All time</option>
    </select>
    <input type="search" bind:value={searchQuery} placeholder="🔍 Search..." class="input" style="padding:8px 12px;border:1px solid var(--border);border-radius:10px;background:#fff;flex:1;min-width:200px" />
  </div>

  <!-- Table -->
  <div class="card" style="background:#fff;border:1px solid var(--border);border-radius:16px;margin-bottom:20px">
    <div class="table-wrap" style="overflow:auto">
      <table style="width:100%;border-collapse:separate;border-spacing:0">
        <thead>
          <tr>
            <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">
              Form Name ⇅
            </th>
            <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">
              Date ⇅
            </th>
            <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">
              Score
            </th>
            <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">
              Status
            </th>
            <th style="padding:12px 16px;border-bottom:1px solid var(--border);background:#f8fafc;text-align:left;color:var(--muted);font-weight:600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {#each filtered as form}
            <tr>
              <td style="padding:12px 16px;border-bottom:1px solid var(--border)">{form.name}</td>
              <td style="padding:12px 16px;border-bottom:1px solid var(--border)">{form.date}</td>
              <td style="padding:12px 16px;border-bottom:1px solid var(--border)">{form.score}</td>
              <td style="padding:12px 16px;border-bottom:1px solid var(--border)">
                {#if form.status === 'draft'}
                  <span style="display:inline-flex;align-items:center;gap:6px">
                    <span style="width:12px;height:12px;border-radius:50%;background:{form.statusColor}"></span>
                    (Draft {form.progress}%)
                  </span>
                {:else}
                  <span style="display:inline-flex;align-items:center;gap:6px">
                    <span style="width:12px;height:12px;border-radius:50%;background:{form.statusColor}"></span>
                    {form.status}
                  </span>
                {/if}
              </td>
              <td style="padding:12px 16px;border-bottom:1px solid var(--border)">
                {#if form.status === 'draft'}
                  <button class="btn small" style="padding:6px 12px;border-radius:8px">[ Continue ]</button>
                {:else}
                  <button class="btn small outline" style="padding:6px 12px;border-radius:8px">[ View ]</button>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Pagination -->
  <div style="text-align:center;margin-bottom:30px;color:var(--muted)">
    Showing 4 of 8 results
    <span style="margin-left:20px">
      &lt; 1 2 3 4 5 &gt;
    </span>
  </div>

  <!-- Score Trend Chart -->
  <div class="card" style="background:#fff;border:1px solid var(--border);border-radius:16px;padding:20px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h2 style="margin:0">Score Trend</h2>
      <select bind:value={selectedForm} class="input" style="padding:8px 12px;border:1px solid var(--border);border-radius:10px;background:#fff">
        <option value="PHQ-9">Viewing: [PHQ-9 ▼]</option>
        <option value="GAD-7">Viewing: [GAD-7 ▼]</option>
        <option value="EPDS">Viewing: [EPDS ▼]</option>
      </select>
    </div>

    <!-- Simple chart visualization -->
    <div class="chart-area" style="position:relative;height:280px;border:1px solid var(--border);border-radius:12px;padding:20px;background:#fafafa">
      <!-- Y-axis labels -->
      <div style="position:absolute;left:20px;top:20px;bottom:40px;display:flex;flex-direction:column;justify-content:space-between;color:var(--muted)">
        <span>27</span>
        <span>21</span>
        <span>15</span>
        <span>9</span>
        <span>3</span>
        <span>0</span>
      </div>

      <!-- Chart area with dots -->
      <div style="position:absolute;left:80px;right:180px;top:20px;bottom:40px">
        {#each trendData as point, i}
          <div style="position:absolute;left:{i * 25}%;bottom:{(point.score / 27) * 100}%;width:12px;height:12px;background:#000;border-radius:50%;transform:translate(-50%, 50%)"></div>
        {/each}
      </div>

      <!-- X-axis labels -->
      <div style="position:absolute;left:80px;right:180px;bottom:10px;display:flex;justify-content:space-between;color:var(--muted)">
        {#each trendData as point}
          <span style="font-size:.85rem">{point.date}</span>
        {/each}
      </div>

      <!-- Checkboxes -->
      <div style="position:absolute;right:20px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:12px">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" bind:checked={showAllForms} />
          <span>Show all forms</span>
        </label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" bind:checked={compareForms} />
          <span>Compare forms</span>
        </label>
      </div>
    </div>
  </div>
</section>

<style>
  .btn.small{font-size:.9rem}
  .btn.outline{background:#fff;border:1px solid var(--border);color:inherit}
  .btn.outline:hover{background:#f8fafc}
</style>