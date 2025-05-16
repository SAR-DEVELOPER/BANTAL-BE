const { Client } = require('pg');
const fs = require('fs');

// Try to read environment variables from .env file
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
  console.log('Loaded environment variables from .env file');
} catch (error) {
  console.log('No .env file found, using default or existing environment variables');
}

async function checkTables() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'JalanCipunagara25!',
    database: process.env.DB_DATABASE || 'bantal_db',
  });

  console.log('Connecting to database with the following parameters:');
  console.log({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_DATABASE || 'bantal_db',
    user: process.env.DB_USERNAME || 'postgres',
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check document types
    const documentTypes = await client.query(`
      SELECT * FROM document_schema.document_type
    `);
    console.log('Document Types:');
    console.log(documentTypes.rows);
    
    // Check if surat_penawaran table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'document_schema' 
        AND table_name = 'surat_penawaran'
      )
    `);
    console.log('surat_penawaran table exists:', tableCheck.rows[0].exists);
    
    // If table exists, check its structure
    if (tableCheck.rows[0].exists) {
      const tableStructure = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'document_schema'
        AND table_name = 'surat_penawaran'
      `);
      console.log('surat_penawaran table structure:');
      console.log(tableStructure.rows);
      
      // Check if any records exist
      const recordCount = await client.query(`
        SELECT COUNT(*) FROM document_schema.surat_penawaran
      `);
      console.log('Number of records in surat_penawaran:', recordCount.rows[0].count);
      
      if (parseInt(recordCount.rows[0].count) > 0) {
        const records = await client.query(`
          SELECT * FROM document_schema.surat_penawaran LIMIT 5
        `);
        console.log('Sample records:');
        console.log(records.rows);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

checkTables().catch(console.error); 