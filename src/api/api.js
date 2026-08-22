const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "food_rescue_auth_token";

function formatExpiry(availableUntil) {
  const minutes = Math.max(0, Math.round((new Date(availableUntil).getTime() - Date.now()) / 60000));

  if (minutes < 60) {
    return `Expires ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `Expires ${hours} hr${hours === 1 ? "" : "s"}${remainingMinutes ? ` ${remainingMinutes} min` : ""}`;
}

function getTag(availableUntil) {
  const minutes = (new Date(availableUntil).getTime() - Date.now()) / 60000;

  if (minutes <= 30) {
    return "urgent";
  }

  if (minutes <= 120) {
    return "soon";
  }

  return "fresh";
}

export function mapListing(listing) {
  return {
    ...listing,
    name: `${listing.quantity} ${listing.food_type}`,
    sub: `${listing.provider_name}${listing.location ? ` · ${listing.location}` : ""}`,
    tag: getTag(listing.available_until),
    expiry: formatExpiry(listing.available_until),
    qty: `${listing.quantity} units`,
    pickup: "Available now",
  };
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error?.message || body.message || "Unable to reach the API");
  }

  return body;
}

export async function getListings() {
  const body = await request("/listings");
  return body.data.map(mapListing);
}

export async function claimListing(id) {
  const body = await request(`/listings/${id}/claim`, { method: "POST" });
  return body.data;
}

export async function register(name, email, password) {
  const body = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  localStorage.setItem(TOKEN_KEY, body.data.token);
  return body.data.user;
}

export async function login(email, password) {
  const body = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem(TOKEN_KEY, body.data.token);
  return body.data.user;
}

export async function getCurrentUser() {
  const body = await request("/auth/me");
  return body.data;
}

export async function logout() {
  try {
    await request("/auth/logout", { method: "POST" });
  } finally {
    localStorage.removeItem(TOKEN_KEY);
  }
}