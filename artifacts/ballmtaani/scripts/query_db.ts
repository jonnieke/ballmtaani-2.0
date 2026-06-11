import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://rkxrkpahrrgzlnxqxolu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJreHJrcGFocnJnemxueHF4b2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDY2MjksImV4cCI6MjA4ODkyMjYyOX0.BHqdmaN6hFZfO_5NYpvfu_4FM3UxoRgYhKECcK3Xc8w";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data, error } = await supabase
    .from('articles')
    .select('*');

  if (error) {
    console.error("Error fetching articles:", error);
    return;
  }

  console.log(JSON.stringify(data, null, 2));
}

main();
