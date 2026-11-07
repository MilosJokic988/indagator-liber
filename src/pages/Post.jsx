import { useState } from "react";
import { formatDate } from "../lib/posts.js";
import { usePosts } from "../lib/data.jsx";
import { linkTo } from "../lib/router.js";
import { SITE } from "../config.js";
import { Cover, PostCard, Status, catById } from "../components/Bits.jsx";

export function Article({ post, preview = false }) {
  const cat = catById(post.category);
  return (
    <article className="article">
      <p className="meta">
        <a href={preview ? undefined : linkTo.category(cat.id)}>{cat.num} · {cat.name}</a>
        <span>{post.date ? formatDate(post.date) : "—"}</span>
        <span>{post.minutes} min čitanja</span>
      </p>
      <h1>{post.title}</h1>
      {post.lead && <p className="lead">{post.lead}</p>}
      {post.status && (
        <div className="verdict">
          <Status status={post.status} full />
        </div>
      )}
      {post.cover && <Cover post={post} big />}
      <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
      {post.sources.length > 0 && (
        <aside className="sources">
          <h2>Izvori</h2>
          <ol>
            {post.sources.map((s, i) => (
              <li key={i}>{s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.name} ↗</a> : s.name}</li>
            ))}
          </ol>
        </aside>
      )}
    </article>
  );
}

export default function Post({ slug }) {
  const { posts: POSTS, loading } = usePosts();
  const i = POSTS.findIndex((p) => p.slug === slug);
  const post = POSTS[i];
  const [copied, setCopied] = useState(false);

  if (!post && loading) return <section className="wrap page"><p className="empty">Učitavanje…</p></section>;
  if (!post)
    return (
      <section className="wrap page">
        <p className="empty">Ova priča ne postoji (ili je premeštena). <a href={linkTo.home}>Na početnu →</a></p>
      </section>
    );

  const related = POSTS.filter((p) => p.category === post.category && p.slug !== post.slug).slice(0, 2);
  const newer = POSTS[i - 1];
  const older = POSTS[i + 1];

  const share = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <section className="wrap page">
      <Article post={post} />

      <div className="post-actions">
        <button className="btn ghost" onClick={share}>{copied ? "Link kopiran ✓" : "Kopiraj link"}</button>
        <a className="btn" href={SITE.tiktok} target="_blank" rel="noreferrer">Prati na TikToku ↗</a>
      </div>

      <nav className="prevnext">
        {older ? <a href={linkTo.post(older.slug)}><small>← Starije</small>{older.title}</a> : <span />}
        {newer ? <a className="r" href={linkTo.post(newer.slug)}><small>Novije →</small>{newer.title}</a> : <span />}
      </nav>

      {related.length > 0 && (
        <>
          <h2 className="sec-title">Još iz kategorije {catById(post.category).name}</h2>
          <div className="grid">
            {related.map((p) => <PostCard key={p.slug} post={p} />)}
          </div>
        </>
      )}
    </section>
  );
}
