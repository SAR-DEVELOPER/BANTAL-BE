/**
 * Test Keycloak connectivity
 * 
 * This script tests connectivity to a Keycloak server using the same approach
 * that works in the login flow.
 * 
 * Usage:
 *   node test-keycloak-connection.js [host] [port] [timeout]
 * 
 * Examples:
 *   node test-keycloak-connection.js keycloak 8080 5000
 *   node test-keycloak-connection.js localhost 8080 10000
 */

const axios = require('axios');

// Configuration
const host = process.argv[2] || process.env.KEYCLOAK_HOST || 'keycloak';
const port = process.argv[3] || process.env.KEYCLOAK_PORT || '8080';
const realm = process.argv[4] || process.env.KEYCLOAK_REALM || 'BANTAL';
const timeout = parseInt(process.argv[5] || '5000', 10);

// Build URLs
const baseUrl = `http://${host}:${port}`;
const realmUrl = `${baseUrl}/realms/${realm}`;
const wellKnownUrl = `${realmUrl}/.well-known/openid-configuration`;
const tokenUrl = `${realmUrl}/protocol/openid-connect/token`;

async function testConnection() {
  console.log(`\nTesting Keycloak connectivity to ${baseUrl} for realm "${realm}"...\n`);
  
  console.log('1. Testing Keycloak realm endpoint...');
  try {
    const realmResponse = await axios.get(realmUrl, { timeout });
    console.log('✅ Successfully connected to realm endpoint');
    console.log(`   Response status: ${realmResponse.status}`);
    if (realmResponse.data && realmResponse.data.realm) {
      console.log(`   Realm name: ${realmResponse.data.realm}`);
    }
  } catch (error) {
    console.log('❌ Failed to connect to realm endpoint');
    console.log(`   Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Connection refused. Keycloak service might not be running.');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n⚠️  Host not found. Check hostname and DNS resolution.');
    }
    
    return;
  }
  
  console.log('\n2. Testing OpenID Configuration endpoint...');
  try {
    const wellKnownResponse = await axios.get(wellKnownUrl, { timeout });
    console.log('✅ Successfully connected to OpenID Configuration endpoint');
    console.log(`   Issuer: ${wellKnownResponse.data.issuer}`);
    console.log(`   Token endpoint: ${wellKnownResponse.data.token_endpoint}`);
  } catch (error) {
    console.log('❌ Failed to connect to OpenID Configuration endpoint');
    console.log(`   Error: ${error.message}`);
    return;
  }
  
  console.log('\n✅ CONNECTION TEST SUCCESSFUL');
  console.log('\nRecommended configuration:');
  console.log(`KEYCLOAK_HOST=${host}`);
  console.log(`KEYCLOAK_PORT=${port}`);
  console.log(`KEYCLOAK_REALM=${realm}`);
  console.log(`KEYCLOAK_URL=http://${host}:${port}`);
}

testConnection().catch(error => {
  console.error('Unhandled error during test:', error);
  process.exit(1);
}); 