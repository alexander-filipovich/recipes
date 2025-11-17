/*
  Local storage service that reads a manifest from public/storage/index.json
  and serves objects under /storage/<type>/<item>/*
  This replaces GCS access and keeps the same exported function names so
  the pages don't need to change.
*/

export type GcsObject = {
  name: string;
  contentType?: string;
  size?: string;
};

type Manifest = {
  types: Record<
    string,
    {
      items: Array<{
        name: string;
        objects?: Array<{ name: string; contentType?: string }>;
      }>;
    }
  >;
  _raw?: Record<string, any>;
};

let manifestCache: Manifest | null = null;
const STORAGE_PATH = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_STORAGE_PATH) || '/storage';

async function loadManifest(): Promise<Manifest> {
  if (manifestCache) return manifestCache!;
  const url = `${STORAGE_PATH.replace(/\/+$/, '')}/index.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load storage manifest: ${res.status}`);
  manifestCache = await res.json();
  return manifestCache!;
}

export async function listPrefixes(prefix = ""): Promise<string[]> {
  const data = await loadManifest();
  if (!prefix || prefix === "") return Object.keys(data.types || {});
  const trimmed = prefix.replace(/\/+$/, "");
  const parts = trimmed.split("/").filter(Boolean);
  if (parts.length === 1) {
    const type = parts[0];
    return (data.types[type]?.items || []).map((it) => it.name);
  }
  return [];
}

export async function listObjects(prefix = ""): Promise<GcsObject[]> {
  const data = await loadManifest();
  if (!prefix || prefix === "") return [];
  const parts = prefix.replace(/\/+$/, "").split("/").filter(Boolean);
  if (parts.length === 1) {
    const type = parts[0];
    return (data.types[type]?.items || []).flatMap((it) => it.objects || []).map((o) => ({ name: `${type}/${o.name}`, contentType: o.contentType }));
  }
  if (parts.length === 2) {
    const [type, item] = parts;
    const it = (data.types[type]?.items || []).find((x) => x.name === item);
    return (it?.objects || []).map((o) => ({ name: `${type}/${item}/${o.name}`, contentType: o.contentType }));
  }
  return [];
}

export function publicUrlFor(objectPath: string) {
  // Serve from public/storage
  return `/storage/${objectPath}`;
}

export async function fetchJsonForPrefix(prefix: string): Promise<any | null> {
  // Try manifest _raw first
  const data = await loadManifest();
  const candidates = (await listObjects(prefix)).filter((o) => o.name.endsWith('.json'));
  if (candidates.length === 0) return null;
  const name = candidates[0].name;
  if (data._raw && name in data._raw) return data._raw[name];
  // else try to fetch directly from /storage/<name>
  const url = `/storage/${name}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}
