import { marked } from "marked";

// Reads the block between the --- lines at the top of a .md post.
export function parseFrontmatter(text) {
  const m = text.match(/^﻿?---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text };
  const data = {};
  let listKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && listKey) {
      data[listKey].push(item[1].trim());
      continue;
    }
    const kv = line.match(/^([\wčćšžđČĆŠŽĐ-]+):\s*(.*)$/);
    if (kv) {
      const [, k, v] = kv;
      if (v === "") {
        data[k] = [];
        listKey = k;
      } else {
        data[k] = v.trim().replace(/^["']|["']$/g, "");
        listKey = null;
      }
    }
  }
  return { data, body: m[2] };
}

// "Naziv izvora | https://adresa" → { name, url }
export function parseSource(s) {
  const [name, url] = s.split("|").map((x) => x.trim());
  return { name, url: url && /^https?:\/\//.test(url) ? url : null };
}

export function slugify(s) {
  const map = { č: "c", ć: "c", š: "s", ž: "z", đ: "dj" };
  return (s || "")
    .toLowerCase()
    .replace(/[čćšžđ]/g, (c) => map[c])
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// One shape for every post, whether it came from Supabase or from a .md file.
export function makePost(f) {
  const body = f.body || "";
  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    id: f.id || null,
    slug: f.slug || slugify(f.title) || "prica",
    title: f.title || "Bez naslova",
    date: f.date || "",
    category: f.category || "istorija",
    status: f.status || "",
    cover: f.cover || "",
    lead: f.excerpt || "",
    excerpt: f.excerpt || (body.trim() ? body.replace(/[#>*_`!\[\]()]/g, "").trim().slice(0, 180) + "…" : ""),
    featured: !!f.featured,
    published: f.published !== false,
    sources: Array.isArray(f.sources) ? f.sources : [],
    body,
    minutes: Math.max(1, Math.round(words / 200)),
    html: marked.parse(body),
  };
}

// A .md file → post (used for the example posts in src/posts/).
export function buildPost(raw, fileName = "") {
  const { data, body } = parseFrontmatter(raw);
  return makePost({
    slug: data.slug || slugify(fileName.replace(/^.*\//, "").replace(/\.md$/, "") || data.naslov),
    title: data.naslov,
    date: data.datum,
    category: data.kategorija,
    status: data.status,
    cover: data.slika,
    excerpt: data.kratko,
    featured: data.istaknuto === "da",
    sources: (Array.isArray(data.izvori) ? data.izvori : []).map(parseSource),
    body,
  });
}

export function formatDate(iso) {
  const months = ["januar", "februar", "mart", "april", "maj", "jun", "jul", "avgust", "septembar", "oktobar", "novembar", "decembar"];
  const [y, m, d] = (iso || "").slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso || "";
  return `${d}. ${months[m - 1]} ${y}.`;
}
