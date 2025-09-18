import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Check, Settings, Upload } from 'lucide-react';
import { JSX } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import PxBorder from './px-border';
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
  initialData?: Partial<CustomizationFormData>;
}

// Default avatars
const defaultAvatars = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
];

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
  onSelect: (selectedAvatar: string) => void;
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Handles file upload for custom avatar.
   *
   * @param event - The file input change event
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
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
    onSelect(selectedAvatar);
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
      <div className="space-y-2">
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
 * Props for the BannerSelector component.
 */
interface BannerSelectorProps {
  currentBanner?: string;
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

  const form = useForm<CustomizationFormData>({
    resolver: zodResolver(customizationSchema),
    defaultValues: {
      displayName: initialData?.displayName || '',
      description: initialData?.description || '',
      profilePicture: initialData?.profilePicture || '',
      banner: initialData?.banner || '',
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
      console.log('Customization data:', data);
      // Here you would typically make an API call to save the data
      // await api.updateUserProfile(data);
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving customization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles avatar selection.
   *
   * @param avatar - The selected avatar URL
   */
  const handleAvatarSelect = (avatar: string): void => {
    form.setValue('profilePicture', avatar);
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
          </AlertDialogHeader>

          <Form {...form}>
            <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-6">
              {/* Profile Picture and Banner Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAvatarSelector(true)}
                    className="w-full"
                  >
                    Update Profile Picture
                    <Camera />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Banner</Label>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowBannerSelector(true)}
                    className="w-full"
                  >
                    Update Banner
                    <Camera />
                  </Button>
                </div>
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

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </AlertDialogAction>
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
