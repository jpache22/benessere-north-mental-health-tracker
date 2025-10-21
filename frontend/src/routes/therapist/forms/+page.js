// Loads assigned forms from an API (empty-safe).
export async function load({ fetch, url }) {
  const params = new URLSearchParams({
    q: url.searchParams.get('q') ?? '',
    status: url.searchParams.get('status') ?? 'all',
    from: url.searchParams.get('from') ?? '',
    to: url.searchParams.get('to') ?? ''
  });

  // Expected response shape (array):
  // [{ id, patient, form, assignedOn, dueOn, status, progress }, ...]
  let items = [];
  try {
    const res = await fetch(`/api/forms/assigned?${params.toString()}`);
    if (res.ok) items = await res.json();
  } catch (_) { /* keep [] */ }

  return {
    items,
    initialFilters: {
      q: params.get('q'),
      status: params.get('status'),
      from: params.get('from'),
      to: params.get('to')
    }
  };
}
