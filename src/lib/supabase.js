import { createClient } from "@supabase/supabase-js";

// Keys come from the .env file locally, and from Vercel → Settings → Environment Variables online.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// null = Supabase not set up yet → the site shows the example posts from src/posts/.
export const supabase = url && key ? createClient(url, key) : null;

export const BUCKET = "slike";
