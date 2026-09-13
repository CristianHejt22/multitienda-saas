import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:BocaCarajo26$$@db.vxnhbgjdrajvjvmseegt.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function initDB() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL!');

    // Create Stores Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        whatsapp_number TEXT,
        description TEXT,
        password TEXT,
        theme_color TEXT DEFAULT '#6366f1',
        banner_url TEXT,
        logo_url TEXT,
        subscription_plan TEXT DEFAULT 'Mensual ($6.000)',
        custom_domain_requested BOOLEAN DEFAULT false,
        custom_domain TEXT,
        mercado_pago_token TEXT,
        announcement_text TEXT,
        business_hours TEXT,
        instagram_url TEXT,
        facebook_url TEXT,
        referral_active BOOLEAN DEFAULT false,
        affiliate_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );
    `);
    console.log('Stores table created.');

    // Create Categories Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );
    `);
    console.log('Categories table created.');

    // Create Products Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
        category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL,
        compare_at_price NUMERIC,
        description TEXT,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );
    `);
    console.log('Products table created.');

    // Create Requests Table (SuperAdmin)
    await client.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type TEXT NOT NULL, -- 'NEW_STORE' or 'UPGRADE'
        store_id UUID REFERENCES stores(id) ON DELETE CASCADE, -- For upgrades
        name TEXT, -- For new stores
        whatsapp_number TEXT,
        description TEXT,
        plan TEXT,
        requested_plan TEXT,
        custom_domain BOOLEAN DEFAULT false,
        referral_code TEXT,
        store_name TEXT, -- For upgrades
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );
    `);
    console.log('Requests table created.');

    // Habilitar acceso anónimo público de lectura/escritura temporal (No RLS estricto por prototipo)
    await client.query(`
      -- Enable Row Level Security (temporarily allowing all for simplicity of migration)
      ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
      ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE products ENABLE ROW LEVEL SECURITY;
      ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
      
      -- Drop policies if exist
      DROP POLICY IF EXISTS "Public Access" ON stores;
      DROP POLICY IF EXISTS "Public Access" ON categories;
      DROP POLICY IF EXISTS "Public Access" ON products;
      DROP POLICY IF EXISTS "Public Access" ON requests;

      CREATE POLICY "Public Access" ON stores FOR ALL USING (true) WITH CHECK (true);
      CREATE POLICY "Public Access" ON categories FOR ALL USING (true) WITH CHECK (true);
      CREATE POLICY "Public Access" ON products FOR ALL USING (true) WITH CHECK (true);
      CREATE POLICY "Public Access" ON requests FOR ALL USING (true) WITH CHECK (true);
    `);
    console.log('RLS policies configured for open access.');

    console.log('Database initialization completed successfully!');
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
  }
}

initDB();
