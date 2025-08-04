# Customer Order Dashboard - Backend API

A professional Node.js/Express backend API for the Customer Order Dashboard application, following industry-standard architecture and best practices.

## 🚀 Features

### ✅ **Customer Management**
- **List All Customers** - Paginated list with search and filtering
- **Customer Details** - Complete profile with order statistics
- **Advanced Search** - Complex filtering with multiple criteria
- **Customer Analytics** - Demographics and behavior insights

### 🔍 **Advanced Filtering & Search**
- **Text Search**: Name, email search
- **Location Filters**: State, city, country
- **Demographics**: Age range, gender
- **Behavior**: Traffic source, registration date
- **Sorting**: Multiple fields with asc/desc order

### 📊 **Analytics & Statistics**
- Customer demographics breakdown
- Registration trends by period
- Geographic distribution
- Traffic source analysis
- Customer lifetime value metrics

## 🏗️ **Architecture**

```
📁 Backend Architecture
├── 🎯 Controllers     → Request handling & response formatting
├── 📊 Models          → Database schemas & business logic
├── 🛣️  Routes         → API endpoint definitions
├── 🔧 Middleware      → Authentication, validation, error handling
├── ⚙️  Utils          → Helpers, pagination, logging
└── 🗃️  Config         → Database, environment, app settings
```

## 📋 **API Endpoints**

### **Customer Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/customers` | List all customers with pagination & filters |
| `GET` | `/api/v1/customers/:id` | Get specific customer details |
| `GET` | `/api/v1/customers/stats` | Customer analytics & statistics |
| `POST` | `/api/v1/customers/search` | Advanced customer search |

### **System Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/` | API documentation |

## 🚀 **Quick Start**

### **1. Installation**
```bash
# Clone and setup
git clone <repository>
cd backend
npm install

# Setup environment
cp .env.example .env
# Edit .env with your MongoDB credentials
```

### **2. Environment Setup**
```env
# Required variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
DATABASE_NAME=company_db
PORT=5000

# Optional configurations
NODE_ENV=development
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
```

### **3. Load Sample Data**
```bash
# Load CSV data into MongoDB
npm run load-data

# Verify data loading
npm run verify-data
```

### **4. Start Server**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

### **5. Test API**
```bash
# Health check
curl http://localhost:5000/health

# Get customers
curl http://localhost:5000/api/v1/customers

# Get customer details
curl http://localhost:5000/api/v1/customers/123
```

## 📖 **API Usage Examples**

### **List Customers with Filters**
```bash
GET /api/v1/customers?page=1&limit=20&search=john&state=California&gender=M&sort_by=created_at&sort_order=desc
```

### **Advanced Customer Search**
```bash
POST /api/v1/customers/search
Content-Type: application/json

{
  "query": "john doe",
  "filters": {
    "states": ["California", "Texas"],
    "age_range": { "min": 25, "max": 45 },
    "genders": ["M"],
    "traffic_sources": ["Search", "Email"]
  },
  "sort": { "field": "created_at", "order": "desc" },
  "page": 1,
  "limit": 20
}
```

### **Customer Details with Orders**
```bash
GET /api/v1/customers/123?include_orders=true&orders_limit=5
```

## 📊 **Response Format**

### **Success Response**
```json
{
  "status": "success",
  "message": "Customers retrieved successfully",
  "data": {
    "customers": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "page_size": 20,
      "total_count": 200,
      "has_next_page": true,
      "has_prev_page": false
    }
  }
}
```

### **Error Response**
```json
{
  "status": "error",
  "code": 400,
  "message": "Validation Error",
  "errors": [
    {
      "field": "age",
      "message": "Age must be between 0 and 150"
    }
  ],
  "timestamp": "2025-08-04T10:30:00.000Z"
}
```

## 🔍 **Available Filters**

### **Customer List Filters**
- `search` - Name or email search
- `state` - Customer state/province
- `city` - Customer city
- `country` - Customer country
- `gender` - M, F, Other
- `traffic_source` - Search, Email, Social, Direct, Referral, Paid
- `min_age` / `max_age` - Age range
- `sort_by` - created_at, first_name, last_name, email, age
- `sort_order` - asc, desc

### **Pagination Parameters**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

## 🗃️ **Database Schema**

### **Users Collection**
```javascript
{
  user_id: Number,           // Unique identifier
  first_name: String,        // Customer first name
  last_name: String,         // Customer last name
  email: String,             // Email address
  age: Number,               // Customer age
  gender: String,            // M, F, Other
  location: {
    state: String,
    city: String,
    country: String,
    street_address: String,
    postal_code: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  traffic_source: String,    // Acquisition channel
  created_at: Date          // Registration date
}
```

### **Orders Collection**
```javascript
{
  order_id: Number,         // Unique order identifier
  user_id: Number,          // Reference to user
  status: String,           // Order status
  created_at: Date,         // Order date
  shipped_at: Date,         // Ship date
  delivered_at: Date,       // Delivery date
  num_of_item: Number,      // Item quantity
  total_amount: Number      // Order value
}
```

## 🛠️ **Development**

### **Project Structure**
```
src/
├── app.js              # Express app setup
├── server.js           # Server entry point
├── config/             # Configuration files
├── controllers/        # Request handlers
├── models/             # Database models
├── routes/             # API routes
├── middleware/         # Custom middleware
└── utils/              # Utility functions
```

### **Key Dependencies**
- **Express** - Web framework
- **Mongoose** - MongoDB ODM
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **compression** - Response compression
- **morgan** - HTTP request logging

### **Scripts**
```bash
npm run dev          # Development server with auto-reload
npm start            # Production server
npm run load-data    # Load CSV data to MongoDB
npm run verify-data  # Verify data integrity
npm test             # Run tests (future)
npm run lint         # Code linting (future)
```

## 🔒 **Security Features**

- ✅ **Input Validation** - express-validator for all endpoints
- ✅ **Rate Limiting** - Prevent API abuse
- ✅ **Security Headers** - Helmet.js security middleware
- ✅ **CORS Configuration** - Controlled cross-origin access
- ✅ **Environment Variables** - Secure configuration management
- ✅ **Error Handling** - No sensitive information leakage

## 📈 **Performance Optimizations**

- ✅ **Database Indexing** - Optimized queries for common searches
- ✅ **Pagination** - Efficient handling of large datasets
- ✅ **Aggregation Pipelines** - Complex queries with MongoDB aggregation
- ✅ **Connection Pooling** - MongoDB connection optimization
- ✅ **Response Compression** - Gzip compression for all responses

## 🧪 **Testing**

### **Manual Testing**
```bash
# Test health endpoint
curl http://localhost:5000/health

# Test customer list
curl "http://localhost:5000/api/v1/customers?page=1&limit=5"

# Test customer details
curl http://localhost:5000/api/v1/customers/457

# Test customer stats
curl http://localhost:5000/api/v1/customers/stats
```

## 🚀 **Deployment**

### **Environment Variables for Production**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://prod-user:password@prod-cluster.mongodb.net/
PORT=5000
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=warn
```

### **PM2 Deployment (Recommended)**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/server.js --name "customer-dashboard-api"

# Monitor
pm2 status
pm2 logs customer-dashboard-api
```

## 📝 **