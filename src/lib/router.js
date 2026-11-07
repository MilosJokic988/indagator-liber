import { useEffect, useState } from "react";

// Simple routing on the part of the address after "#":
//   (empty)            → home
//   #istorija, ...     → category
//   #prica-<slug>      → a single post
//   #o-meni, #admin    → pages
export function parseRoute(hash) {
  const h = decodeURIComponent((hash || "").replace(/^#/, ""));
  if (!h) return { page: "home" };
  if (h.startsWith("prica-")) return { page: "post", slug: h.slice(6) };
  if (h === "o-meni") return { page: "about" };
  if (h === "admin" || h === "pisi") return { page: "admin" };
  if (h === "sve") return { page: "category", id: "sve" };
  return { page: "category", id: h };
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseRoute(location.hash));
  useEffect(() => {
    const on = () => {
      setRoute(parseRoute(location.hash));
      window.scrollTo(0, 0);
    };
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  return route;
}

export const linkTo = {
  home: "#",
  category: (id) => `#${id}`,
  post: (slug) => `#prica-${slug}`,
  about: "#o-meni",
  admin: "#admin",
};
