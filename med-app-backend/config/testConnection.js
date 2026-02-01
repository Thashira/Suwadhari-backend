// Database Connection Test Utility
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 Testing Database Connection...');
  console.log('='.repeat(60));

  try {
    // Test 1: Check if Prisma can connect
    console.log('\n📡 Attempting to connect to database...');
    await prisma.$connect();
    console.log('✅ Database connection established!');

    // Test 2: Run a simple query
    console.log('\n🔄 Testing database query...');
    const userCount = await prisma.user.count();
    console.log(`✅ Query successful! Current users in database: ${userCount}`);

    // Test 3: Check database info
    console.log('\n📊 Database Information:');
    console.log(`   Database URL: ${process.env.DATABASE_URL?.split('@')[1] || 'Hidden'}`);
    console.log(`   Connection Status: CONNECTED`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL DATABASE TESTS PASSED!');
    console.log('='.repeat(60) + '\n');

    return true;
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.error('❌ DATABASE CONNECTION FAILED!');
    console.log('='.repeat(60));
    console.error('\n🚨 Error Details:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code || 'N/A'}`);
    
    console.log('\n💡 Troubleshooting Tips:');
    console.log('   1. Check if DATABASE_URL is correct in .env file');
    console.log('   2. Ensure you have internet connection');
    console.log('   3. Verify Supabase database is running');
    console.log('   4. Run: npx prisma migrate dev --name init');
    console.log('   5. Run: npx prisma generate\n');
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  testConnection()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = testConnection;
