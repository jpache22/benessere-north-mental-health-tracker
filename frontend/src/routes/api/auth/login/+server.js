import { json } from '@sveltejs/kit';
import { PRIVATE_API_BASE } from '$env/static/private'; // e.g., https://api.yourdomain.com

export async function POST({ request, fetch, cookies }) {
  const body = await request.json().catch(() => ({}));
  const { username, password, remember } = body;

  if (!username || !password) {
    return json({ error: 'Missing username or password.' }, { status: 400 });
  }

  // proxy to your backend login; adjust path as needed
  const res = await fetch(`${PRIVATE_API_BASE ?? ''}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password }) // ✅ use username, not email
  }).catch(() => null);

  if (!res || !res.ok) {
    const err = (await res?.json().catch(() => null))?.error ?? 'Invalid credentials.';
    return json({ error: err }, { status: 401 });
  }

  const { token, user } = await res.json(); // backend should return { token, user }

  // persist secure session cookie
  cookies.set('session', token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8 // 30 days or 8 hours
  });
 
  return json({ ok: true, user: { id: user?.id, username: user?.username } });
}
