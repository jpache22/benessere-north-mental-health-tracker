const ROLE_HOME = {
  admin: "/admin",
  coordinator: "/coordinator",
  therapist: "/therapist",
  intake: "/intake",
  patient: "/participant"
};

function decodeJwtPayload(token) {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function getRoleHomePath(role) {
  return ROLE_HOME[role] ?? "/landing";
}

export function saveAuthSession({ token, userId, role, username, email }) {
  localStorage.setItem("authToken", token);
  localStorage.setItem("token", token); // legacy compatibility
  localStorage.setItem("userId", String(userId ?? ""));
  localStorage.setItem("userRole", role ?? "");
  localStorage.setItem("userName", username ?? "");
  localStorage.setItem("userEmail", email ?? "");
  localStorage.setItem("lastLoginAt", new Date().toISOString());
}

export function clearAuthSession() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
}

export function getAuthSession() {
  const token = localStorage.getItem("authToken") || localStorage.getItem("token") || "";
  if (token && !localStorage.getItem("authToken")) {
    localStorage.setItem("authToken", token);
  }

  const payload = token ? decodeJwtPayload(token) : null;
  const expMs = payload?.exp ? payload.exp * 1000 : null;
  const isExpired = expMs ? Date.now() >= expMs : false;

  return {
    token,
    userId: localStorage.getItem("userId") || payload?.userId || "",
    role: localStorage.getItem("userRole") || payload?.role || "",
    username: localStorage.getItem("userName") || payload?.username || "",
    email: localStorage.getItem("userEmail") || "",
    lastLoginAt: localStorage.getItem("lastLoginAt") || "",
    expMs,
    isExpired,
    authenticated: Boolean(token) && !isExpired
  };
}

