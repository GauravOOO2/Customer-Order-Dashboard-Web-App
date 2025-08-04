// data-loader.js
const { MongoClient } = require('mongodb');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// MongoDB connection details
const MONGODB_URI = 'mongodb+srv://gauravking918:HAx9nvI81aYkPnEP@customer-order-dashboar.g0hbgrq.mongodb.net/';
const DATABASE_NAME = 'company_db';

class DataLoader {
    constructor() {
        this.client = null;
        this.db = null;
    }

    // Connect to MongoDB
    async connect() {
        try {
            console.log('🔌 Connecting to MongoDB...');
            this.client = new MongoClient(MONGODB_URI);
            await this.client.connect();
            this.db = this.client.db(DATABASE_NAME);
            console.log('✅ Connected to MongoDB successfully!');
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error);
            throw error;
        }
    }

    // Close MongoDB connection
    async close() {
        if (this.client) {
            await this.client.close();
            console.log('🔒 MongoDB connection closed');
        }
    }

    // Read and parse CSV file
    async readCSV(filePath) {
        return new Promise((resolve, reject) => {
            const results = [];
            
            if (!fs.existsSync(filePath)) {
                reject(new Error(`File not found: ${filePath}`));
                return;
            }

            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => {
                    results.push(data);
                })
                .on('end', () => {
                    console.log(`📄 Successfully read ${results.length} records from ${path.basename(filePath)}`);
                    resolve(results);
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }

    // Transform users data
    transformUserData(userData) {
        return userData.map(user => ({
            user_id: parseInt(user.id),
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            age: parseInt(user.age),
            gender: user.gender,
            location: {
                state: user.state,
                street_address: user.street_address,
                postal_code: user.postal_code,
                city: user.city,
                country: user.country,
                coordinates: {
                    latitude: parseFloat(user.latitude),
                    longitude: parseFloat(user.longitude)
                }
            },
            traffic_source: user.traffic_source,
            created_at: new Date(user.created_at)
        }));
    }

    // Transform orders data
    transformOrderData(orderData) {
        return orderData.map(order => ({
            order_id: parseInt(order.order_id),
            user_id: parseInt(order.user_id),
            status: order.status,
            gender: order.gender,
            created_at: order.created_at ? new Date(order.created_at) : null,
            returned_at: order.returned_at ? new Date(order.returned_at) : null,
            shipped_at: order.shipped_at ? new Date(order.shipped_at) : null,
            delivered_at: order.delivered_at ? new Date(order.delivered_at) : null,
            num_of_item: parseInt(order.num_of_item) || 0
        }));
    }

    // Load users data
    async loadUsers() {
        try {
            console.log('\n👥 Loading Users Data...');
            
            // Read CSV
            const usersPath = path.join(__dirname, 'assets', 'users.csv');
            const rawUserData = await this.readCSV(usersPath);
            
            // Transform data
            const transformedUsers = this.transformUserData(rawUserData);
            console.log(`🔄 Transformed ${transformedUsers.length} user records`);
            
            // Clear existing data (optional)
            const usersCollection = this.db.collection('users');
            await usersCollection.deleteMany({});
            console.log('🗑️  Cleared existing users data');
            
            // Insert new data
            const result = await usersCollection.insertMany(transformedUsers);
            console.log(`✅ Successfully inserted ${result.insertedCount} users`);
            
            return result;
        } catch (error) {
            console.error('❌ Error loading users:', error);
            throw error;
        }
    }

    // Load orders data
    async loadOrders() {
        try {
            console.log('\n📦 Loading Orders Data...');
            
            // Read CSV
            const ordersPath = path.join(__dirname, 'assets', 'orders.csv');
            const rawOrderData = await this.readCSV(ordersPath);
            
            // Transform data
            const transformedOrders = this.transformOrderData(rawOrderData);
            console.log(`🔄 Transformed ${transformedOrders.length} order records`);
            
            // Clear existing data (optional)
            const ordersCollection = this.db.collection('orders');
            await ordersCollection.deleteMany({});
            console.log('🗑️  Cleared existing orders data');
            
            // Insert new data
            const result = await ordersCollection.insertMany(transformedOrders);
            console.log(`✅ Successfully inserted ${result.insertedCount} orders`);
            
            return result;
        } catch (error) {
            console.error('❌ Error loading orders:', error);
            throw error;
        }
    }

    // Create indexes for better performance
    async createIndexes() {
        try {
            console.log('\n🔍 Creating database indexes...');
            
            const usersCollection = this.db.collection('users');
            const ordersCollection = this.db.collection('orders');
            
            // Users indexes
            await usersCollection.createIndex({ user_id: 1 }, { unique: true });
            await usersCollection.createIndex({ email: 1 });
            await usersCollection.createIndex({ 'location.state': 1 });
            await usersCollection.createIndex({ created_at: 1 });
            
            // Orders indexes
            await ordersCollection.createIndex({ order_id: 1 }, { unique: true });
            await ordersCollection.createIndex({ user_id: 1 });
            await ordersCollection.createIndex({ status: 1 });
            await ordersCollection.createIndex({ created_at: 1 });
            
            console.log('✅ Indexes created successfully');
        } catch (error) {
            console.error('❌ Error creating indexes:', error);
        }
    }

    // Validate data integrity
    async validateData() {
        try {
            console.log('\n🔍 Validating data integrity...');
            
            const usersCollection = this.db.collection('users');
            const ordersCollection = this.db.collection('orders');
            
            // Count documents
            const usersCount = await usersCollection.countDocuments();
            const ordersCount = await ordersCollection.countDocuments();
            
            console.log(`📊 Users in database: ${usersCount}`);
            console.log(`📊 Orders in database: ${ordersCount}`);
            
            // Check for orphaned orders (orders without valid users)
            const orphanedOrders = await ordersCollection.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: 'user_id',
                        as: 'user'
                    }
                },
                {
                    $match: { user: { $size: 0 } }
                },
                {
                    $count: 'orphaned_count'
                }
            ]).toArray();
            
            const orphanedCount = orphanedOrders.length > 0 ? orphanedOrders[0].orphaned_count : 0;
            console.log(`⚠️  Orphaned orders (no matching user): ${orphanedCount}`);
            
            return {
                usersCount,
                ordersCount,
                orphanedCount
            };
        } catch (error) {
            console.error('❌ Error validating data:', error);
        }
    }

    // Main execution method
    async loadAllData() {
        try {
            await this.connect();
            
            // Load data
            await this.loadUsers();
            await this.loadOrders();
            
            // Create indexes
            await this.createIndexes();
            
            // Validate data
            await this.validateData();
            
            console.log('\n🎉 Data loading completed successfully!');
            
        } catch (error) {
            console.error('💥 Data loading failed:', error);
        } finally {
            await this.close();
        }
    }
}

// Execute the data loader
async function main() {
    console.log('🚀 Starting CSV to MongoDB Data Loader...\n');
    
    const loader = new DataLoader();
    await loader.loadAllData();
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = DataLoader;