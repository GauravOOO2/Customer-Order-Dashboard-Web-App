// debug-models.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Order = require('./src/models/Order');

async function debugModels() {
  try {
    console.log('🔍 Debugging Models...\n');
    
    // Connect to database
    const connectionString = `${process.env.MONGODB_URI}${process.env.DATABASE_NAME}?retryWrites=true&w=majority`;
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB');
    
    // Check if models are properly loaded
    console.log('\n📊 Model Information:');
    console.log('User model:', typeof User);
    console.log('User.find function:', typeof User.find);
    console.log('User.countDocuments function:', typeof User.countDocuments);
    console.log('Order model:', typeof Order);
    
    // Check if collections exist and have data
    console.log('\n📋 Collection Information:');
    
    // Get collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Check users collection
    try {
      const userCount = await User.countDocuments();
      console.log(`Users collection: ${userCount} documents`);
      
      if (userCount > 0) {
        const sampleUser = await User.findOne();
        console.log('Sample user:', {
          user_id: sampleUser.user_id,
          first_name: sampleUser.first_name,
          last_name: sampleUser.last_name
        });
      } else {
        console.log('⚠️  No users found - you need to load data!');
      }
    } catch (error) {
      console.log('❌ Error accessing users collection:', error.message);
    }
    
    // Check orders collection
    try {
      const orderCount = await Order.countDocuments();
      console.log(`Orders collection: ${orderCount} documents`);
      
      if (orderCount > 0) {
        const sampleOrder = await Order.findOne();
        console.log('Sample order:', {
          order_id: sampleOrder.order_id,
          user_id: sampleOrder.user_id,
          status: sampleOrder.status
        });
      } else {
        console.log('⚠️  No orders found - you need to load data!');
      }
    } catch (error) {
      console.log('❌ Error accessing orders collection:', error.message);
    }
    
    // Test simple query
    console.log('\n🧪 Testing Simple Query:');
    try {
      const users = await User.find({}).limit(2);
      console.log('✅ Simple find works, found users:', users.length);
      if (users.length > 0) {
        console.log('First user:', {
          user_id: users[0].user_id,
          name: `${users[0].first_name} ${users[0].last_name}`
        });
      }
    } catch (error) {
      console.log('❌ Simple find failed:', error.message);
    }
    
    await mongoose.connection.close();
    console.log('\n🔒 Connection closed');
    
  } catch (error) {
    console.error('💥 Debug failed:', error);
  }
}

debugModels();