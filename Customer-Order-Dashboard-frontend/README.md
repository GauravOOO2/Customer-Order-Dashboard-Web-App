# Customer Order Dashboard - Frontend

A modern, responsive React application for managing and analyzing customer data with advanced filtering, search, and visualization capabilities.

## 🚀 Features

### ✅ **Customer Management Dashboard**
- **Customer List View** - Paginated table with comprehensive customer information
- **Advanced Search** - Search by name, email with real-time filtering
- **Customer Summary** - Detailed customer profiles with order statistics
- **Interactive UI** - Click on customers to view detailed information

### 🔍 **Search & Filtering**
- **Text Search** - Search customers by name or email
- **Advanced Filters** - Filter by gender, traffic source, age range
- **Sorting Options** - Sort by registration date, name, email, age
- **Real-time Results** - Instant search results as you type

### 📊 **Analytics Dashboard**
- **Customer Statistics** - Total customers, average age, gender breakdown
- **Traffic Source Analysis** - Top acquisition channels
- **Order Analytics** - Total orders and customer engagement metrics
- **Real-time Updates** - Live data from your backend API

### 🎨 **Professional Design**
- **Modern UI** - Clean, professional interface using Tailwind CSS
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Loading States** - Smooth loading animations and error handling
- **Accessibility** - WCAG compliant with proper focus management

## 🛠️ **Technology Stack**

- **React 19** - Latest React with modern features
- **TypeScript 5.8** - Full type safety and excellent developer experience
- **Vite 7** - Lightning-fast development and building
- **Tailwind CSS v4** - Utility-first CSS framework
- **Modern ES2022** - Latest JavaScript features

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 16+ 
- NPM or Yarn
- Backend API running (default: http://localhost:5000)

### **Installation**
```bash
# Clone and navigate
cd Customer-Order-Dashboard-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your API URL
VITE_API_BASE_URL=http://localhost:5000
```

### **Development**
```bash
# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit

# Lint code
npm run lint
```

## 📁 **Project Structure**

```
src/
├── components/           # React components
│   ├── Dashboard.tsx     # Main dashboard container
│   ├── SearchBar.tsx     # Search and filtering UI
│   ├── CustomerTable.tsx # Customer data table
│   ├── Pagination.tsx    # Pagination controls
│   └── DashboardStats.tsx # Analytics cards
├── hooks/               # Custom React hooks
│   ├── useCustomers.ts  # Customer data fetching
│   └── useCustomerDetail.ts # Individual customer details
├── services/            # API services
│   └── api.ts          # Backend API integration
├── types/              # TypeScript type definitions
│   └── index.ts        # All application types
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles + Tailwind
```

## 🔗 **API Integration**

The frontend integrates with your Node.js backend API with the following endpoints:

### **Customer Endpoints**
- `GET /api/v1/customers` - List customers with pagination & filters
- `GET /api/v1/customers/:id` - Get customer details
- `GET /api/v1/customers/stats` - Customer analytics
- `POST /api/v1/customers/search` - Advanced search

### **Configuration**
API base URL is configurable via environment variables:
```typescript
// Automatically reads from .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
```

## 🎯 **Key Components**

### **Dashboard**
- Main application container
- Manages global state and API calls
- Coordinates all child components

### **SearchBar**
- Text search input with real-time filtering
- Advanced filter dropdowns (gender, traffic source, sorting)
- Clear and search actions

### **CustomerTable**
- Responsive data table with customer information
- Click-to-view customer details
- Loading states and empty state handling
- Professional styling with badges and icons

### **Pagination**
- Full pagination controls with page numbers
- Previous/Next navigation
- Results summary display
- Mobile-responsive design

### **DashboardStats**
- Analytics cards showing key metrics
- Real-time calculations from current data
- Visual icons and professional styling

## 🎨 **Styling & Design**

### **Tailwind CSS v4**
- Modern utility-first approach
- Custom color palette with professional blues and grays
- Responsive design breakpoints
- Hover and focus states

### **Design System**
- **Colors**: Blue primary, gray neutrals, semantic colors
- **Typography**: System font stack for optimal readability
- **Spacing**: Consistent 4px grid system
- **Shadows**: Subtle elevation with modern shadow styles

### **Components**
- **Cards**: Clean white backgrounds with subtle borders
- **Tables**: Zebra striping with hover effects
- **Buttons**: Consistent styling with disabled states
- **Forms**: Proper focus styles and validation feedback

## 🔧 **Configuration**

### **Environment Variables**
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000
VITE_NODE_ENV=development
VITE_DEBUG_API=true
```

### **TypeScript Configuration**
- **Strict mode** enabled for maximum type safety
- **Project references** for optimal build performance
- **Modern ES2022** target with full library support

### **Vite Configuration**
- React plugin for JSX support
- Tailwind CSS plugin for optimal CSS processing
- Fast refresh for instant development feedback

## 🚀 **Deployment**

### **Production Build**
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### **Environment Setup**
```env
# Production environment
VITE_API_BASE_URL=https://your-api-domain.com
VITE_NODE_ENV=production
VITE_DEBUG_API=false
```

### **Deploy Options**
- **Vercel**: Zero-config deployment with automatic HTTPS
- **Netlify**: Simple drag-and-drop or Git integration
- **AWS S3 + CloudFront**: Enterprise-level hosting
- **Traditional hosting**: Upload `dist/` folder contents

## 🎯 **Features Implemented**

✅ **Customer List View** - Comprehensive table with all customer data  
✅ **Search Functionality** - Real-time search by name and email  
✅ **Customer Summary** - Detailed customer information and order counts  
✅ **API Integration** - Full integration with backend customer endpoints  
✅ **Professional Styling** - Modern, appealing design with Tailwind CSS  
✅ **Responsive Design** - Works on all device sizes  
✅ **Error Handling** - Graceful error states and loading indicators  
✅ **TypeScript** - Full type safety throughout the application  
✅ **Performance Optimized** - Efficient rendering and API calls  

## 📈 **Performance Features**

- **Optimized Bundle** - Tree-shaking and code splitting
- **Efficient Rendering** - React 19 with optimized re-renders
- **API Optimization** - Debounced search and pagination
- **Loading States** - Skeleton screens and smooth transitions
- **Error Boundaries** - Graceful error handling

## 🔍 **Development Tips**

### **API Testing**
Make sure your backend is running on `http://localhost:5000` before starting the frontend.

### **Type Safety**
All API responses and component props are fully typed. The TypeScript compiler will catch any type mismatches.

### **Styling**
Use Tailwind utility classes for consistent styling. Custom CSS should be minimal and placed in component files when needed.

### **State Management**
The application uses React hooks for state management. Consider adding React Query or SWR for more advanced data fetching needs.

## 📞 **Support**

The application is designed to work seamlessly with your Customer Order Dashboard backend. Ensure both services are running for full functionality.

**Default Ports:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
