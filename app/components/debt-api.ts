const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export type ApiPerson = { id: string; name: string };
export type ApiGroupMember = {
  person: ApiPerson;
  totalOwed: number;
  billCount: number;
  balance: number;
  paymentStatus: string;
};
export type ApiGroup = {
  id: string;
  name: string;
  totalOwed: number;
  createdAt: string;
  members: ApiGroupMember[];
};

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

function getMessage(body: unknown) {
  if (typeof body === "object" && body && "message" in body) {
    const message = (body as { message?: unknown }).message;
    return Array.isArray(message) ? message.join(", ") : String(message);
  }
  return "The server could not complete the request.";
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  if (!API_URL) throw new ApiError("NEXT_PUBLIC_API_URL is not configured.", 0);
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (response.status === 204) return undefined as T;
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) throw new ApiError(getMessage(body), response.status);
  return body as T;
}

export const debtApi = {
  login: (email: string, password: string) =>
    request<{ accessToken: string }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string) =>
    request<{ accessToken: string }>("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  people: (token: string) => request<ApiPerson[]>("/people", {}, token),
  groups: (token: string) => request<ApiGroup[]>("/groups", {}, token),
  createPerson: (token: string, name: string) =>
    request<ApiPerson>("/people", { method: "POST", body: JSON.stringify({ name }) }, token),
  createCharge: (token: string, groupId: string, amountPerPerson: number) =>
    request(`/expense-groups/${groupId}/charges`, { method: "POST", body: JSON.stringify({ amountPerPerson }) }, token),
};
