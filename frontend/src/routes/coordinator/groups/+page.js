export async function load({ fetch, url }) {
  const params = new URLSearchParams({
    q: url.searchParams.get('q') ?? '',
    status: url.searchParams.get('status') ?? 'all'
  });

  let items = [];
  try {
    const res = await fetch(`/api/coordinator/groups?${params.toString()}`);
    if (res.ok) items = await res.json();
  } catch (_) {}

  return {
    items,
    initialFilters: { q: params.get('q'), status: params.get('status') }
  };
}
