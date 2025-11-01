// auth-functions.tsx

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vetwwtmxcdiotjxhdeza.supabase.co';
const supabaseAnonKey = "sb_publishable_HGEcSz9zpnf_XbFXrbVwqA_sBRYmKOk";
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase; 