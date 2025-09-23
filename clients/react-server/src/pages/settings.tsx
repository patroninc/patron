import { JSX, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, Save, Camera } from 'lucide-react';
import MainLayout from '@/layouts/main';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { patronClient } from '@/lib/utils';
import PxBorder from '@/components/px-border';

// Validation schemas
const profileSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  bannerUrl: z.string().url().optional().or(z.literal('')),
});

const accountSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    },
  );

const preferencesSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  profileVisibility: z.enum(['public', 'private']),
  showEmail: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type AccountFormData = z.infer<typeof accountSchema>;
type PreferencesFormData = z.infer<typeof preferencesSchema>;

/**
 * Settings page component with multiple sections for user preferences and account management.
 *
 * @returns {JSX.Element} The settings page
 */
const Settings = (): JSX.Element => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      description: '', // TODO: Add description field to UserInfo type
      avatarUrl: user?.avatarUrl || '',
      bannerUrl: '', // TODO: Add bannerUrl field to UserInfo type
    },
  });

  // Account form
  const accountForm = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Preferences form
  const preferencesForm = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      profileVisibility: 'public',
      showEmail: false,
    },
  });

  /**
   * Handles profile form submission.
   *
   * @param data - The profile form data
   */
  const onProfileSubmit = async (data: ProfileFormData): Promise<void> => {
    setIsLoading(true);
    try {
      await patronClient.auth.updateUserInfo({
        displayName: data.displayName,
        avatarUrl: data.avatarUrl || undefined,
        description: data.description || undefined,
      });
      // TODO: Show success message
      // TODO: Handle bannerUrl update when backend supports it
    } catch (error) {
      console.error('Error updating profile:', error);
      // TODO: Show error message
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles account form submission.
   *
   * @param data - The account form data
   */
  const onAccountSubmit = async (data: AccountFormData): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: Implement email and password update API calls
      console.log('Account update requested:', data);
      // TODO: Show success message
    } catch (error) {
      console.error('Error updating account:', error);
      // TODO: Show error message
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles preferences form submission.
   *
   * @param data - The preferences form data
   */
  const onPreferencesSubmit = async (data: PreferencesFormData): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: Implement preferences update API call
      console.log('Preferences updated:', data);
      // TODO: Show success message
    } catch (error) {
      console.error('Error updating preferences:', error);
      // TODO: Show error message
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles account deletion.
   */
  const handleDeleteAccount = async (): Promise<void> => {
    try {
      // TODO: Implement account deletion API call
      console.log('Account deletion requested');
    } catch (error) {
      console.error('Error deleting account:', error);
      // TODO: Show error message
    }
  };

  return (
    <MainLayout>
      <div className="p-[50px] px-[100px]">
        <h1 className="mb-10 text-5xl">Settings</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            {/* <TabsTrigger value="preferences">Preferences</TabsTrigger> */}
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <div className="bg-secondary-primary relative p-6">
              <PxBorder width={3} radius="lg" />
              <h2 className="mb-6 text-2xl font-bold">Profile Settings</h2>
              <Form {...profileForm}>
                <form
                  onSubmit={(e) => void profileForm.handleSubmit(onProfileSubmit)(e)}
                  className="space-y-6"
                >
                  {/* <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Banner Image</h3>
                      <p className="text-sm text-gray-600">
                        Upload a banner image for your profile
                      </p>
                    </div>
                    <div className="relative h-32 w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                      {user?.bannerUrl ? (
                        <img
                          src={user.bannerUrl}
                          alt="Banner preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <p className="text-sm text-gray-500">No banner image</p>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      shadow={false}
                      onClick={() => document.getElementById('banner-upload')?.click()}
                    >
                      Upload Banner
                    </Button>
                    <input
                      id="banner-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // TODO: Handle banner upload
                          console.log('Banner file selected:', file);
                        }
                      }}
                    />
                  </div> */}

                  {/* Avatar Section */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">Profile Picture</h3>
                    </div>
                    <div className="flex items-center gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage
                          src={user?.avatarUrl || undefined}
                          alt={user?.displayName || undefined}
                        />
                        <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      shadow={false}
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      Upload Avatar
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // TODO: Handle avatar upload
                          console.log('Avatar file selected:', file);
                        }
                      }}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem className="max-w-[400px]">
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your display name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="max-w-[400px]">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Tell us about yourself..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                    containerClassName="w-full max-w-[400px]"
                  >
                    {isLoading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <div className="bg-secondary-primary relative p-6">
              <PxBorder width={3} radius="lg" />
              <h2 className="mb-6 text-2xl font-bold">Account Settings</h2>
              <Form {...accountForm}>
                <form
                  onSubmit={(e) => void accountForm.handleSubmit(onAccountSubmit)(e)}
                  className="space-y-6"
                >
                  <FormField
                    control={accountForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="max-w-[400px]">
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Change Password</h3>
                    <FormField
                      control={accountForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem className="max-w-[400px]">
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter current password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={accountForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem className="max-w-[400px]">
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter new password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={accountForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem className="max-w-[400px]">
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm new password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                    containerClassName="w-full max-w-[400px]"
                  >
                    {isLoading ? 'Updating...' : 'Update Account'}
                    <Save className="ml-2 size-4" />
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>

          {/* <TabsContent value="preferences" className="space-y-6">
            <div className="bg-secondary-primary relative p-6">
              <PxBorder width={3} radius="lg" />
              <h2 className="mb-6 text-2xl font-bold">Preferences</h2>
              <Form {...preferencesForm}>
                <form
                  onSubmit={(e) => void preferencesForm.handleSubmit(onPreferencesSubmit)(e)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Notifications</h3>
                    <FormField
                      control={preferencesForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Email Notifications</FormLabel>
                            <div className="text-muted-foreground text-sm">
                              Receive email notifications for important updates
                            </div>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preferencesForm.control}
                      name="pushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Push Notifications</FormLabel>
                            <div className="text-muted-foreground text-sm">
                              Receive push notifications in your browser
                            </div>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preferencesForm.control}
                      name="marketingEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Marketing Emails</FormLabel>
                            <div className="text-muted-foreground text-sm">
                              Receive promotional emails and updates
                            </div>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Privacy</h3>
                    <FormField
                      control={preferencesForm.control}
                      name="profileVisibility"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Visibility</FormLabel>
                          <FormControl>
                            <select
                              className="w-full rounded-md border border-gray-300 px-3 py-2"
                              {...field}
                            >
                              <option value="public">Public</option>
                              <option value="private">Private</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={preferencesForm.control}
                      name="showEmail"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Show Email</FormLabel>
                            <div className="text-muted-foreground text-sm">
                              Display your email address on your profile
                            </div>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? 'Saving...' : 'Save Preferences'}
                    <Save className="ml-2 size-4" />
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent> */}

          {/* Danger Zone */}
          <TabsContent value="danger" className="space-y-6">
            <div className="bg-secondary-primary relative p-6">
              <PxBorder width={3} radius="lg" />
              <h2 className="mb-5 text-2xl">Danger Zone</h2>
              <div className="space-y-6">
                <h3 className="mb-2 text-lg">Delete Account</h3>
                <p className="mb-4 text-sm">
                  Permanently delete your account and all associated data. This action cannot be
                  undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" containerClassName="w-max">
                      Delete Account
                      <Trash2 />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-left">
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-left">
                        This action cannot be undone. This will permanently delete your account and
                        remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex items-center">
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <Button shadow={false} variant="destructive" onClick={handleDeleteAccount}>
                        Yes, delete my account
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
