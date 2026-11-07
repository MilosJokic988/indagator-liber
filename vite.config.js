import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  // VITE_… are our own variables; NEXT_PUBLIC_… are the ones the Vercel ↔ Supabase
  // integration creates automatically. Both are public keys by design.
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
});
