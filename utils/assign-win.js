require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key to bypass RLS and allow updates
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables (need SUPABASE_SERVICE_ROLE_KEY).');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function assignWin() {
    const searchTerm = 'kenroyhedwards';
    const dropTitle = 'iPhone 15 Pro Max';

    // 1. Find User
    console.log(`Searching for user: ${searchTerm}...`);
    const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);

    if (userError) {
        console.error('Error finding user:', userError);
        return;
    }

    if (users.length === 0) {
        console.error('No user found matching:', searchTerm);
        return;
    }

    if (users.length > 1) {
        console.error('Multiple users found:', users.map(u => `${u.email} (${u.full_name})`));
        return;
    }

    const winner = users[0];
    console.log(`Found User: ${winner.email} (${winner.id})`);

    // 2. Find Drop
    console.log(`Searching for drop: ${dropTitle}...`);
    const { data: drops, error: dropError } = await supabase
        .from('drops')
        .select('id, title')
        .ilike('title', `%${dropTitle}%`);

    if (dropError) {
        console.error('Error finding drop:', dropError);
        return;
    }

    if (drops.length === 0) {
        console.error('No drop found matching:', dropTitle);
        return;
    }

    const drop = drops[0];
    console.log(`Found Drop: ${drop.title} (${drop.id})`);

    // 3. Update Drop
    console.log('Assigning win...');
    const { error: updateError } = await supabase
        .from('drops')
        .update({
            winner_id: winner.id,
            status: 'completed', // Assuming a win ends the drop
            ends_at: new Date().toISOString() // End it now
        })
        .eq('id', drop.id);

    if (updateError) {
        console.error('Error updating drop:', updateError);
    } else {
        console.log(`Success! ${winner.email} is now the winner of ${drop.title}.`);
    }
}

assignWin();
