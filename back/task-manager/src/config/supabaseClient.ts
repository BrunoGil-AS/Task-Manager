/**
 * Supabase client configuration module.
 *
 * Responsibilities:
 * - Load environment variables for Supabase connection details.
 * - Validate required configuration is present at startup.
 * - Provide a shared, unauthenticated client instance for server-side use.
 * - Provide a helper to create an authenticated client for per-request access.
 *
 * Required environment variables:
 * - `SUPABASE_URL`: Supabase project URL.
 * - `SUPABASE_PUBLISHABLE_KEY`: Supabase publishable (anon) API key.
 *
 * Notes on auth settings:
 * - `autoRefreshToken: false` disables background refresh.
 * - `persistSession: false` disables session storage on the server.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Supabase configuration derived from environment variables.
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

/**
 * Fail fast if required environment variables are missing.
 */
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

/**
 * Shared Supabase client configured for server-side usage without session
 * persistence or automatic token refresh.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Creates a Supabase client that sends the provided access token on each request.
 *
 * @param accessToken - JWT access token for authenticated Supabase calls.
 * @returns A Supabase client instance scoped to the given access token.
 */
export function createAuthenticatedClient(accessToken: string): SupabaseClient {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export default supabase;
