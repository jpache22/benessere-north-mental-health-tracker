export async function load({ fetch, url }) {
  const params = new URLSearchParams({
    q: url.searchParams.get('q') ?? '',
    status: url.searchParams.get('status') ?? 'all',
    group: url.searchParams.get('group') ?? ''
  });

  let items = [];
  try {
    const res = await fetch(`/api/coordinator/participants?${params.toString()}`);
    if (res.ok) items = await res.json();
  } catch (_) {}

  return {
    items,
    initialFilters: {
      q: params.get('q'),
      status: params.get('status'),
      group: params.get('group')
    }
  };
}
