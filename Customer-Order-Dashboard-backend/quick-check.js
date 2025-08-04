// quick-check.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME;
const USERS_COLLECTION = process.env.USERS_COLLECTION || 'users';
const ORDERS_COLLECTION = process.env.ORDERS_COLLECTION || 'orders';

// Validate required environment variables
if (!MONGODB_URI || !DATABASE_NAME) {
    console.error('❌ Missing required environment variables. Please check your .env file.');
    process.exit(1);
}

async function quickCheck() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        // Connect
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        const db = client.db(DATABASE_NAME);
        console.log('✅ Connected!\n');
        
        // Quick stats
        const usersCount = await db.collection(USERS_COLLECTION).countDocuments();
        const ordersCount = await db.collection(ORDERS_COLLECTION).countDocuments();
        
        console.log(`📊 Quick Stats:`);
        console.log(`   Users: ${usersCount}`);
        console.log(`   Orders: ${ordersCount}\n`);
        
        // Top 10 users
        console.log('👥 Top 10 Users:');
        const users = await db.collection(USERS_COLLECTION).find({}).limit(10).toArray();
        users.forEach((user, i) => {
            console.log(`   ${i+1}. ${user.first_name} ${user.last_name} (ID: ${user.user_id})`);
        });
        
        console.log('\n📦 Top 10 Orders:');
        const orders = await db.collection(ORDERS_COLLECTION).find({}).limit(10).toArray();
        orders.forEach((order, i) => {
            console.log(`   ${i+1}. Order #${order.order_id} - ${order.status} (User: ${order.user_id})`);
        });
        
        console.log('\n✅ Quick check completed!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('🔒 Connection closed');
    }
}

quickCheck();