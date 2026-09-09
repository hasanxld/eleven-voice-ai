// Minimal Firestore REST helpers usable from the edge server runtime.
const PROJECT_ID = "banglaquiz-sgw69";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const API_KEY = "AIzaSyCMKNydjhcNLdKu9Nm-pzgq2pSRGDHVk-4";

type FsValue = Record<string, unknown>;

function decodeValue(v: FsValue): unknown {
  if (v == null) return null;
  if ("stringValue" in v) return v["stringValue"];
  if ("integerValue" in v) return Number(v["integerValue"]);
  if ("doubleValue" in v) return Number(v["doubleValue"]);
  if ("booleanValue" in v) return v["booleanValue"];
  if ("timestampValue" in v) return v["timestampValue"];
  if ("nullValue" in v) return null;
  if ("mapValue" in v) return decodeFields((v["mapValue"] as { fields?: Record<string, FsValue> })?.fields ?? {});
  if ("arrayValue" in v)
    return ((v["arrayValue"] as { values?: FsValue[] })?.values ?? []).map(decodeValue);
  return null;
}

export function decodeFields(fields: Record<string, FsValue>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields ?? {})) out[k] = decodeValue(v);
  return out;
}

function encodeValue(v: unknown): FsValue {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number")
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue) } };
  return { mapValue: { fields: encodeFields(v as Record<string, unknown>) } };
}

export function encodeFields(obj: Record<string, unknown>): Record<string, FsValue> {
  const out: Record<string, FsValue> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = encodeValue(v);
  return out;
}

export async function listDocs(
  collection: string,
): Promise<Array<{ id: string; data: Record<string, unknown> }>> {
  try {
    const res = await fetch(`${BASE}/${collection}?pageSize=300&key=${API_KEY}`);
    if (!res.ok) return [];
    const json = (await res.json()) as { documents?: Array<{ name: string; fields?: Record<string, FsValue> }> };
    return (json.documents ?? []).map((d) => ({
      id: d.name.split("/").pop() as string,
      data: decodeFields(d.fields ?? {}),
    }));
  } catch {
    return [];
  }
}

export async function addDoc(
  collection: string,
  data: Record<string, unknown>,
): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/${collection}?key=${API_KEY}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fields: encodeFields(data) }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function patchDoc(
  collection: string,
  id: string,
  data: Record<string, unknown>,
): Promise<boolean> {
  try {
    const mask = Object.keys(data)
      .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
      .join("&");
    const res = await fetch(`${BASE}/${collection}/${id}?${mask}&key=${API_KEY}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fields: encodeFields(data) }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
