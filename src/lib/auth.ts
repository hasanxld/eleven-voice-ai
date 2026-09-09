import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type LVUser = { id: string; username: string; role: "admin" | "user" };

const SESSION_KEY = "little_voice_session";

export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`little-voice::${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signIn(username: string, password: string): Promise<LVUser> {
  const hash = await hashPassword(password);
  const snap = await getDocs(
    query(collection(db, "users"), where("username", "==", username.trim().toLowerCase())),
  );
  if (snap.empty) throw new Error("User not found");
  const doc = snap.docs[0]!;
  const data = doc.data() as { passwordHash?: string; role?: string };
  if (data.passwordHash !== hash) throw new Error("Wrong password");
  const user: LVUser = {
    id: doc.id,
    username: username.trim().toLowerCase(),
    role: data.role === "admin" ? "admin" : "user",
  };
  saveSession(user);
  return user;
}

export async function signUp(username: string, password: string): Promise<LVUser> {
  const clean = username.trim().toLowerCase();
  if (clean.length < 3) throw new Error("Username must be at least 3 characters");
  if (password.length < 6) throw new Error("Password must be at least 6 characters");

  const existing = await getDocs(query(collection(db, "users"), where("username", "==", clean)));
  if (!existing.empty) throw new Error("Username already taken");

  const all = await getDocs(collection(db, "users"));
  const role = all.empty ? "admin" : "user";

  const created = await addDoc(collection(db, "users"), {
    username: clean,
    passwordHash: await hashPassword(password),
    role,
    created_at: serverTimestamp(),
  });

  const user: LVUser = { id: created.id, username: clean, role };
  saveSession(user);
  return user;
}

export function saveSession(user: LVUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): LVUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as LVUser) : null;
  } catch {
    return null;
  }
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}
