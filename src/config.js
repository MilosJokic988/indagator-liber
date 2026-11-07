// ===== Osnovna podešavanja sajta — menjaj slobodno =====

export const SITE = {
  name: "INDAGATOR LIBER",
  motto: "Slobodni istraživač",
  tagline: "Istorija, misterije, teorije zavere i vera — sa izvorima, bez buke.",
  tiktok: "https://www.tiktok.com/@witcher977",
  tiktokHandle: "@witcher977",
  followers: "28.3K",
  likes: "211.7K",
  email: "", // npr. "kontakt@indagatorliber.com" — ostavi prazno da se ne prikazuje
  about: [
    "Indagator liber na latinskom znači „slobodni istraživač“. To je i ideja ovog mesta: da se svaka priča — bila to stara hronika, nerešena zagonetka ili teorija koja kruži internetom — pogleda izbliza, sa izvorima na stolu.",
    "Na TikToku pričam kratko. Ovde su cele priče: šta se zna, šta je sporno, a šta je samo priča. Svaka objava ima oznaku koliko je nešto potvrđeno i spisak izvora, pa svako može da proveri sam.",
  ],
};

// Kategorije: id se koristi u objavama (polje "kategorija").
export const CATEGORIES = [
  { id: "istorija", num: "I", name: "Istorija", blurb: "Ljudi, bitke i odluke koje su oblikovale svet." },
  { id: "misterije", num: "II", name: "Misterije", blurb: "Zagonetke na koje odgovor još niko nema." },
  { id: "zavere", num: "III", name: "Teorije zavere", blurb: "Šta tvrde, šta kažu dokazi — i ko je u pravu." },
  { id: "vera", num: "IV", name: "Vera", blurb: "Sveti, svetinje i priče Pravoslavlja." },
];

// Oznake koliko je nešto potvrđeno (polje "status" u objavi).
export const STATUSES = {
  dokazano: { label: "DOKAZANO", note: "Potvrđeno pouzdanim izvorima." },
  sporno: { label: "SPORNO", note: "Istoričari i stručnjaci se ne slažu." },
  nereseno: { label: "NEREŠENO", note: "Odgovor do danas niko nema." },
  teorija: { label: "TEORIJA", note: "Tvrdnja bez čvrstih dokaza." },
  opovrgnuto: { label: "OPOVRGNUTO", note: "Dokazi govore suprotno." },
};
