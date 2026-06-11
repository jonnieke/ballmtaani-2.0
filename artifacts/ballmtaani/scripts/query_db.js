const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .limit(10);

  if (error) {
    console.error("Error fetching articles:", error);
    return;
  }

  console.log("Fetched articles count:", data.length);
  for (const article of data) {
    console.log("=========================================");
    console.log("ID:", article.id);
    console.log("Slug:", article.slug);
    console.log("Title:", article.title);
    console.log("Status:", article.status);
    console.log("Thumbnail URL:", article.thumbnail_url);
    console.log("Content snippet:", article.content ? article.content.substring(0, 200) + "..." : null);
    console.log("Excerpt:", article.excerpt);
    console.log("WC26:", article.is_wc26);
  }
}

main();
