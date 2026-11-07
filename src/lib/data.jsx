import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase, BUCKET } from "./supabase.js";
import { buildPost, makePost } from "./posts.js";
import { RAW } from "./postsSource.js";

// Example posts from src/posts/ — shown only while Supabase is not connected.
const LOCAL = Object.entries(RAW)
  .map(([file, raw]) => buildPost(raw, file))
  .filter((p) => p.date)
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export const isLive = !!supabase;

const fromRow = (r) =>
  makePost({
    id: r.id,
    slug: r.slug,
    title: r.title,
    date: r.date,
    category: r.category,
    status: r.status,
    cover: r.cover,
    excerpt: r.excerpt,
    featured: r.featured,
    published: r.published,
    sources: r.sources,
    body: r.body,
  });

// ---------- reading ----------
// Visitors: only published posts. (The database itself also enforces this — see supabase.sql.)
export async function fetchPublished() {
  if (!supabase) return LOCAL;
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(fromRow);
}

// Admin: everything, drafts included.
export async function fetchAll() {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(fromRow);
}

// ---------- writing (admin only) ----------
export async function savePost(form, id) {
  const row = {
    slug: form.slug,
    title: form.title.trim(),
    date: form.date,
    category: form.category,
    status: form.status || null,
    excerpt: form.excerpt.trim() || null,
    cover: form.cover || null,
    featured: !!form.featured,
    published: !!form.published,
    sources: form.sources,
    body: form.body,
    updated_at: new Date().toISOString(),
  };
  const q = id
    ? supabase.from("posts").update(row).eq("id", id).select().single()
    : supabase.from("posts").insert(row).select().single();
  const { data, error } = await q;
  if (error) {
    if (error.code === "23505") throw new Error("Već postoji priča sa ovom adresom (slug). Promeni naslov ili adresu.");
    throw error;
  }
  return fromRow(data);
}

export async function deletePost(id) {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

// Shrinks big photos before upload (max 1600 px wide, JPEG) — faster site, less storage.
async function shrink(file, max = 1600) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  const img = await createImageBitmap(file).catch(() => null);
  if (!img || img.width <= max) return file;
  const c = document.createElement("canvas");
  c.width = max;
  c.height = Math.round((img.height * max) / img.width);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.85));
  return blob ? new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }) : file;
}

export async function uploadImage(file) {
  const small = await shrink(file);
  const ext = (small.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${new Date().toISOString().slice(0, 7)}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, small, { contentType: small.type, upsert: false });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// ---------- login ----------
export function useSession() {
  const [session, setSession] = useState(undefined); // undefined = still checking
  useEffect(() => {
    if (!supabase) return setSession(null);
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return session;
}

export const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
export const signOut = () => supabase.auth.signOut();

// ---------- shared list of published posts for the public pages ----------
const Ctx = createContext({ posts: [], loading: true, error: null, reload: () => {} });

export function PostsProvider({ children }) {
  const [state, setState] = useState({ posts: [], loading: true, error: null });
  const reload = useCallback(() => {
    fetchPublished()
      .then((posts) => setState({ posts, loading: false, error: null }))
      .catch((e) => setState({ posts: [], loading: false, error: e.message || String(e) }));
  }, []);
  useEffect(reload, [reload]);
  return <Ctx.Provider value={{ ...state, reload }}>{children}</Ctx.Provider>;
}

export const usePosts = () => useContext(Ctx);
