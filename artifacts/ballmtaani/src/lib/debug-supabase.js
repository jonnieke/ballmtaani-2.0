
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const tables = ['profiles', 'matches', 'teams', 'debates', 'fan_zones', 'banter'];
  console.log(`Checking tables on ${supabaseUrl}...`);

  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      if (error.code === '42P01') {
        console.log(`❌ Table "${table}" DOES NOT EXIST (42P01)`);
      } else {
        console.log(`⚠️ Table "${table}" error: ${error.message} (${error.code})`);
      }
    } else {
      console.log(`✅ Table "${table}" exists`);
    }
  }
}

checkTables();
