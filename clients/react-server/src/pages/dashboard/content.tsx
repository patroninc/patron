import { JSX } from 'react';
import MainLayout from '@/layouts/main';

/**
 * Content dashboard page component.
 * Displays content management interface for creators.
 *
 * @returns {JSX.Element} The content dashboard page
 */
const Content = (): JSX.Element => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content</h1>
          <p className="mt-2 text-gray-600">Manage your content and posts</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-lg font-semibold">Recent Posts</h3>
            <p className="text-gray-600">View and manage your recent content</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-lg font-semibold">Drafts</h3>
            <p className="text-gray-600">Work on your content drafts</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-lg font-semibold">Scheduled</h3>
            <p className="text-gray-600">Manage scheduled content</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Content;
