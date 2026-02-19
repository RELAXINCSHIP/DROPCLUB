require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDrops() {
    const { data: drops, error } = await supabase
        .from('drops')
        .select('id, title, image_url');

    if (error) {
        console.error('Error fetching drops:', error);
        return;
    }

    console.log('Drops Found:', drops.length);
    drops.forEach(drop => {
        console.log(`[${drop.id}] ${drop.title}`);
        console.log(`    Image URL: ${drop.image_url}`);
    });
}

checkDrops();
