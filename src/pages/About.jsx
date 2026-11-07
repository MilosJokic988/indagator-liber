import { SITE, STATUSES } from "../config.js";
import { usePosts } from "../lib/data.jsx";
import { TikTokBand } from "../components/Bits.jsx";

export default function About() {
  const { posts: POSTS } = usePosts();
  return (
    <>
      <section className="wrap page narrow">
        <header className="page-head">
          <span className="page-num">✦</span>
          <div>
            <h1>O meni</h1>
            <p>{SITE.motto}</p>
          </div>
        </header>
        <div className="prose">
          {SITE.about.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        <div className="stats">
          <div><b>{SITE.followers}</b><span>pratilaca na TikToku</span></div>
          <div><b>{POSTS.length}</b><span>priča na sajtu</span></div>
          <div><b>{SITE.likes}</b><span>lajkova</span></div>
        </div>

        <h2 className="sec-title">Kako čitati oznake</h2>
        <ul className="legend">
          {Object.entries(STATUSES).map(([k, v]) => (
            <li key={k}>
              <span className={`status st-${k}`}><i />{v.label}</span>
              <span>{v.note}</span>
            </li>
          ))}
        </ul>

        {SITE.email && (
          <p className="contact">Saradnja i kontakt: <b>{SITE.email}</b></p>
        )}
      </section>
      <TikTokBand />
    </>
  );
}
