import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client for API routes
export const createServerSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
    throw new Error("Supabase URL not configured")
  }

  if (!serviceKey) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
    throw new Error("Supabase service role key not configured")
  }

  console.log("Creating Supabase client with URL:", url.slice(0, 30) + "...")

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
