import { JSX } from 'react';
import MainLayout from '@/layouts/main';

/**
 * Insights dashboard page component.
 * Displays analytics and performance metrics for creators.
 *
 * @returns {JSX.Element} The insights dashboard page
 */
const Insights = (): JSX.Element => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Insights</h1>
          <p className="mt-2 text-gray-600">Analytics and performance metrics</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-lg font-semibold">Total Views</h3>
            <p className="text-3xl font-bold text-blue-600">12,345</p>
            <p className="text-sm text-gray-600">+12% from last month</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-lg font-semibold">Engagement</h3>
            <p className="text-3xl font-bold text-green-600">8.5%</p>
            <p className="text-sm text-gray-600">+2.1% from last month</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-lg font-semibold">Subscribers</h3>
            <p className="text-3xl font-bold text-purple-600">1,234</p>
            <p className="text-sm text-gray-600">+45 this month</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-lg font-semibold">Revenue</h3>
            <p className="text-3xl font-bold text-orange-600">$2,456</p>
            <p className="text-sm text-gray-600">+18% from last month</p>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Performance Overview</h3>
          <p className="text-gray-600">
            Detailed analytics charts and metrics will be displayed here.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Insights;
