export async function load({ fetch, url }) {
  const selected = url.searchParams.get('project') ?? '';     // project id (optional)
  const cat = url.searchParams.get('cat') ?? 'screening';     // screening|pre|post

  // 1) projects for the top table
  let projects = [];
  try {
    const r = await fetch('/api/coordinator/projects');
    if (r.ok) projects = await r.json();
  } catch (_) {}

  // 2) available forms by category (for selection list)
  let formsByCategory = { screening: [], pre: [], post: [] };
  try {
    const r = await fetch('/api/coordinator/forms/available');
    if (r.ok) formsByCategory = await r.json();
  } catch (_) {}

  // 3) current assignments for the selected project
  let assignments = { screening: [], pre: [], post: [] };
  if (selected) {
    try {
      const r = await fetch(`/api/coordinator/forms/assigned?project=${encodeURIComponent(selected)}`);
      if (r.ok) assignments = await r.json();
    } catch (_) {}
  }

  return {
    projects,
    formsByCategory,
    assignments,
    selectedProjectId: selected,
    initialCategory: cat
  };
}
