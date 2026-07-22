const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing credentials in env!");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function runDiagnostics() {
  console.log("Supabase Diagnostics starting...");

  const tablesToCheck = [
    "profiles",
    "users",
    "tickets",
    "events",
    "attendees",
    "clubs",
    "analytics_events",
    "audit_logs"
  ];

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select("*")
        .limit(1);

      if (error) {
        console.log(`❌ Table [${table}]: Error -> ${error.message} (Code: ${error.code})`);
      } else {
        console.log(`✅ Table [${table}]: Exists! Row keys:`, data.length > 0 ? Object.keys(data[0]) : "(empty table)");
      }
    } catch (e) {
      console.log(`❌ Table [${table}]: Exception ->`, e.message);
    }
  }

  // Let's check storage buckets
  const { data: buckets, error: bucketError } = await supabaseAdmin.storage.listBuckets();
  if (bucketError) {
    console.log("❌ Storage Buckets Error:", bucketError.message);
  } else {
    console.log("✅ Storage Buckets:", buckets.map(b => b.name));
  }
}

runDiagnostics();
