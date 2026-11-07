import { useEffect } from "react";
import { useRoute } from "./lib/router.js";
import { CATEGORIES, SITE } from "./config.js";
import { PostsProvider, usePosts } from "./lib/data.jsx";
import Sky from "./components/Sky.jsx";
import { Footer, Header } from "./components/Bits.jsx";
import Home from "./pages/Home.jsx";
import Category from "./pages/Category.jsx";
import Post from "./pages/Post.jsx";
import About from "./pages/About.jsx";
import Admin from "./pages/Admin.jsx";

function Shell() {
  const route = useRoute();
  const { posts } = usePosts();

  // Browser tab title follows the page.
  useEffect(() => {
    let t = SITE.name;
    if (route.page === "post") t = (posts.find((p) => p.slug === route.slug)?.title || "Priča") + " · " + SITE.name;
    if (route.page === "category") t = (CATEGORIES.find((c) => c.id === route.id)?.name || "Sve priče") + " · " + SITE.name;
    if (route.page === "about") t = "O meni · " + SITE.name;
    if (route.page === "admin") t = "Admin · " + SITE.name;
    document.title = t;
  }, [route, posts]);

  let page;
  if (route.page === "post") page = <Post slug={route.slug} />;
  else if (route.page === "category") page = <Category id={route.id} />;
  else if (route.page === "about") page = <About />;
  else if (route.page === "admin") page = <Admin mode={route.mode} edit={route.edit} />;
  else page = <Home />;

  return (
    <>
      <Sky />
      <div className="veil" />
      <div className="grain" />
      <div className="vignette" />
      <Header route={route} />
      <main key={route.page + (route.slug || route.id || route.mode || route.edit || "")}>{page}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <PostsProvider>
      <Shell />
    </PostsProvider>
  );
}
