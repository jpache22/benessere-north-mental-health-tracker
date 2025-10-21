// Loads users with filters from URL, plus project list for assignment.
// Expected backend shapes (when wired):
// GET /api/coordinator/users           -> [{ id, name, email, role, status, projects:[{id,name}] }, ...]
// GET /api/coordinator/projects        -> [{ id, name }, ...]
// Roles: "intake" | "therapist"
// Status: "active" | "pending" | "deactivated"

export async function load({ fetch, url }) {
  const params = new URLSearchParams({
    q: url.searchParams.get('q') ?? '',
    role: url.searchParams.get('role') ?? 'all',
    status: url.searchParams.get('status') ?? 'all',
    project: url.searchParams.get('project') ?? ''
  });

  let users = [];
  let projects = [];

  try {
    const r = await fetch(`/api/coordinator/users?${params.toString()}`);
    if (r.ok) users = await r.json();
  } catch (_) {}

  try {
    const r = await fetch('/api/coordinator/projects');
    if (r.ok) projects = await r.json();
  } catch (_) {}

  return {
    users,
    projects,
    initialFilters: {
      q: params.get('q'),
      role: params.get('role'),
      status: params.get('status'),
      project: params.get('project')
    }
  };
}
