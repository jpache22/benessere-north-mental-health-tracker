<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { fade } from 'svelte/transition';

  const API_BASE = "https://benessere-north-mental-health-tracker-backend.julissa-school101.workers.dev";
  
  let phq9History = [];
  let loading = true;
  let error = '';
  
  // Filters
  let filterForm = 'all'; // Kept for UI consistency, though currently only PHQ-9 exists
  let filterTime = 'all';
  let searchQuery = '';

  // --- Computed Logic ---

  // 1. Filter the data
  $: filtered = phq9History.filter(form => {
    // Date Filter
    if (filterTime !== 'all') {
      const formDate = new Date(form.completion_date);
      const now = new Date();
      const monthsAgo = filterTime === 'last6' ? 6 : filterTime === 'last3' ? 3 : 12;
      const cutoff = new Date(now.setMonth(now.getMonth() - monthsAgo));
      if (formDate < cutoff) return false;
    }
    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const dateStr = new Date(form.completion_date).toLocaleDateString().toLowerCase();
      const scoreStr = form.total_score.toString();
      if (!dateStr.includes(query) && !scoreStr.includes(query)) return false;
    }
    return true;
  }).sort((a, b) => new Date(a.completion_date) - new Date(b.completion_date)); // Sort Oldest -> Newest for Graph

  // 2. Prepare Graph Data (SVG Logic)
  $: graphPoints = filtered.map((form, index) => {
    const x = (index / (filtered.length - 1 || 1)) * 100; // X position percentage
    const y = 100 - ((form.total_score / 27) * 100); // Y position percentage (inverted because SVG 0 is top)
    return { x, y, score: form.total_score, date: formatDate(form.completion_date, true) };
  });
  
  // Create the polyline string "x,y x,y x,y"
  $: polylineString = graphPoints.map(p => `${p.x},${p.y}`).join(' ');

  // --- Helpers ---

  function formatDate(dateString, short = false) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: short ? 'short' : 'short',
      day: 'numeric',
      year: short ? undefined : 'numeric'
    });
  }

  function getSeverityConfig(severity) {
    // Maps severity to Version 2 style colors
    const config = {
      'None-minimal': { color: '#22c55e', label: 'Minimal' }, // Green
      'Mild': { color: '#fb923c', label: 'Mild' },            // Orange
      'Moderate': { color: '#eab308', label: 'Moderate' },    // Yellow
      'Moderately Severe': { color: '#f472b6', label: 'Mod. Severe' }, // Pink
      'Severe': { color: '#ef4444', label: 'Severe' }         // Red
    };
    return config[severity] || { color: '#94a3b8', label: severity };
  }

  async function loadHistory() {
    const userId = localStorage.getItem('userId');    
    if (!userId) {
      goto('/login');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/phq9/${userId}`);
      const data = await res.json();
      if (data.success && data.phq9) {
        phq9History = data.phq9;
      } else if (res.status === 404) {
        phq9History = [];
      } else {
        error = 'Failed to load form history';
      }
      loading = false;
    } catch (err) {
      console.error(err);
      error = 'Network error loading history';
      loading = false;
    }
  }

  onMount(() => {
    loadHistory();
  });
</script>

<svelte:head>
  <title>Form History - Mental Health Tracker</title>
</svelte:head>

<section class="form-history">
  <div class="page-head">
    <h1>Form History</h1>
    <p class="subtitle">Track your mental health journey over time</p>
  </div>

  <div class="filters">
    <div class="filter-group">
      <span class="filter-label">Filter:</span>
      <select bind:value={filterForm} class="input select">
        <option value="all">All Forms ▼</option>
        <option value="PHQ-9">PHQ-9</option>
      </select>
      
      <select bind:value={filterTime} class="input select">
        <option value="all">All time ▼</option>
        <option value="last3">Last 3 months</option>
        <option value="last6">Last 6 months</option>
        <option value="last12">Last year</option>
      </select>
    </div>

    <input 
      type="search" 
      bind:value={searchQuery} 
      placeholder="🔍 Search date or score..." 
      class="input search-bar" 
    />
  </div>

  {#if error}
    <div class="alert-error">
      {error}
    </div>
  {/if}

  {#if loading}
    <div class="loading-state">
      <div class="spinner">⏳</div>
      <p>Loading history...</p>
    </div>
  {:else if filtered.length === 0}
    <div class="empty-state">
      <div class="icon">📝</div>
      <h2>No Forms Found</h2>
      <p>Adjust your filters or complete your first assessment.</p>
      <a href="/participant/forms" class="btn primary">Complete PHQ-9 Form</a>
    </div>
  {:else}
    
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Form Name ⇅</th>
              <th>Date ⇅</th>
              <th>Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each filtered as form}
              {@const status = getSeverityConfig(form.depression_severity)}
              <tr transition:fade>
                <td class="font-medium">PHQ-9</td>
                <td class="text-muted">{formatDate(form.completion_date)}</td>
                <td class="font-bold">{form.total_score}<span class="text-light">/27</span></td>
                <td>
                  <span class="status-pill">
                    <span class="dot" style="background: {status.color}"></span>
                    {status.label}
                  </span>
                </td>
                <td>
                  <button class="btn small outline">View</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      
      <div class="pagination-footer">
        Showing {filtered.length} results
      </div>
    </div>

    <div class="card graph-card">
      <div class="graph-header">
        <h2>Score Trend (PHQ-9)</h2>
        <div class="legend">
          <span class="legend-dot"></span> Score / 27
        </div>
      </div>

      <div class="chart-container">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="chart-svg">
          {#each [0, 9, 15, 21, 27] as line}
             <line x1="0" y1={100 - (line/27*100)} x2="100" y2={100 - (line/27*100)} stroke="#f1f5f9" stroke-width="0.5" />
          {/each}

          <polyline 
            points={polylineString} 
            fill="none" 
            stroke="#6366f1" 
            stroke-width="1" 
            vector-effect="non-scaling-stroke"
          />

          {#each graphPoints as point}
            <circle 
              cx={point.x} 
              cy={point.y} 
              r="1.5" 
              fill="#fff" 
              stroke="#6366f1" 
              stroke-width="1" 
              vector-effect="non-scaling-stroke"
            />
          {/each}
        </svg>

        <div class="x-axis">
           {#each graphPoints as point, i}
              {#if graphPoints.length <= 8 || i % Math.ceil(graphPoints.length/6) === 0}
                <span style="left: {point.x}%">{point.date}</span>
              {/if}
           {/each}
        </div>
      </div>
    </div>
  {/if}
</section>

<style>
  /* --- Global Variables --- */
  :global(:root) {
    --border: #e5e7eb;
    --muted: #64748b;
    --primary: #6366f1;
    --bg-card: #ffffff;
    --bg-page: #f8fafc;
  }

  /* --- Layout & Type --- */
  .form-history {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  .page-head { margin-bottom: 24px; }
  h1 { margin: 0; font-size: 1.75rem; color: #1e293b; }
  .subtitle { color: var(--muted); margin: 8px 0 0; }

  /* --- Filters --- */
  .filters {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;
    align-items: center;
  }
  .filter-group { display: flex; align-items: center; gap: 10px; }
  .filter-label { color: var(--muted); font-size: 0.9rem; }
  
  .input {
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: #fff;
    font-size: 0.9rem;
    color: #334155;
  }
  .select { cursor: pointer; }
  .search-bar { flex: 1; min-width: 200px; }

  /* --- Card & Table --- */
  .card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    overflow: hidden;
  }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  
  th {
    padding: 14px 20px;
    background: #f8fafc;
    border-bottom: 1px solid var(--border);
    text-align: left;
    color: var(--muted);
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  td {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    color: #334155;
    font-size: 0.95rem;
  }

  tr:last-child td { border-bottom: none; }
  tr:hover { background-color: #f8fafc; }

  /* --- Typography helpers --- */
  .font-medium { font-weight: 600; color: #1e293b; }
  .font-bold { font-weight: 700; color: #0f172a; }
  .text-muted { color: var(--muted); font-size: 0.9rem; }
  .text-light { color: #cbd5e1; font-weight: 400; font-size: 0.85rem; margin-left: 2px; }

  /* --- Status Pills --- */
  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: #475569;
  }
  .dot { width: 8px; height: 8px; border-radius: 50%; }

  /* --- Buttons --- */
  .btn {
    display: inline-block;
    cursor: pointer;
    font-weight: 500;
    text-align: center;
    transition: all 0.2s;
    border: none;
  }
  .btn.primary {
    background: var(--primary);
    color: white;
    padding: 12px 24px;
    border-radius: 10px;
    text-decoration: none;
  }
  .btn.primary:hover { background: #4f46e5; }

  .btn.small.outline {
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: white;
    color: var(--muted);
    font-size: 0.85rem;
  }
  .btn.small.outline:hover { background: #f8fafc; color: #334155; border-color: #cbd5e1; }

  /* --- Pagination --- */
  .pagination-footer {
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    color: var(--muted);
    font-size: 0.85rem;
    text-align: center;
    background: #fcfcfc;
  }

  /* --- Graph --- */
  .graph-card { padding: 24px; }
  .graph-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  .graph-header h2 { font-size: 1.1rem; margin: 0; color: #1e293b; }
  
  .chart-container {
    position: relative;
    height: 250px;
    width: 100%;
    padding: 20px 30px 40px 30px; /* Top Right Bottom Left */
    background: #fafafa;
    border-radius: 12px;
    border: 1px solid #f1f5f9;
    box-sizing: border-box;
  }

  .chart-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .x-axis {
    position: absolute;
    bottom: 10px;
    left: 30px;
    right: 30px;
    height: 20px;
  }
  
  .x-axis span {
    position: absolute;
    transform: translateX(-50%);
    font-size: 0.75rem;
    color: #94a3b8;
    white-space: nowrap;
  }

  /* --- States --- */
  .loading-state, .empty-state {
    text-align: center;
    padding: 60px;
    background: white;
    border-radius: 16px;
    border: 1px solid var(--border);
  }
  .empty-state .icon { font-size: 3rem; margin-bottom: 16px; }
  .alert-error {
    background: #fee2e2;
    border: 1px solid #fca5a5;
    color: #991b1b;
    padding: 14px;
    border-radius: 10px;
    margin-bottom: 20px;
  }
</style>