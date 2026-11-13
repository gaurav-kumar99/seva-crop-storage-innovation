// ============================================================
// API client for the Seva FastAPI backend (see 08_Development).
//
// The backend stores quantities in kg and prices per kg/month.
// The UI works in quintals (1 quintal = 100 kg), so the adapters
// below convert in both directions. Pages never see raw API shapes.
// ============================================================

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

const TOKEN_KEY = "seva_access_token";
const KG_PER_QUINTAL = 100;

// ---------- Token (only the JWT lives in the browser) ----------

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    return null;
  }
}

function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    // Storage blocked: the user stays logged in until the page reloads.
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    // ignore
  }
}

// ---------- Low-level request ----------

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function errorMessage(payload, status) {
  const detail = payload && payload.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length) {
    // FastAPI validation errors: [{loc: [...], msg: "..."}]
    return detail
      .map((d) => {
        const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : "";
        return field ? `${field}: ${d.msg}` : d.msg;
      })
      .join(". ");
  }
  return `Request failed (${status}). Please try again.`;
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new ApiError(
      "Cannot reach the server. Please check your internet connection and try again.",
      0
    );
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    // empty or non-JSON body
  }

  if (!response.ok) {
    // An expired/invalid token on a protected call logs the user out.
    if (response.status === 401 && auth) {
      clearToken();
      window.dispatchEvent(new Event("seva:unauthorized"));
    }
    throw new ApiError(errorMessage(payload, response.status), response.status);
  }
  return payload;
}

// ---------- Adapters (API shape -> UI shape) ----------

const round2 = (n) => Math.round(Number(n) * 100) / 100;
const toQuintals = (kg) => round2((kg || 0) / KG_PER_QUINTAL);

function toUser(u) {
  return {
    id: u.id,
    fullName: u.name,
    phone: u.phone,
    village: u.village || "",
    district: u.district || "",
    landAcres: u.land_acres,
    mainCrop: u.main_crop || "",
    role: u.role,
  };
}

function toStorage(s) {
  return {
    id: s.id,
    name: s.name,
    village: s.village || "",
    district: s.district || "",
    distanceKm: s.distance_km ?? "-",
    crops: s.crops || [],
    totalCapacityQuintals: toQuintals(s.capacity_kg),
    availableQuintals: toQuintals(s.available_kg),
    minQuantityQuintals: toQuintals(s.min_quantity_kg),
    chargePerQuintalPerMonth: round2((s.price_per_kg_month || 0) * KG_PER_QUINTAL),
    minTempC: s.min_temp_c ?? "-",
    maxTempC: s.max_temp_c ?? "-",
    openHours: s.open_hours || "Not available",
    contact: s.contact_phone || "Not available",
    facilities: s.facilities || [],
    otherCharges: s.other_charges || "",
    description: s.description || "",
  };
}

// Backend status -> label shown in the UI
const STATUS_LABELS = {
  pending: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
  stored: "Stored",
  completed: "Completed",
  cancelled: "Cancelled",
};

function toApplication(a) {
  const events = a.events || [];
  const last = events[events.length - 1];
  return {
    id: a.id,
    storageId: a.storage_id,
    storageName: a.storage_name || `Storage #${a.storage_id}`,
    crop: a.crop,
    quantityQuintals: toQuintals(a.quantity_kg),
    durationMonths: a.duration_months,
    estimatedCost: a.estimated_cost ?? 0,
    submittedOn: String(a.created_at || "").slice(0, 10),
    status: STATUS_LABELS[a.status] || a.status,
    rejectionReason: a.status === "rejected" && last ? last.note : undefined,
  };
}

// ---------- Auth ----------

export async function login(phone, password) {
  const { access_token } = await request("/auth/login", {
    method: "POST",
    body: { phone: phone.trim(), password },
  });
  setToken(access_token);
  return fetchMe();
}

export async function register(values) {
  await request("/auth/register", {
    method: "POST",
    body: {
      name: values.fullName.trim(),
      phone: values.phone.trim(),
      password: values.password,
      village: values.village.trim(),
      district: values.district.trim(),
      land_acres: Number(values.landAcres),
      main_crop: values.mainCrop.trim(),
      role: "farmer",
    },
  });
  return login(values.phone, values.password);
}

export async function fetchMe() {
  return toUser(await request("/me", { auth: true }));
}

// ---------- Storages (public) ----------

export async function getStorages() {
  return (await request("/storages")).map(toStorage);
}

export async function getStorage(id) {
  return toStorage(await request(`/storages/${encodeURIComponent(id)}`));
}

// ---------- Applications (need login) ----------

export async function getMyApplications() {
  return (await request("/applications", { auth: true })).map(toApplication);
}

export async function createApplication({ storageId, crop, quantityQuintals, durationMonths }) {
  const created = await request("/applications", {
    method: "POST",
    auth: true,
    body: {
      storage_id: Number(storageId),
      crop,
      quantity_kg: round2(Number(quantityQuintals) * KG_PER_QUINTAL),
      duration_months: Number(durationMonths),
    },
  });
  return toApplication(created);
}
