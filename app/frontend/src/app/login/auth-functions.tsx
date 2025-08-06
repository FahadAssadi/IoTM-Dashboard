
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vetwwtmxcdiotjxhdeza.supabase.co';
const supabaseAnonKey = "sb_publishable_HGEcSz9zpnf_XbFXrbVwqA_sBRYmKOk";

const supabase = createClient(supabaseUrl, supabaseAnonKey)
 

// const { data, error } = await supabase.auth.signInWithPassword({
//     email: 'kcod0001@student.monash.edu',
//     password: 'password123'
// })

// useful data from the data returned
// data.session.access_token
// data.session.refresh_token
// data.session.expires_at (unix time)  <- 1 hour from refresh appears to be default
// data.user

export default supabase; 