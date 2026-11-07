import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, STATUSES } from "../config.js";
import { makePost, slugify, formatDate, parseSource } from "../lib/posts.js";
import { isLive, fetchAll, savePost, deletePost, uploadImage, useSession, signIn, signOut, usePosts } from "../lib/data.jsx";
import { linkTo } from "../lib/router.js";
import { Article } from "./Post.jsx";
import { Status, catById } from "../components/Bits.jsx";

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY = { title: "", slug: "", date: today(), category: "istorija", status: "dokazano", excerpt: "", cover: "", featured: false, published: false, sources: "", body: "" };

// post → form fields (sources as text lines "Naziv | https://…")
const toForm = (p) => ({
  title: p.title, slug: p.slug, date: (p.date || today()).slice(0, 10), category: p.category, status: p.status || "",
  excerpt: p.lead || "", cover: p.cover || "", featured: p.featured, published: p.published,
  sources: p.sources.map((s) => (s.url ? `${s.name} | ${s.url}` : s.name)).join("\n"), body: p.body,
});

export default function Admin() {
  const session = useSession();
  if (!isLive) return <Setup />;
  if (session === undefined) return <section className="wrap page"><p className="empty">Provera prijave…</p></section>;
  if (!session) return <Login />;
  return <Dashboard email={session.user.email} />;
}

// ---------- shown until Supabase keys are added ----------
function Setup() {
  return (
    <section className="wrap page narrow">
      <header className="page-head">
        <span className="page-num">⚿</span>
        <div><h1>Admin</h1><p>Još nije povezan sa bazom.</p></div>
      </header>
      <div className="prose">
        <p>Admin panel proradi čim sajt dobije Supabase ključeve. Uputstvo korak po korak je u datoteci <code>README.md</code>:</p>
        <ol>
          <li>Napravi projekat na supabase.com.</li>
          <li>U <b>SQL Editor</b> pokreni <code>supabase.sql</code> (prethodno upiši svoj mejl u njega).</li>
          <li>U <b>Authentication → Users</b> dodaj sebe (mejl + lozinka), a novu registraciju isključi.</li>
          <li>Ključeve <code>VITE_SUPABASE_URL</code> i <code>VITE_SUPABASE_ANON_KEY</code> upiši u <code>.env</code> i u Vercel.</li>
        </ol>
        <p>Do tada sajt prikazuje primere priča iz fascikle <code>src/posts/</code>.</p>
      </div>
    </section>
  );
}

// ---------- login ----------
function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const { error } = await signIn(email.trim(), pass);
    setBusy(false);
    if (error) setErr("Pogrešan mejl ili lozinka.");
  };
  return (
    <section className="wrap page login">
      <form className="form login-box" onSubmit={submit}>
        <p className="kick">INDAGATOR LIBER</p>
        <h1>Prijava</h1>
        <label>Mejl<input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Lozinka<input type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} required /></label>
        {err && <p className="error">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? "Prijavljivanje…" : "Uđi"}</button>
        <a className="back" href={linkTo.home}>← Nazad na sajt</a>
      </form>
    </section>
  );
}

// ---------- list of all posts ----------
function Dashboard({ email }) {
  const [list, setList] = useState(null);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null); // null = list, {} = new, post = edit
  const { reload } = usePosts();

  const load = () => fetchAll().then(setList).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const done = () => {
    setEditing(null);
    load();
    reload(); // refresh what visitors see
    window.scrollTo(0, 0);
  };

  if (editing) return <Editor post={editing.id ? editing : null} onDone={done} onCancel={() => setEditing(null)} />;

  const drafts = list ? list.filter((p) => !p.published).length : 0;
  return (
    <section className="wrap page">
      <header className="admin-head">
        <div>
          <p className="kick">ADMIN · {email}</p>
          <h1>Priče</h1>
          {list && <p className="dim">{list.length - drafts} objavljeno · {drafts} u nacrtu</p>}
        </div>
        <div className="admin-head-btns">
          <button className="btn" onClick={() => setEditing({})}>+ Nova priča</button>
          <button className="btn ghost" onClick={signOut}>Odjava</button>
        </div>
      </header>

      {err && <p className="error">{err}</p>}
      {!list && !err && <p className="empty">Učitavanje…</p>}
      {list && list.length === 0 && <p className="empty">Još nema priča. Klikni „Nova priča“.</p>}

      {list && list.length > 0 && (
        <ul className="admin-list">
          {list.map((p) => (
            <li key={p.id}>
              <div className="al-thumb">{p.cover ? <img src={p.cover} alt="" /> : <span>{catById(p.category).num}</span>}</div>
              <div className="al-main">
                <p className="meta">
                  <span className={p.published ? "pub" : "draft"}>{p.published ? "● OBJAVLJENO" : "○ NACRT"}</span>
                  <span>{catById(p.category).name}</span>
                  <span>{formatDate(p.date)}</span>
                  {p.featured && <span>★ ISTAKNUTO</span>}
                </p>
                <h3>{p.title}</h3>
                {p.status && <Status status={p.status} />}
              </div>
              <div className="al-btns">
                <button className="btn ghost" onClick={() => setEditing(p)}>Uredi</button>
                {p.published && <a className="btn ghost" href={linkTo.post(p.slug)}>Pogledaj</a>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------- write / edit ----------
function Editor({ post, onDone, onCancel }) {
  const [f, setF] = useState(() => (post ? toForm(post) : { ...EMPTY }));
  const [slugTouched, setSlugTouched] = useState(!!post);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const ta = useRef(null);
  const inlineInput = useRef(null);

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setF((old) => {
      const next = { ...old, [k]: v };
      if (k === "title" && !slugTouched) next.slug = slugify(v);
      return next;
    });
  };

  const sources = useMemo(() => f.sources.split("\n").map((s) => s.trim()).filter(Boolean).map(parseSource), [f.sources]);
  const preview = useMemo(() => makePost({ ...f, sources }), [f, sources]);

  // Insert markdown around the selection in the body.
  const insert = (before, after = "", line = false, text) => {
    const el = ta.current;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const sel = text ?? (value.slice(a, b) || "tekst");
    const start = line ? value.lastIndexOf("\n", a - 1) + 1 : a;
    const next = line ? value.slice(0, start) + before + value.slice(start) : value.slice(0, a) + before + sel + after + value.slice(b);
    setF((o) => ({ ...o, body: next }));
    requestAnimationFrame(() => el.focus());
  };

  const upload = async (file, where) => {
    if (!file) return;
    setBusy("Otpremanje slike…");
    setErr("");
    try {
      const url = await uploadImage(file);
      if (where === "cover") setF((o) => ({ ...o, cover: url }));
      else insert("\n\n![", `](${url})\n\n`, false, "opis slike");
    } catch (e) {
      setErr("Slika nije otpremljena: " + e.message);
    }
    setBusy("");
  };

  const save = async (publish) => {
    if (!f.title.trim()) return setErr("Upiši naslov.");
    if (!f.slug) return setErr("Adresa (slug) ne može biti prazna.");
    setBusy(publish ? "Objavljivanje…" : "Čuvanje…");
    setErr("");
    try {
      await savePost({ ...f, published: publish, sources }, post?.id);
      onDone();
    } catch (e) {
      setErr(e.message);
      setBusy("");
    }
  };

  const [confirmDelete, setConfirmDelete] = useState(false);
  const reallyRemove = async () => {
    setBusy("Brisanje…");
    try {
      await deletePost(post.id);
      onDone();
    } catch (e) {
      setErr(e.message);
      setBusy("");
    }
  };

  return (
    <section className="wrap page write">
      <header className="admin-head">
        <div>
          <p className="kick">ADMIN · {post ? "UREĐIVANJE" : "NOVA PRIČA"}</p>
          <h1>{f.title || "Nova priča"}</h1>
          <p className="dim">{post ? (post.published ? "● Objavljeno" : "○ Nacrt — vidiš samo ti") : "○ Nacrt — vidiš samo ti dok ne objaviš"}</p>
        </div>
        <div className="admin-head-btns">
          <button className="btn ghost" onClick={onCancel} disabled={!!busy}>← Nazad</button>
        </div>
      </header>

      <div className="write-grid">
        <form className="form" onSubmit={(e) => e.preventDefault()}>
          <label>Naslov<input value={f.title} onChange={set("title")} placeholder="npr. Tajna Vojničevog rukopisa" /></label>
          <label>Adresa priče
            <div className="slug">
              <span>#prica-</span>
              <input value={f.slug} onChange={(e) => { setSlugTouched(true); setF({ ...f, slug: slugify(e.target.value) }); }} />
            </div>
          </label>
          <div className="row">
            <label>Kategorija
              <select value={f.category} onChange={set("category")}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label>Oznaka
              <select value={f.status} onChange={set("status")}>
                <option value="">— bez oznake —</option>
                {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </label>
            <label>Datum<input type="date" value={f.date} onChange={set("date")} /></label>
          </div>
          <label>Kratak opis (vidi se na kartici i ispod naslova)<textarea rows={2} value={f.excerpt} onChange={set("excerpt")} /></label>

          <label>Naslovna slika</label>
          <div className="cover-pick">
            {f.cover ? <img src={f.cover} alt="" /> : <span className="dim">Nema slike</span>}
            <div>
              <label className="btn ghost file">
                {f.cover ? "Promeni" : "Izaberi sliku"}
                <input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0], "cover")} hidden />
              </label>
              {f.cover && <button type="button" className="btn ghost" onClick={() => setF({ ...f, cover: "" })}>Ukloni</button>}
            </div>
          </div>
          <label className="check"><input type="checkbox" checked={f.featured} onChange={set("featured")} /> Istakni na početnoj</label>

          <label>Tekst priče</label>
          <div className="toolbar">
            <button type="button" onClick={() => insert("## ", "", true)}>Podnaslov</button>
            <button type="button" onClick={() => insert("**", "**")}><b>B</b></button>
            <button type="button" onClick={() => insert("*", "*")}><i>I</i></button>
            <button type="button" onClick={() => insert("> ", "", true)}>Citat</button>
            <button type="button" onClick={() => insert("- ", "", true)}>• Lista</button>
            <button type="button" onClick={() => inlineInput.current.click()}>🖼 Slika u tekstu</button>
            <input ref={inlineInput} type="file" accept="image/*" hidden onChange={(e) => { upload(e.target.files?.[0], "inline"); e.target.value = ""; }} />
          </div>
          <textarea ref={ta} className="body" rows={18} value={f.body} onChange={set("body")}
            placeholder={"Piši normalno. Prazan red = novi pasus.\n\n## Ovako se pravi podnaslov\n\n**podebljano**, *iskošeno*, > citat"} />

          <label>Izvori — jedan po redu, adresa posle „|“
            <textarea rows={3} value={f.sources} onChange={set("sources")} placeholder={"Naziv knjige ili sajta | https://adresa.com"} />
          </label>

          {err && <p className="error">{err}</p>}
          <div className="write-actions">
            <button type="button" className="btn" onClick={() => save(true)} disabled={!!busy}>{post?.published ? "Sačuvaj izmene" : "Objavi"}</button>
            <button type="button" className="btn ghost" onClick={() => save(false)} disabled={!!busy}>{post?.published ? "Vrati u nacrt" : "Sačuvaj nacrt"}</button>
            {post && !confirmDelete && <button type="button" className="btn ghost danger" onClick={() => setConfirmDelete(true)} disabled={!!busy}>Obriši</button>}
            {confirmDelete && (
              <span className="confirm">Sigurno? <button type="button" className="btn danger" onClick={reallyRemove}>Da, obriši</button>
                <button type="button" className="btn ghost" onClick={() => setConfirmDelete(false)}>Ne</button></span>
            )}
            {busy && <span className="flash">{busy}</span>}
          </div>
        </form>

        <div className="preview">
          <p className="preview-label">PREGLED</p>
          <Article post={preview} preview />
        </div>
      </div>
    </section>
  );
}
