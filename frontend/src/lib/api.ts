const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function fetchKPIs() {
  const res = await fetch(`${API_BASE}/dashboard/kpis`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch KPIs");
  return res.json();
}

export async function fetchRevenueTrend() {
  const res = await fetch(`${API_BASE}/dashboard/revenue_trend`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch trend");
  return res.json();
}

export async function fetchGeography() {
  const res = await fetch(`${API_BASE}/dashboard/geography`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch geography");
  return res.json();
}

export async function fetchSupplierMetrics() {
  const res = await fetch(`${API_BASE}/metrics/suppliers`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch supplier metrics");
  return res.json();
}

export async function fetchLogisticsMetrics() {
  const res = await fetch(`${API_BASE}/metrics/logistics`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch logistics metrics");
  return res.json();
}

export async function fetchInventoryMetrics() {
  const res = await fetch(`${API_BASE}/metrics/inventory`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch inventory metrics");
  return res.json();
}

export async function fetchInsights() {
  const res = await fetch(`${API_BASE}/insights`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch insights");
  return res.json();
}

export async function fetchExploreFilters() {
  const res = await fetch(`${API_BASE}/explore/filters`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch explore filters");
  return res.json();
}

export async function queryExplore(data: any) {
  const res = await fetch(`${API_BASE}/explore/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error("Failed to query explore");
  return res.json();
}

export async function chatQuery(query: string, history: any[] = []) {
  const res = await fetch(`${API_BASE}/chat/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, history }),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error("Failed to chat");
  return res.json();
}

export async function generateExploreStory(data: any) {
  const res = await fetch(`${API_BASE}/explore/story`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error("Failed to generate story");
  return res.json();
}
