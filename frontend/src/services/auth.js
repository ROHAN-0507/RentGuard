function decodeTokenPayload(token) {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function saveAuthSession(authResponse) {
  const user = {
    name: typeof authResponse.name === "string" ? authResponse.name.trim() : "",
    email: authResponse.email || "",
    userId: authResponse.userId ?? null,
    role: authResponse.role || "",
    token: authResponse.token,
  };

  localStorage.setItem("token", user.token);
  localStorage.setItem("user", JSON.stringify(user));
  return user;
}

export function getAuthenticatedUser() {
  let token = localStorage.getItem("token");
  let storedUser = {};

  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "{}") || {};
  } catch {
    storedUser = {};
  }

  if (!token && storedUser.token) {
    token = storedUser.token;
  }

  if (!token) return null;

  const payload = decodeTokenPayload(token || storedUser.token);
  const tokenRole = payload?.role ||
    payload?.roles?.[0]?.replace(/^ROLE_/, "") ||
    payload?.authorities?.[0]?.authority?.replace(/^ROLE_/, "");

  return {
    name: typeof storedUser.name === "string" ? storedUser.name.trim() : "",
    email: storedUser.email || payload?.sub || payload?.email || "",
    userId: storedUser.userId ?? storedUser.id ?? payload?.userId ?? null,
    role: storedUser.role || tokenRole || "",
    token: token || storedUser.token || "",
  };
}

export function getProfileName(user, fallback = "User") {
  return user?.name || user?.email || fallback;
}
