<script>
  import { goto } from '$app/navigation';
  export let data;

  // top section (projects)
  let projects = data.projects ?? [];
  let selectedProjectId = data.selectedProjectId || '';
  let selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  // tabs / categories
  const categories = [
    { key: 'screening', label: 'Screening Forms' },
    { key: 'pre',       label: 'Pre-Therapy Forms' },
    { key: 'post',      label: 'Post-Therapy Forms' }
  ];
  let currentCat = data.initialCategory ?? 'screening';

  // available forms & assignments from loader
  let formsByCategory = data.formsByCategory || { screening: [], pre: [], post: [] };
  let assigned = data.assignments || { screening: [], pre: [], post: [] };

  // local editable state: include/required for each form in each category
  // build map: {cat: {formId: {include,required}}}
  let state = { screening: {}, pre: {}, post: {} };

  function seedState() {
    for (const c of Object.keys(state)) {
      state[c] = {};
      const available = formsByCategory[c] ?? [];
      const assignedIds = new Set((assigned[c] ?? []).map(a => a.id));
      const requiredIds = new Set((assigned[c] ?? []).filter(a => a.required).map(a => a.id));
      for (const f of available) {
        state[c][f.id] = {
          include: assignedIds.has(f.id),
          required: requiredIds.has(f.id)
        };
      }
    }
  }
  seedState();

  function selectProject(p) {
    selectedProject = p || null;
    selectedProjectId = p?.id || '';
    // persist in URL (keep current tab)
    const params = new URLSearchParams();
    if (selectedProjectId) params.set('project', selectedProjectId);
    if (currentCat) params.set('cat', currentCat);
    goto(`/coordinator/forms${params.toString() ? `?${params}` : ''}`, { replaceState: true, noScroll: true });
  }

  function changeCat(cat) {
    currentCat = cat;
    const params = new URLSearchParams();
    if (selectedProjectId) params.set('project', selectedProjectId);
    params.set('cat', currentCat);
    goto(`/coordinator/forms?${params.toString()}`, { replaceState: true, noScroll: true });
  }

  // derived: visible list for current category with bindable checkboxes
  $: visibleForms = (formsByCategory[currentCat] ?? []).map(f => ({
    ...f,
    include: state[currentCat]?.[f.id]?.include ?? false,
    required: state[currentCat]?.[f.id]?.required ?? false
  }));

  function toggleInclude(fid) {
    const row = state[currentCat][fid];
    if (!row) return;
    row.include = !row.include;
    if (!row.include) row.required = false; // cannot require if not included
  }
  function toggleRequired(fid) {
    const row = state[currentCat][fid];
    if (!row || !row.include) return; // only if included
    row.required = !row.required;
  }

  // summary: list selected by category
  function summaryList(catKey) {
    const available = formsByCategory[catKey] ?? [];
    const map = state[catKey] ?? {};
    return available.filter(f => map[f.id]?.include).map(f => f.name);
  }
  $: sumScreening = summaryList('screening');
  $: sumPre       = summaryList('pre');
  $: sumPost      = summaryList('post');

  // save payload builder
  function buildPayload() {
    const payload = { projectId: selectedProjectId, screening: [], pre: [], post: [] };
    for (const c of Object.keys(state)) {
      const map = state[c];
      for (const [id, cfg] of Object.entries(map)) {
        if (cfg.include) payload[c].push({ id, required: !!cfg.required });
      }
    }
    return payload;
  }

  let saving = false, saveMsg = '';
  async function saveChanges() {
    if (!selectedProjectId) return;
    saving = true; saveMsg = '';
    try {
      const res = await fetch('/api/coordinator/forms/save', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(buildPayload())
      });
      if (!res.ok) throw new Error('Failed to save');
      saveMsg = 'Saved!';
    } catch (e) {
      saveMsg = 'Save failed. Try again.';
    } finally {
      saving = false;
      setTimeout(() => (saveMsg = ''), 2000);
    }
  }
</script>

<section class="content page-forms-admin">
  <!-- welcome / stats banner is up to your overview page; keeping page focused -->

  <h1>Assign Forms to Project</h1>

  <!-- Projects overview -->
  <div class="card table">
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Project</th><th>Groups</th><th>Therapists</th><th>Participants</th><th>Forms</th><th class="right">Used Action</th>
          </tr>
        </thead>
        <tbody>
          {#each projects as p}
            <tr>
              <td>{p.name}</td>
              <td>{p.groups ?? 0}</td>
              <td>{p.therapists ?? 0}</td>
              <td>{p.participants ?? 0}</td>
              <td>{p.formCount ?? 0} Forms</td>
              <td class="right">
                <button class="link-btn" on:click={() => selectProject(p)}>Manage Forms</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    {#if projects.length === 0}
      <div class="empty"><p>No projects found.</p></div>
    {/if}
  </div>

  {#if selectedProject}
    <div class="assign-grid">
      <div class="assign-main">
        <h2>Assign Forms for Project: <span class="highlight">{selectedProject.name}</span></h2>

        <!-- Tabs -->
        <div class="tabs">
          {#each categories as c}
            <button class:selected={currentCat === c.key} on:click={() => changeCat(c.key)}>{c.label}</button>
          {/each}
        </div>

        <!-- Forms table for current category -->
        <div class="card">
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Form Name</th><th>Description</th><th>Include</th><th>Required</th><th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {#each visibleForms as f}
                  <tr>
                    <td>{f.name}</td>
                    <td>{f.description ?? '-'}</td>
                    <td>
                      <input type="checkbox"
                        checked={state[currentCat][f.id]?.include}
                        on:change={() => toggleInclude(f.id)} />
                    </td>
                    <td>
                      <input type="checkbox"
                        disabled={!state[currentCat][f.id]?.include}
                        checked={state[currentCat][f.id]?.required}
                        on:change={() => toggleRequired(f.id)} />
                    </td>
                    <td>{f.notes ?? '-'}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          {#if visibleForms.length === 0}
            <div class="empty"><p>No forms in this category.</p></div>
          {/if}
        </div>

        <div class="save-bar">
          <button class="btn" disabled={!selectedProjectId || saving} on:click={saveChanges}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {#if saveMsg}<span class="muted" style="margin-left:10px">{saveMsg}</span>{/if}
        </div>
      </div>

      <!-- Summary panel -->
      <aside class="summary">
        <h3>Summary</h3>
        <div class="sum-block">
          <div class="sum-title">Screening</div>
          <div class="sum-line">{sumScreening.length ? sumScreening.join(', ') : '—'}</div>
        </div>
        <div class="sum-block">
          <div class="sum-title">Pre-Therapy</div>
          <div class="sum-line">{sumPre.length ? sumPre.join(', ') : '—'}</div>
        </div>
        <div class="sum-block">
          <div class="sum-title">Post-Therapy</div>
          <div class="sum-line">{sumPost.length ? sumPost.join(', ') : '—'}</div>
        </div>
        <small class="muted" style="display:block;margin-top:8px">
          ⏲ Last updated will show from backend metadata.
        </small>
      </aside>
    </div>
  {/if}
</section>

<style>
  .page-forms-admin h1{margin-bottom:10px}
  .highlight{color:var(--brand-strong)}
  .card{background:#fff;border:1px solid var(--border);border-radius:16px}
  .table-wrap{overflow:auto;border-radius:16px}
  .table{width:100%;border-collapse:separate;border-spacing:0}
  .table th{padding:12px 14px;border-bottom:1px solid var(--border);background:#f8fafc;color:var(--muted);text-align:left}
  .table td{padding:12px 14px;border-bottom:1px solid var(--border)}
  .right{text-align:right}
  .empty{padding:20px;text-align:center}
  .link-btn{background:none;border:none;color:#2563eb;text-decoration:underline;cursor:pointer;font-weight:600}

  .assign-grid{display:grid;grid-template-columns:1fr 320px;gap:16px;margin-top:16px}
  @media (max-width: 1000px){ .assign-grid{grid-template-columns:1fr} }

  .tabs{display:flex;gap:8px;margin:12px 0 14px}
  .tabs button{
    background:#fff;border:1px solid var(--border);padding:8px 12px;border-radius:10px;cursor:pointer
  }
  .tabs button.selected{background:var(--brand);color:#fff;border-color:var(--brand)}

  .save-bar{display:flex;align-items:center;gap:10px;margin-top:10px}

  .summary{background:#fff;border:1px solid var(--border);border-radius:16px;padding:14px}
  .summary h3{margin:6px 0 10px}
  .sum-block{margin-bottom:8px}
  .sum-title{font-weight:700}
  .sum-line{color:#0f172a}
</style>
