// Loads patients with filter params from the URL.
// Expected backend shape: [{ id, name, group, lastActivity, formsDue, status }, ...]
export async function load({ fetch, url }) {
  const params = new URLSearchParams({
    q: url.searchParams.get('q') ?? '',
    status: url.searchParams.get('status') ?? 'all',
    group: url.searchParams.get('group') ?? '',
    active: url.searchParams.get('active') ?? 'all' // all | active | inactive
  });

  let items = [];
  try {
    const res = await fetch(`/api/patients?${params.toString()}`);
    if (res.ok) items = await res.json();
  } catch (_) { /* keep [] */ }

  return {
    items,
    initialFilters: {
      q: params.get('q'),
      status: params.get('status'),
      group: params.get('group'),
      active: params.get('active')
    }
  };
}
