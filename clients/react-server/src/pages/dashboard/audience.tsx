import { JSX } from 'react';
import MainLayout from '@/layouts/main';

/**
 * Audience dashboard page component.
 * Displays audience demographics and engagement data.
 *
 * @returns {JSX.Element} The audience dashboard page
 */
const Audience = (): JSX.Element => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Audience</h1>
          <p className="mt-2 text-gray-600">Understand your audience and demographics</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Demographics</h3>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm text-gray-600">18-24</span>
                  <span className="text-sm text-gray-600">35%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: '35%' }}></div>
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm text-gray-600">25-34</span>
                  <span className="text-sm text-gray-600">42%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: '42%' }}></div>
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm text-gray-600">35-44</span>
                  <span className="text-sm text-gray-600">23%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: '23%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Top Locations</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">United States</span>
                <span className="text-sm text-gray-600">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">United Kingdom</span>
                <span className="text-sm text-gray-600">18%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Canada</span>
                <span className="text-sm text-gray-600">12%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Australia</span>
                <span className="text-sm text-gray-600">8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Germany</span>
                <span className="text-sm text-gray-600">7%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Audience Growth</h3>
          <p className="text-gray-600">
            Growth charts and audience insights will be displayed here.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Audience;
