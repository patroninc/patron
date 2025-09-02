import { useAuth } from '../contexts/AuthContext';

/**
 * User profile component that displays user information and account actions.
 *
 * @returns {JSX.Element | null} The user profile component or null if no user
 */
export default function UserProfile(): JSX.Element | null {
  const { user, logout } = useAuth();

  /**
   * Handles user logout.
   *
   * @returns {Promise<void>} Promise that resolves when logout is complete
   */
  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
          {/* Header */}
          <div className="bg-blue px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
                <p className="mt-2 text-blue-100">Manage your account and preferences</p>
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="px-6 py-8">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Profile Information</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">User ID</label>
                  <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900">
                    {user.id}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Display Name
                  </label>
                  <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900">
                    {user.name}
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900">
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-8">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Account Status</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-white p-4 shadow">
                <div className="flex items-center">
                  <div className="rounded-lg bg-green-100 p-2">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Account Active</h3>
                    <p className="text-gray-600">Your account is verified and active</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-4 shadow">
                <div className="flex items-center">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Profile Complete</h3>
                    <p className="text-gray-600">All required info provided</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-4 shadow">
                <div className="flex items-center">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Secure</h3>
                    <p className="text-gray-600">Account security is enabled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 px-6 py-8">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Account Actions</h2>
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={handleLogout}
                className="button-animated-bg rounded-md bg-red-600 px-6 py-3 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
              >
                Sign Out
              </button>
              <button className="rounded-md bg-gray-200 px-6 py-3 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
