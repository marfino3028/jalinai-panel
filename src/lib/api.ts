import { auth } from './auth.js';

const RAG = (import.meta.env.VITE_RAG_URL ?? 'http://localhost:8090').replace(/\/$/, '');
const GATEWAY = (import.meta.env.VITE_GATEWAY_URL ?? 'http://localhost:8080').replace(/\/$/, '');
const GATEWAY_KEY = import.meta.env.VITE_GATEWAY_KEY ?? 'jln-dev-key';

export interface WidgetConfig {
  title: string;
  primaryColor: string;
  welcome: string;
}
export interface Tenant {
  id: string;
  name: string;
  widget: WidgetConfig;
  createdAt: string;
}
export interface DocInfo {
  docId: string;
  docName: string;
  chunks: number;
}
export interface ChatAnswer {
  answer: string;
  sources: { docName: string; score: number }[];
}

async function ragFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${RAG}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${auth.token}`,
      ...(init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  return data as T;
}

export const api = {
  ragUrl: RAG,

  // ── Tenant (toko) ──
  listTenants: () => ragFetch<{ data: Tenant[] }>('/admin/tenants').then((r) => r.data),
  createTenant: (name: string, id?: string, widget?: Partial<WidgetConfig>) =>
    ragFetch<Tenant>('/admin/tenants', {
      method: 'POST',
      body: JSON.stringify({ name, id, widget }),
    }),
  updateWidget: (id: string, widget: Partial<WidgetConfig>) =>
    ragFetch<Tenant>(`/admin/tenants/${id}/widget`, {
      method: 'PATCH',
      body: JSON.stringify(widget),
    }),

  // ── Dokumen ──
  listDocs: (id: string) =>
    ragFetch<{ data: DocInfo[] }>(`/admin/tenants/${id}/documents`).then((r) => r.data),
  uploadDoc: (id: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return ragFetch<{ docId: string; chunks: number }>(`/admin/tenants/${id}/documents`, {
      method: 'POST',
      body: fd,
    });
  },
  deleteDoc: (id: string, docId: string) =>
    ragFetch<{ deleted: string }>(`/admin/tenants/${id}/documents/${docId}`, { method: 'DELETE' }),

  // ── Widget chat (publik, buat test) ──
  testChat: (id: string, message: string) =>
    fetch(`${RAG}/widget/${id}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    }).then((r) => r.json() as Promise<ChatAnswer & { error?: string }>),

  // ── Status sistem (Gateway Fase 1) ──
  gatewayHealth: () =>
    fetch(`${GATEWAY}/health`)
      .then((r) => r.json() as Promise<{ providers: string[]; providersActive: number }>)
      .catch(() => ({ providers: [], providersActive: 0 })),
  gatewayModels: () =>
    fetch(`${GATEWAY}/v1/models`, { headers: { Authorization: `Bearer ${GATEWAY_KEY}` } })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j: { data?: { id: string; tier: string; providers: string[] }[] }) => j.data ?? [])
      .catch(() => []),
};
