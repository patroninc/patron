import { JSX } from 'react';
import MainLayout from '@/layouts/main';

/**
 * Payouts dashboard page component.
 * Displays earnings and payout information for creators.
 *
 * @returns {JSX.Element} The payouts dashboard page
 */
const Payouts = (): JSX.Element => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payouts</h1>
          <p className="mt-2 text-gray-600">Manage your earnings and payouts</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-lg font-semibold">Available Balance</h3>
            <p className="text-3xl font-bold text-green-600">$1,234.56</p>
            <p className="text-sm text-gray-600">Ready for payout</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-lg font-semibold">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">$456.78</p>
            <p className="text-sm text-gray-600">Processing</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-lg font-semibold">Total Earned</h3>
            <p className="text-3xl font-bold text-blue-600">$12,345.67</p>
            <p className="text-sm text-gray-600">All time</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Recent Payouts</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 py-2">
                <div>
                  <p className="font-medium">$1,234.56</p>
                  <p className="text-sm text-gray-600">Dec 15, 2024</p>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                  Completed
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200 py-2">
                <div>
                  <p className="font-medium">$987.65</p>
                  <p className="text-sm text-gray-600">Nov 15, 2024</p>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                  Completed
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200 py-2">
                <div>
                  <p className="font-medium">$456.78</p>
                  <p className="text-sm text-gray-600">Oct 15, 2024</p>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                  Completed
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Payout Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <p className="text-gray-600">Bank Account ending in ****1234</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Payout Schedule
                </label>
                <p className="text-gray-600">Monthly (15th of each month)</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Minimum Payout
                </label>
                <p className="text-gray-600">$50.00</p>
              </div>

              <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                Update Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Payouts;
