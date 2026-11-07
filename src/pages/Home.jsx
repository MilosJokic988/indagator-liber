import { CATEGORIES, SITE } from "../config.js";
import { usePosts } from "../lib/data.jsx";
import { linkTo } from "../lib/router.js";
import { PostCard, TikTokBand } from "../components/Bits.jsx";

// 1 priča, 2–4 priče, 5+ priča (with the 11–14 exception)
const plural = (n) => (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "priče" : "priča");

export default function Home() {
  const { posts: POSTS, loading, error } = usePosts();
  const featured = POSTS.find((p) => p.featured) || POSTS[0];
  const rest = POSTS.filter((p) => p !== featured).slice(0, 6);

  return (
    <>
      <section className="hero">
        <div className="hero-in">
          <p className="kick">{SITE.motto.toUpperCase()}</p>
          <h1 className="hero-title">
            {SITE.name.split(" ").map((w, i) => (
              <span key={i} style={{ animationDelay: `${0.2 + i * 0.35}s` }}>{w}</span>
            ))}
          </h1>
          <p className="hero-tag">{SITE.tagline}</p>
          <div className="hero-cta">
            <a className="btn" href={featured ? linkTo.post(featured.slug) : "#sve"}>Čitaj najnovije</a>
            <a className="btn ghost" href={SITE.tiktok} target="_blank" rel="noreferrer">TikTok ↗</a>
          </div>
        </div>
      </section>

      <section className="cats">
        {CATEGORIES.map((c) => {
          const n = POSTS.filter((p) => p.category === c.id).length;
          return (
            <a key={c.id} href={linkTo.category(c.id)} className="cat">
              <span className="cat-num">{c.num}</span>
              <span className="cat-name">{c.name}</span>
              <span className="cat-blurb">{c.blurb}</span>
              <span className="cat-n">{n} {plural(n)} →</span>
            </a>
          );
        })}
      </section>

      {loading && <p className="wrap empty">Učitavanje…</p>}
      {error && <p className="wrap empty">Greška pri učitavanju: {error}</p>}
      {featured && (
        <section className="wrap">
          <h2 className="sec-title">Istaknuto</h2>
          <PostCard post={featured} big />
        </section>
      )}

      {rest.length > 0 && (
        <section className="wrap">
          <h2 className="sec-title">
            Najnovije <a href="#sve">sve priče →</a>
          </h2>
          <div className="grid">
            {rest.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}

      <TikTokBand />
    </>
  );
}
