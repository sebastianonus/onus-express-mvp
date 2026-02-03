// src/utils/supabase/info.tsx
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!projectId || !publicAnonKey) {
  console.warn(
    "Missing Supabase env vars: VITE_SUPABASE_PROJECT_ID / VITE_SUPABASE_ANON_KEY"
  );
}
