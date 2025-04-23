// src/services/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Usa el nombre del bucket en lugar del ID
const bucketName = "finup-bucket"; // Este es el nombre que vi en tu imagen 4

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const storage = supabase.storage;
export const finupBucket = storage.from(bucketName);