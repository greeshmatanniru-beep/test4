import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
if (fs.existsSync(path.join(__dirname, '..', '.env'))) {
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
} else {
  dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
}

const { Pool } = pg;

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set in .env');
    process.exit(1);
  }

  console.log('🔄 Connecting to PostgreSQL at:', databaseUrl.split('@')[1] || 'configured host');

  const isSupabase = databaseUrl.includes('supabase.co') || databaseUrl.includes('supabase.com') || databaseUrl.includes('pooler.supabase');
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: (process.env.PGSSL === 'true' || isSupabase) ? { rejectUnauthorized: false } : false,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to database');

    const migrationPath = path.join(__dirname, '..', 'config', 'supabase_migration.sql');
    const schemaPath = path.join(__dirname, '..', 'config', 'schema.sql');
    const sqlFile = fs.existsSync(migrationPath) ? migrationPath : schemaPath;
    const sql = fs.readFileSync(sqlFile, 'utf-8');

    console.log(`🔄 Executing ${path.basename(sqlFile)} in a single run...`);
    await client.query(sql);
    console.log('✅ All tables, RLS policies, and seed data created successfully.');

    // Seed default admin user if not exists
    const adminCheck = await client.query("SELECT id FROM users WHERE email = 'admin@corpmind.ai'");
    if (adminCheck.rows.length === 0) {
      console.log('🔄 Seeding default executive admin user...');
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash('password123', salt);
      await client.query(`
        INSERT INTO users (email, password_hash, full_name, role, department)
        VALUES ('admin@corpmind.ai', $1, 'Elena Rostova (Chief AI & Operations Officer)', 'admin', 'executive')
      `, [hash]);
      console.log('✅ Admin user created: admin@corpmind.ai / password123');
    } else {
      console.log('ℹ️ Admin user already exists.');
    }

    client.release();
    await pool.end();
    console.log('🎉 Database initialization complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

run();
