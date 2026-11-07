import { useState } from "react";
import { CATEGORIES, SITE, STATUSES } from "../config.js";
import { linkTo } from "../lib/router.js";
import { formatDate } from "../lib/posts.js";

export const catById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

export function Status({ status, full = false }) {
  const s = STATUSES[status];
  if (!s) return null;
  return (
    <span className={`status st-${status}`} title={s.note}>
      <i />
      {s.label}
      {full && <em> — {s.note}</em>}
    </span>
  );
}

// Cover: the post's own image, or a typographic one made from the category numeral.
export function Cover({ post, big = false }) {
  const cat = catById(post.category);
  return (
    <div className={"cover" + (big ? " big" : "") + (post.cover ? " has-img" : "")}>
      {post.cover ? (
        <img src={post.cover} alt="" loading="lazy" />
      ) : (
        <div className="cover-type" aria-hidden="true">
          <span className="cover-num">{cat.num}</span>
          <span className="cover-cat">{cat.name}</span>
        </div>
      )}
    </div>
  );
}

export function PostCard({ post, big = false }) {
  const cat = catById(post.category);
  return (
    <a className={"card" + (big ? " card-big" : "")} href={linkTo.post(post.slug)}>
      <Cover post={post} big={big} />
      <div className="card-body">
        <p className="meta">
          <span>{cat.num} · {cat.name}</span>
          <span>{formatDate(post.date)}</span>
        </p>
        <h3>{post.title}</h3>
        <p className="excerpt">{post.excerpt}</p>
        <p className="card-foot">
          <Status status={post.status} />
          <span className="read">{post.minutes} min čitanja →</span>
        </p>
      </div>
    </a>
  );
}

export function Header({ route }) {
  const [open, setOpen] = useState(false);
  const active = route.page === "category" ? route.id : route.page;
  return (
    <header className="top">
      <a className="logo" href={linkTo.home} onClick={() => setOpen(false)}>
        <span className="logo-mark">IL</span>
        <span className="logo-word">{SITE.name}</span>
      </a>
      <button className="burger" aria-label="Meni" aria-expanded={open} onClick={() => setOpen(!open)}>
        <i /><i /><i />
      </button>
      <nav className={open ? "open" : ""} onClick={() => setOpen(false)}>
        {CATEGORIES.map((c) => (
          <a key={c.id} href={linkTo.category(c.id)} className={active === c.id ? "on" : ""}>
            <b>{c.num}</b> {c.name}
          </a>
        ))}
        <a href={linkTo.about} className={active === "about" ? "on" : ""}>O meni</a>
        <a className="tt" href={SITE.tiktok} target="_blank" rel="noreferrer">TikTok ↗</a>
      </nav>
    </header>
  );
}

export function TikTokBand() {
  return (
    <section className="band">
      <div className="band-in">
        <p className="band-kick">{SITE.followers} PRATILACA · {SITE.tiktokHandle}</p>
        <h2>Kratke priče svakog dana — na TikToku.</h2>
        <a className="btn" href={SITE.tiktok} target="_blank" rel="noreferrer">Zaprati ↗</a>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <div className="foot-in">
        <div>
          <p className="foot-name">{SITE.name}</p>
          <p className="foot-motto">{SITE.motto}</p>
        </div>
        <div className="foot-links">
          {CATEGORIES.map((c) => (
            <a key={c.id} href={linkTo.category(c.id)}>{c.name}</a>
          ))}
          <a href={linkTo.about}>O meni</a>
          <a href={SITE.tiktok} target="_blank" rel="noreferrer">TikTok</a>
        </div>
      </div>
      <p className="foot-small">
        © {new Date().getFullYear()} {SITE.name}
      </p>
    </footer>
  );
}
