// src/pages/Analytics.tsx
import React from 'react';
import { BarChart3, Construction } from 'lucide-react';

const Analytics: React.FC = () => {
  return (
    <div className="text-center py-12">
      <Construction className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
      <p className="text-gray-500 mb-6">
        Advanced analytics and reporting features are coming soon.
        <br />
        For now, you can see basic statistics on the dashboard and customer pages.
      </p>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-w-md mx-auto">
        <div className="flex items-center">
          <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
          <span className="text-sm text-purple-700">
            Customer and Order statistics are available via the APIs!
          </span>
        </div>
      </div>
    </div>
  );
};

export default Analytics;