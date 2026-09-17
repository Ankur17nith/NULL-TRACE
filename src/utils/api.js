// ============================================================
// NULL//TRACE — API Client
// Communicates with Render backend service using VITE_API_URL
// ============================================================

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

/**
 * Check backend health status
 * @returns {Promise<{ status: string, service: string, environment: string } | null>}
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`Health check failed with status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Backend health check unreachable:', err.message);
    return null;
  }
}

/**
 * Fetch global leaderboard from backend
 * @returns {Promise<Array<{ callsign: string, score: number, rank?: string }> | null>}
 */
export async function fetchRemoteLeaderboard() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/leaderboard`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`Leaderboard fetch failed with status ${res.status}`);
    const data = await res.json();
    return data?.data || [];
  } catch (err) {
    console.warn('[API] Could not fetch remote leaderboard, using local storage:', err.message);
    return null;
  }
}

/**
 * Submit operator score to backend
 * @param {{ callsign: string, score: number, rank?: string, missionsCompleted?: number, timeSpent?: number }} entry
 * @returns {Promise<object | null>}
 */
export async function submitRemoteScore(entry) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/leaderboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(`Score submission failed with status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Could not sync score with backend, saved locally:', err.message);
    return null;
  }
}

export { API_BASE_URL };
