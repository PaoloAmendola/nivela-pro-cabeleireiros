import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Fetch environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Basic validation
if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Create and export a function that returns the Supabase client instance
// This matches the import usage in AuthContext.tsx
export const createClient = () => createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Also export the instance directly in case it's needed elsewhere (optional)
// export const supabase = createClient();

