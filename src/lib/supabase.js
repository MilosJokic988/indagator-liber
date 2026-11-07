import { createClient } from "@supabase/supabase-js";

// Works with our own .env names (VITE_…) and with the names the Vercel ↔ Supabase
// integration adds automatically (NEXT_PUBLIC_…).
const env = import.meta.env;
const url = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  env.VITE_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// null = Supabase not set up yet → the site shows the example posts from src/posts/.
export const supabase = url && key ? createClient(url, key) : null;

export const BUCKET = "slike";
