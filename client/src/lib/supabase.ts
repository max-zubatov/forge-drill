import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// Supabase is optional — only initialise if both vars are present.
// Missing vars are fine: db.ts falls back to localStorage silently.
export const supabase = url && key ? createClient(url, key) : null;
