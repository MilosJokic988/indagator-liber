// Vite učitava sve .md datoteke iz src/posts automatski.
// Nova objava = nova .md datoteka u toj fascikli. Ništa drugo ne treba menjati.
export const RAW = import.meta.glob("../posts/*.md", { query: "?raw", import: "default", eager: true });
