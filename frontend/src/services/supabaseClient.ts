import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔍 SUPABASE URL:", supabaseUrl);
console.log("🔍 SUPABASE ANON KEY:", supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "❌ Supabase env vars missing. Check .env.local or build step.",
  );
}

const bucketName = "finup-bucket";

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
export const storage = supabase.storage;
export const finupBucket = storage.from(bucketName);
