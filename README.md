# Indagator Liber — sajt sa admin panelom

React + Vite + Supabase. Posetioci vide samo **objavljene** priče. Ti se prijaviš na
`tvojsajt.vercel.app/#admin`, pišeš, ubacuješ slike, čuvaš nacrte i objavljuješ — odmah, i sa telefona.

Dok Supabase nije povezan, sajt radi i prikazuje primere priča iz `src/posts/`.

---

## 1. Pokretanje na računaru

```bash
npm install
npm run dev
```

## 2. Supabase (jednom, ~10 minuta)

1. Napravi nalog i **novi projekat** na https://supabase.com (besplatni plan je dovoljan).
2. Otvori **SQL Editor → New query**, nalepi ceo sadržaj datoteke `supabase.sql`.
   **Pre toga u njoj zameni `tvoj@mejl.com` svojim mejlom (3 mesta).** Klikni **Run**.
3. **Authentication → Users → Add user → Create new user**: tvoj mejl + jaka lozinka
   (uključi „Auto Confirm User“).
4. **Authentication → Sign In / Providers → Email**: isključi **Allow new users to sign up**,
   da niko drugi ne može da napravi nalog. (Čak i da napravi, baza mu ne dozvoljava ništa —
   pravo menjanja ima samo tvoj mejl.)
5. **Project Settings → API**: kopiraj **Project URL** i **anon public** ključ.

## 3. Ključevi

Lokalno: kopiraj `.env.example` u `.env` i upiši vrednosti:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Na Vercel-u: **Project → Settings → Environment Variables** → dodaj iste dve promenljive
→ **Redeploy**.

`anon` ključ je napravljen da bude javan — zaštitu radi baza (pravila u `supabase.sql`).
Nikad ne stavljaj **service_role** ključ u sajt.

## 4. Objavljivanje na Vercel

Stavi projekat na GitHub → na vercel.com **Add New → Project** → izaberi repozitorijum.
Vercel sam prepozna Vite (Build: `npm run build`, Output: `dist`). Dodaj ključeve iz koraka 3.

Posle toga **priče ne zahtevaju nikakav deploy** — objaviš ih iz admina i odmah su na sajtu.
Deploy treba samo kad menjaš izgled ili kod.

---

## Admin panel (`#admin`)

- **+ Nova priča** — naslov, kategorija, oznaka (DOKAZANO, SPORNO…), datum, kratak opis
- **Naslovna slika** i **🖼 Slika u tekstu** — slike se same smanje i otpreme u Supabase
- **Sačuvaj nacrt** — vidiš samo ti · **Objavi** — vide svi
- **Uredi / Vrati u nacrt / Obriši** postojeće priče
- Desno je živi pregled kako će priča izgledati

Admin nije u meniju. Ko pogodi adresu, vidi samo formu za prijavu.

## Pisanje teksta

```
## Podnaslov
**podebljano**, *iskošeno*
> citat
- stavka liste
```

Izvori, jedan po redu: `Naziv izvora | https://adresa.com`

## Gde je šta

| | |
|---|---|
| `src/config.js` | ime, moto, TikTok, brojevi, tekst „O meni“, kategorije, oznake |
| `src/pages/Admin.jsx` | admin: prijava, lista, uređivač |
| `src/lib/data.jsx` | čitanje i pisanje u Supabase |
| `supabase.sql` | tabela, pravila pristupa, skladište slika |
| `src/posts/` | primeri (prikazuju se samo dok Supabase nije povezan) |
| `src/styles.css` | ceo izgled |
