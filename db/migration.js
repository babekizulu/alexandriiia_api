const pool = require('./db');

// Function to run the migration
const runMigration = async () => {
  try {
    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    // If users table doesn't exist, create it
    if (!tableCheck.rows[0].exists) {
      console.log('Users table does not exist. Creating...');
      await pool.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(128) NOT NULL,
          last_name VARCHAR(128) NOT NULL,
          username VARCHAR(100) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          subscription_tier VARCHAR(50) DEFAULT 'free',
          subscription_expires TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Users table created successfully');
    } else {
      // Check if required columns exist and add them if they don't
      
      // Check if first_name column exists
      const firstNameCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'users' 
          AND column_name = 'first_name'
        );
      `);
      
      // If first_name and last_name columns don't exist but name does, split name into first_name and last_name
      if (!firstNameCheck.rows[0].exists) {
        const nameCheck = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'users' 
            AND column_name = 'name'
          );
        `);
        
        if (nameCheck.rows[0].exists) {
          console.log('Migrating from name to first_name and last_name...');
          // Add the new columns
          await pool.query(`
            ALTER TABLE users 
            ADD COLUMN first_name VARCHAR(128),
            ADD COLUMN last_name VARCHAR(128);
          `);
          
          // Update the new columns based on the name column
          await pool.query(`
            UPDATE users 
            SET 
              first_name = SPLIT_PART(name, ' ', 1),
              last_name = SUBSTRING(name FROM POSITION(' ' IN name) + 1);
          `);
          
          // Make the new columns NOT NULL
          await pool.query(`
            ALTER TABLE users 
            ALTER COLUMN first_name SET NOT NULL,
            ALTER COLUMN last_name SET NOT NULL;
          `);
          
          // Drop the old name column
          await pool.query(`
            ALTER TABLE users
            DROP COLUMN name;
          `);
          console.log('Migration from name to first_name and last_name completed');
        } else {
          // Just add the columns if name doesn't exist
          await pool.query(`
            ALTER TABLE users 
            ADD COLUMN first_name VARCHAR(128) NOT NULL,
            ADD COLUMN last_name VARCHAR(128) NOT NULL;
          `);
        }
      }
      
      // Check if subscription_tier column exists
      const subscriptionTierCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'users' 
          AND column_name = 'subscription_tier'
        );
      `);
      
      // If subscription_tier column doesn't exist, add it
      if (!subscriptionTierCheck.rows[0].exists) {
        console.log('Adding subscription_tier column to users table...');
        await pool.query(`
          ALTER TABLE users 
          ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free';
        `);
        console.log('subscription_tier column added successfully');
      }
      
      // Check if subscription_expires column exists
      const subscriptionExpiresCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'users' 
          AND column_name = 'subscription_expires'
        );
      `);
      
      // If subscription_expires column doesn't exist, add it
      if (!subscriptionExpiresCheck.rows[0].exists) {
        console.log('Adding subscription_expires column to users table...');
        await pool.query(`
          ALTER TABLE users 
          ADD COLUMN subscription_expires TIMESTAMP WITH TIME ZONE;
        `);
        console.log('subscription_expires column added successfully');
      }
      
      // Check if username column exists
      const usernameCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'users' 
          AND column_name = 'username'
        );
      `);
      
      // If username column doesn't exist, add it
      if (!usernameCheck.rows[0].exists) {
        console.log('Adding username column to users table...');
        await pool.query(`
          ALTER TABLE users 
          ADD COLUMN username VARCHAR(100) UNIQUE;
        `);
        console.log('Username column added successfully');
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit();
  }
};

// Run the migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration }; 