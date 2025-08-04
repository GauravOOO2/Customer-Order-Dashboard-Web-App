// quick-check.js
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://gauravking918:HAx9nvI81aYkPnEP@customer-order-dashboar.g0hbgrq.mongodb.net/';
const DATABASE_NAME = 'company_db';

async function quickCheck() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        // Connect
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        const db = client.db(DATABASE_NAME);
        console.log('✅ Connected!\n');
        
        // Quick stats
        const usersCount = await db.collection('users').countDocuments();
        const ordersCount = await db.collection('orders').countDocuments();
        
        console.log(`📊 Quick Stats:`);
        console.log(`   Users: ${usersCount}`);
        console.log(`   Orders: ${ordersCount}\n`);
        
        // Top 10 users
        console.log('👥 Top 10 Users:');
        const users = await db.collection('users').find({}).limit(10).toArray();
        users.forEach((user, i) => {
            console.log(`   ${i+1}. ${user.first_name} ${user.last_name} (ID: ${user.user_id})`);
        });
        
        console.log('\n📦 Top 10 Orders:');
        const orders = await db.collection('orders').find({}).limit(10).toArray();
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