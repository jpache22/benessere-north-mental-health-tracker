import { redirect } from '@sveltejs/kit';

export function load({ cookies }) {
  const token = cookies.get('session'); // same cookie as Therapist for now
  if (!token) throw redirect(302, '/login');
  return {};
}
