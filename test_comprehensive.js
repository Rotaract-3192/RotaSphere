const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function test() {
  console.log('\n=== COMPREHENSIVE E2E TEST ===\n');

  try {
    // 1. Events check
    console.log('1️⃣  Checking events...');
    const { data: events } = await supabase
      .from('events')
      .select('id, title, type, price, capacity, attendees_count, ticket_tiers')
      .limit(3);

    console.log(`✅ Found ${events.length} events`);
    events.forEach((evt, i) => {
      console.log(`   ${i+1}. "${evt.title}" - Type: ${evt.type}, Capacity: ${evt.capacity}, Registered: ${evt.attendees_count}`);
      if (evt.ticket_tiers) {
        const tiers = JSON.parse(evt.ticket_tiers);
        console.log(`      Tiers: ${tiers.map(t => `${t.name}(${t.ticketsSold || 0}/${t.capacity})`).join(', ')}`);
      }
    });

    // 2. Tickets check
    if (events[0]) {
      console.log(`\n2️⃣  Checking tickets for "${events[0].title}"...`);
      const { data: tickets } = await supabase
        .from('tickets')
        .select('id, ticket_code, status, price_paid, payment_screenshot_url, created_at')
        .eq('event_id', events[0].id)
        .order('created_at', { ascending: false })
        .limit(5);

      console.log(`✅ Found ${tickets.length} tickets`);
      tickets.forEach((t, i) => {
        const hasScreenshot = t.payment_screenshot_url ? '✓' : '✗';
        console.log(`   ${i+1}. Code: ${t.ticket_code}, Status: ${t.status}, Screenshot: ${hasScreenshot}`);
      });
    }

    console.log('\n✅ TESTS COMPLETE\n');
  } catch (err) {
    console.error('❌ ERROR:', err.message);
  }
}

test();
