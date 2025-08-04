// src/pages/Orders.tsx
import React from 'react';
import { ShoppingCart, Construction } from 'lucide-react';

const Orders: React.FC = () => {
  return (
    <div className="text-center py-12">
      <Construction className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Orders Page</h3>
      <p className="text-gray-500 mb-6">
        The orders management interface is coming soon. 
        <br />
        For now, you can view customer details and their orders from the customers page.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
        <div className="flex items-center">
          <ShoppingCart className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-sm text-blue-700">
            Orders API is ready and working! Check customer details to see their orders.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Orders;