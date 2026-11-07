import { useState } from "react";
import { CATEGORIES, STATUSES } from "../config.js";
import { usePosts } from "../lib/data.jsx";
import { PostCard } from "../components/Bits.jsx";

export default function Category({ id }) {
  const { posts: POSTS, loading } = usePosts();
  const cat = CATEGORIES.find((c) => c.id === id);
  const [q, setQ] = useState("");
  const [st, setSt] = useState("");

  let list = cat ? POSTS.filter((p) => p.category === cat.id) : POSTS;
  if (st) list = list.filter((p) => p.status === st);
  if (q.trim()) {
    const s = q.trim().toLowerCase();
    list = list.filter((p) => (p.title + " " + p.excerpt).toLowerCase().includes(s));
  }

  return (
    <section className="wrap page">
      <header className="page-head">
        <span className="page-num">{cat ? cat.num : "∞"}</span>
        <div>
          <h1>{cat ? cat.name : "Sve priče"}</h1>
          <p>{cat ? cat.blurb : "Svaka objava, od najnovije."}</p>
        </div>
      </header>

      <div className="filters">
        <input type="search" placeholder="Pretraži…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="chips">
          <button className={!st ? "on" : ""} onClick={() => setSt("")}>Sve</button>
          {Object.entries(STATUSES).map(([k, v]) => (
            <button key={k} className={st === k ? "on" : ""} onClick={() => setSt(k)}>{v.label}</button>
          ))}
        </div>
      </div>

      {list.length ? (
        <div className="grid">
          {list.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      ) : (
        <p className="empty">{loading ? "Učitavanje…" : "Ovde još nema priča. Uskoro."}</p>
      )}
    </section>
  );
}
