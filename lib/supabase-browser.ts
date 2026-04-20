"use client";

import { createBrowserClient } from "@supabase/ssr";

const FALLBACK_URL = "https://dvhjphopmfbskqkabggw.supabase.co";
const FALLBACK_KEY = "placeholder-anon-key";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;
  return createBrowserClient(url, key);
}
