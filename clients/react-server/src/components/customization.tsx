/* eslint-disable max-params */
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Check, Settings, Upload } from 'lucide-react';
import { JSX } from 'react';

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
import { cn, patronClient } from '@/lib/utils';
import PxBorder from './px-border';
import { UserInfo } from 'patronts/models';
// Validation schema
const customizationSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be less than 50 characters'),
  description: z.string().max(100, 'Description must be less than 100 characters').optional(),
  profilePicture: z.string().url().optional().or(z.literal('')),
  banner: z.string().url().optional().or(z.literal('')),
});

type CustomizationFormData = z.infer<typeof customizationSchema>;

/**
 * Props for the Customization component.
 */
interface CustomizationProps {
  initialData?: UserInfo;
}

// Default banners
const defaultBanners = [
  { class: 'bg-background', name: 'Background' },
  { class: 'bg-secondary-primary', name: 'Secondary' },
  { class: 'bg-accent', name: 'Accent' },
];

/**
 * Props for the AvatarSelector component.
 */
interface AvatarSelectorProps {
  currentAvatar?: string;
  // eslint-disable-next-line no-unused-vars
  onSelect: (selectedAvatar: string, file?: File) => void;
  onClose: () => void;
}

/**
 * Avatar selector component that allows users to choose from default avatars or upload their own.
 *
 * @param props - The component props
 * @param props.currentAvatar - The currently selected avatar URL
 * @param props.onSelect - Callback function when an avatar is selected
 * @param props.onClose - Callback function to close the selector
 * @returns The avatar selector component
 */
const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  currentAvatar,
  onSelect,
  onClose,
}): JSX.Element => {
  const [selectedAvatar, setSelectedAvatar] = React.useState(currentAvatar || '');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Handles file upload for custom avatar.
   *
   * @param event - The file input change event
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handles saving the selected avatar.
   */
  const handleSave = (): void => {
    onSelect(selectedAvatar, selectedFile || undefined);
    onClose();
  };

  return (
    <div className="space-y-4">
      {/* Current Selection Preview */}
      {selectedAvatar && (
        <div className="flex justify-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src={selectedAvatar} alt="Selected avatar" />
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Upload Option */}
      <div className="flex flex-col items-center gap-2">
        <Button shadow={false} variant="secondary" onClick={() => fileInputRef.current?.click()}>
          <Upload />
          Upload Custom Image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Default Avatars */}
      {/* <div className="space-y-2">
        <h4 className="my-5 text-center text-sm font-bold">or pick a default avatar</h4>
        <div className="grid grid-cols-4 gap-2">
          {defaultAvatars.map((avatarUrl, index) => (
            <Button
              key={index}
              aria-active={selectedAvatar === avatarUrl}
              shadow={false}
              onClick={() => setSelectedAvatar(avatarUrl)}
              className="relative h-[104px] items-end justify-end p-0 px-2 py-2"
              style={{
                backgroundImage: `url(${avatarUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {selectedAvatar === avatarUrl && (
                <div className="bg-primary relative flex size-4 items-center justify-center">
                  <Check className="size-4 text-white" />
                  <PxBorder width={2} radius="md" />
                </div>
              )}
            </Button>
          ))}
        </div>
      </div> */}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
};

/**
 * Props for the BannerSelector component.
 */
interface BannerSelectorProps {
  currentBanner?: string;
  // eslint-disable-next-line no-unused-vars
  onSelect: (selectedBanner: string) => void;
  onClose: () => void;
}

/**
 * Banner selector component that allows users to choose from default banners or upload their own.
 *
 * @param props - The component props
 * @param props.currentBanner - The currently selected banner URL
 * @param props.onSelect - Callback function when a banner is selected
 * @param props.onClose - Callback function to close the selector
 * @returns The banner selector component
 */
const BannerSelector: React.FC<BannerSelectorProps> = ({
  currentBanner,
  onSelect,
  onClose,
}): JSX.Element => {
  const [selectedBanner, setSelectedBanner] = React.useState(currentBanner || '');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Handles file upload for custom banner.
   *
   * @param event - The file input change event
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedBanner(result);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handles saving the selected banner.
   */
  const handleSave = (): void => {
    onSelect(selectedBanner);
    onClose();
  };

  return (
    <div className="space-y-4">
      {/* Current Selection Preview */}
      {selectedBanner && selectedBanner.startsWith('data:') && (
        <div className="flex justify-center">
          <div className="relative h-24 w-48 overflow-hidden">
            <img
              src={selectedBanner}
              alt="Selected banner"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Upload Option */}
      <div className="flex flex-col items-center gap-2">
        <Button shadow={false} variant="secondary" onClick={() => fileInputRef.current?.click()}>
          <Upload />
          Upload Custom Banner
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Default Banners */}
      <div className="space-y-2">
        <h4 className="my-5 text-center text-sm font-bold">or pick a default banner</h4>
        <div className="flex flex-col gap-2">
          {defaultBanners.map((banner, index) => (
            <Button
              key={index}
              aria-active={selectedBanner && selectedBanner.startsWith(banner.class)}
              shadow={false}
              onClick={() => setSelectedBanner(banner.class)}
              className={cn(
                'relative m-[3px] h-16 w-full items-end justify-end px-2 py-2',
                banner.class,
              )}
              title={banner.name}
            >
              {selectedBanner && selectedBanner.startsWith(banner.class) && (
                <div className="bg-primary relative flex size-4 items-center justify-center">
                  <Check className="size-4 text-white" />
                  <PxBorder width={2} radius="md" />
                </div>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
};

/**
 * Main customization component with alert dialog for profile editing.
 *
 * @param props - The component props
 * @param props.initialData - Initial form data
 * @returns The customization component
 */
const Customization: React.FC<CustomizationProps> = ({ initialData }): JSX.Element => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = React.useState(false);
  const [showBannerSelector, setShowBannerSelector] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);

  const form = useForm<CustomizationFormData>({
    resolver: zodResolver(customizationSchema),
    defaultValues: {
      displayName: initialData?.displayName || '',
      // description: initialData?.description || '',
      profilePicture: initialData?.avatarUrl || '',
      // banner: initialData?.banner || '',
    },
  });

  const watchedProfilePicture = form.watch('profilePicture');
  const watchedBanner = form.watch('banner');

  /**
   * Handles form submission.
   *
   * @param data - The form data
   */
  const onSubmit = async (data: CustomizationFormData): Promise<void> => {
    setIsLoading(true);

    try {
      // Upload file if one was selected
      if (uploadedFile) {
        try {
          const uploadedFileResult = await patronClient.files.uploadFile({
            file: uploadedFile,
          });
          const avatarUrl = await patronClient.files.serveFileCdn({
            fileId: uploadedFileResult.file.id,
          });

          const updateUserInfo = await patronClient.auth.updateUserInfo({
            avatarUrl: avatarUrl as unknown as string,
            displayName: data.displayName || undefined,
            description: data.description || undefined,
          });

          console.log('Update user info:', updateUserInfo);
          form.setValue('profilePicture', avatarUrl as unknown as string);
        } catch (avatarError) {
          console.error('Error uploading avatar:', avatarError);
          form.setError('profilePicture', {
            type: 'manual',
            message: 'Failed to upload avatar. Please try again.',
          });
          return; // Don't close the dialog if avatar upload fails
        }
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Error saving customization:', error);
      form.setError('root', {
        type: 'manual',
        message: 'Failed to save profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles avatar selection.
   *
   * @param avatar - The selected avatar URL
   * @param file - The uploaded file object
   */
  const handleAvatarSelect = (avatar: string, file?: File): void => {
    form.setValue('profilePicture', avatar);
    setUploadedFile(file || null);
    setShowAvatarSelector(false);
  };

  /**
   * Handles banner selection.
   *
   * @param banner - The selected banner URL
   */
  const handleBannerSelect = (banner: string): void => {
    form.setValue('banner', banner);
    setShowBannerSelector(false);
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button
            containerClassName="w-max absolute bottom-5 right-5"
            size="lg"
            variant="secondary"
          >
            Customize Profile
            <Settings />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Customize Your Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Update your display name, profile picture, and other profile information.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Form {...form}>
            <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-6">
              {/* Profile Picture and Banner Section */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="profilePicture"
                  render={() => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel className="max-h-3.5">Profile Picture</FormLabel>
                      <FormControl>
                        <Button
                          type="button"
                          variant="secondary"
                          shadow={false}
                          onClick={() => setShowAvatarSelector(true)}
                          className="w-full"
                        >
                          Update Profile Picture
                          <Camera />
                        </Button>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="banner"
                  render={() => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel className="max-h-3.5">Banner</FormLabel>
                      <FormControl>
                        <Button
                          type="button"
                          variant="secondary"
                          shadow={false}
                          onClick={() => setShowBannerSelector(true)}
                          className="w-full"
                        >
                          Update Banner
                          <Camera />
                        </Button>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Display Name */}
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your display name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Short Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="A brief description that appears below your name..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Root Error Display */}
              {form.formState.errors.root && (
                <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
                  {form.formState.errors.root.message}
                </div>
              )}

              <AlertDialogFooter className="items-center">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button shadow={false} type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Avatar Selector Modal */}
      <AlertDialog open={showAvatarSelector} onOpenChange={setShowAvatarSelector}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Choose Profile Picture</AlertDialogTitle>
            <AlertDialogDescription>
              Make sure your image is at least 200x200 pixels and 1x1 ratio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AvatarSelector
            currentAvatar={watchedProfilePicture}
            onSelect={handleAvatarSelect}
            onClose={() => setShowAvatarSelector(false)}
          />
        </AlertDialogContent>
      </AlertDialog>

      {/* Banner Selector Modal */}
      <AlertDialog open={showBannerSelector} onOpenChange={setShowBannerSelector}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Choose Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Select a banner background from the default options or upload your own custom banner
              image.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <BannerSelector
            currentBanner={watchedBanner}
            onSelect={handleBannerSelect}
            onClose={() => setShowBannerSelector(false)}
          />
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export { Customization };
export type { CustomizationProps, CustomizationFormData };
