const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${apiBase}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "API request failed");
  }

  return res.json();
}

export const apiGet = {
  chat: {
    stream: (payload: any) =>
      request(`/api/chat/stream`, { method: "POST", body: JSON.stringify(payload) }),
  },
  wallet: {
    verify: (address: string) =>
      request(`/api/wallet/verify`, { method: "POST", body: JSON.stringify({ walletAddress: address }) }),
  },
  subscription: {
    check: () => request(`/api/subscription/status`, { method: "GET" }),
    history: () => request(`/api/subscription/history`, { method: "GET" }),
  },
  analytics: {
    dashboard: () => request(`/api/analytics/dashboard`, { method: "GET" }),
  },
  strategy: {
    list: () => request(`/api/strategy/list`, { method: "GET" }),
    create: (payload: any) =>
      request(`/api/strategy/create`, { method: "POST", body: JSON.stringify(payload) }),
  },
};
