import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@shared/schema';

// Create database connection
export const createDbConnection = () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn('DATABASE_URL not found. Database features will be disabled.');
    return null;
  }

  try {
    const sql = neon(databaseUrl);
    const db = drizzle(sql, { schema });
    console.log('✅ Database connection established');
    return db;
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    return null;
  }
};

export type Database = ReturnType<typeof createDbConnection>;
