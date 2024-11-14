import {createClient} from '@supabase/supabase-js'
require('dotenv').config()

const supabase_url =  "https://mkukskgeckbudkgmsyxj.supabase.co"
const supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdWtza2dlY2tidWRrZ21zeXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk5NjEzMDQsImV4cCI6MjA0NTUzNzMwNH0.8EfNl79aBJh13RmjN-AGYHbl7iw7CWUAc4ahUh-bRhA"

export const supabase = createClient(supabase_url,supabase_key)