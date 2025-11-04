export const API_BASE = "https://benessere-north-mental-health-tracker-backend.<yourname>.workers.dev";

export async function loginUser(username, password) {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    return await res.json();
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, error: "Network error." };
  }
}
