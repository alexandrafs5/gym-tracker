import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nscwwhqvnpytgxrxylid.supabase.co";
const supabaseAnonKey = "sb_publishable_ELxo__SOKLHoWTpyA0EAIw_ZwEIN4-d";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
