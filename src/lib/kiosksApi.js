// Client for the Print Shop Locator service — a *separate* backend from
// the Cloud PDF Service in api.js, so it gets its own base URL (and, if
// it ever needs one, its own key) rather than sharing config with that one.

const KIOSKS_BASE_URL = (import.meta.env.VITE_KIOSKS_API_BASE_URL || "").replace(/\/$/, "");
const KIOSKS_API_KEY = import.meta.env.VITE_KIOSKS_API_KEY || "";

class KiosksApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

/**
 * Find nearby print shops capable of printing the given page count.
 * GET /api/kiosks/nearby?lat=..&lng=..&pages=..
 */
export async function getNearbyKiosks({ lat, lng, pages }) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    pages: String(pages),
  });

  const headers = {};
  if (KIOSKS_API_KEY) headers["x-api-key"] = KIOSKS_API_KEY;

  let response;
  try {
    response = await fetch(`${KIOSKS_BASE_URL}/api/kiosks/nearby?${params.toString()}`, { headers });
  } catch {
    throw new KiosksApiError("Couldn't reach the print shop locator service.", 0, null);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new KiosksApiError(payload?.message || "Couldn't find nearby print shops.", response.status, payload);
  }

  return payload.data;
}

export { KiosksApiError };
