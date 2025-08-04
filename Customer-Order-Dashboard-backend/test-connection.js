// test-connection.js
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME;

console.log('🔍 Connection Test Started...');
console.log('MongoDB URI:', MONGODB_URI ? 'URI found' : 'URI missing');
console.log('Database Name:', DATABASE_NAME);
console.log('Full Connection String:', `${MONGODB_URI}${DATABASE_NAME}`);

async function testConnection() {
  try {
    console.log('\n🔌 Attempting MongoDB connection...');
    
    const connectionString = `${MONGODB_URI}${DATABASE_NAME}?retryWrites=true&w=majority`;
    console.log('Connection String:', connectionString);
    
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('Connection details:', {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState
    });
    
    await mongoose.connection.close();
    console.log('🔒 Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Connection failed with detailed error:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
  }
}

testConnection();
