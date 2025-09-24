import { JSX, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, Image } from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PxBorder from './px-border';
import { patronClient } from '@/lib/utils';
import { useNavigate } from 'react-router';

export type SerialFormData = {
  title: string;
  description?: string;
  image?: File;
  isPublished: boolean;
  isMonetized: boolean;
  pricingTier?: string;
};

interface NewSerialFormProps {
  /**
   * Optional trigger element to open the dialog
   */
  trigger: React.ReactNode;
  /**
   * Optional title for the dialog
   */
  title?: string;
  /**
   * Optional description for the dialog
   */
  description?: string;
}

/**
 * Reusable form component for creating a new serial.
 * Can be used as a standalone dialog or with a custom trigger.
 *
 * @param {NewSerialFormProps} props - The component props
 * @returns {JSX.Element} The new serial form component
 */
const NewSerialForm = ({
  trigger,
  title = 'Create New Serial',
  description = 'Create a new serial to organize your posts into a cohesive series.',
}: NewSerialFormProps): JSX.Element => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const form = useForm<SerialFormData>({
    defaultValues: {
      title: '',
      description: undefined,
      image: undefined,
      isPublished: false,
      isMonetized: false,
      pricingTier: undefined,
    },
  });

  /**
   * Handles the submission of the serial creation form.
   *
   * @param {SerialFormData} formData - The form data containing title, description, and optional image
   * @returns {void}
   */
  const handleSubmit = async (formData: SerialFormData): Promise<void> => {
    try {
      const series = await patronClient.series.createSeries({
        title: formData.title,
        description: formData.description,
        coverImageUrl: undefined,
        isMonetized: formData.isMonetized,
        isPublished: formData.isPublished,
        pricingTier: formData.pricingTier,
        slug: formData.title.toLowerCase().replace(/ /g, '-'),
      });

      console.log(series);

      // navigate(`/series/${series.id}`);
    } catch (error) {
      form.setError('title', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'Failed to create serial',
      });
    }
  };

  /**
   * Opens the image upload dialog.
   *
   * @returns {void}
   */
  const openImageDialog = (): void => {
    setIsImageDialogOpen(true);
  };

  /**
   * Closes the image upload dialog.
   *
   * @returns {void}
   */
  const closeImageDialog = (): void => {
    setIsImageDialogOpen(false);
  };

  /**
   * Handles file selection for image upload.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - The file input change event
   * @returns {void}
   */
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('image', file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formContent = (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            rules={{ required: 'Title is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter serial title..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Enter serial description..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={() => (
              <FormItem>
                <FormLabel>Cover Image</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={openImageDialog}
                      className="w-full"
                      shadow={false}
                    >
                      <Image />
                      {imagePreview ? 'Change Image' : 'Add Image'}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel>Make this series visible to the public upon creation</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isMonetized"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel>Monetize this serial</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {form.watch('isMonetized') && (
            <FormField
              control={form.control}
              name="pricingTier"
              rules={{ required: 'Pricing tier is required when monetized' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pricing Tier</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a pricing tier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="basic">Basic - $5/month</SelectItem>
                      <SelectItem value="premium">Premium - $10/month</SelectItem>
                      <SelectItem value="pro">Pro - $20/month</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <AlertDialogFooter>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </AlertDialogTrigger>
            <Button type="submit">Create Serial</Button>
          </AlertDialogFooter>
        </form>
      </Form>
    </AlertDialogContent>
  );

  // If trigger is provided, wrap with AlertDialog and trigger
  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
        {formContent}
      </AlertDialog>

      {/* Image Upload Dialog */}
      <AlertDialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upload Cover Image</AlertDialogTitle>
            <AlertDialogDescription>
              Select an image for your serial. Image should be in 16:9 aspect ratio.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col items-center gap-2">
            <input
              id="serial-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {imagePreview && (
              <div className="relative aspect-video w-2/3">
                <PxBorder width={3} radius="lg" />
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}

            <Button
              type="button"
              variant="secondary"
              onClick={() => document.getElementById('serial-image-upload')?.click()}
              shadow={false}
              className="mx-auto w-max"
            >
              <Upload />
              Choose Image File
            </Button>
          </div>

          <AlertDialogFooter>
            <Button type="button" variant="secondary" onClick={closeImageDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                closeImageDialog();
              }}
              disabled={!imagePreview}
            >
              Save Image
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default NewSerialForm;
