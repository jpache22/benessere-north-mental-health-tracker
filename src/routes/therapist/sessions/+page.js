// src/routes/therapist/sessions/+page.js
export async function load({ fetch, url }) {
  const params = new URLSearchParams({
    q: url.searchParams.get('q') ?? '',
    status: url.searchParams.get('status') ?? 'all',
    from: url.searchParams.get('from') ?? '',
    to: url.searchParams.get('to') ?? ''
  });

  // Optional API endpoint — safe if it's not implemented yet.
  // Expected response: JSON array of session objects
  // [{ id, date, time, patient, type, status, notes }, ...]
  let sessions = [];
  try {
    const res = await fetch(`/api/sessions?${params.toString()}`);
    if (res.ok) sessions = await res.json();
  } catch (_) {
    // leave sessions as []
  }

  return {
    sessions,
    initialFilters: {
      q: params.get('q'),
      status: params.get('status'),
      from: params.get('from'),
      to: params.get('to')
    }
  };
}
