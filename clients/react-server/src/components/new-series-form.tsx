import { JSX, useState, useEffect } from 'react';
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
import PxBorder from './px-border';
import { patronClient } from '@/lib/utils';
import { useNavigate } from 'react-router';
import { CreateSeriesRequest, SeriesResponse } from 'patronts/models';

export type SeriesFormData = {
  seriesData: Exclude<CreateSeriesRequest, 'coverImageUrl'>;
  image?: File;
};

interface NewSeriesFormProps {
  /**
   * Optional trigger element to open the dialog
   */
  trigger?: React.ReactNode;
  /**
   * Optional title for the dialog
   */
  title?: string;
  /**
   * Optional description for the dialog
   */
  description?: string;
  /**
   * Optional callback to refresh series after creation/update
   */
  onSeriesCreated?: () => void;
  /**
   * Optional existing series data for editing
   */
  existingSeries?: SeriesResponse;
  /**
   * Controlled open state
   */
  open?: boolean;
  /**
   * Callback when open state changes
   */
  onOpenChange?: (isOpen: boolean) => void; // eslint-disable-line
}

/**
 * Reusable form component for creating or editing a series.
 * Can be used as a standalone dialog or with a custom trigger.
 *
 * @param {NewSeriesFormProps} props - The component props
 * @returns {JSX.Element} The series form component
 */
const NewSeriesForm = ({
  trigger,
  title,
  description,
  onSeriesCreated,
  existingSeries,
  open,
  onOpenChange,
}: NewSeriesFormProps): JSX.Element => {
  // Keep track of the last valid series data to prevent flickering during close
  const [lastSeries, setLastSeries] = useState<SeriesResponse | null>(existingSeries || null);

  // Use lastSeries during closing animation to prevent flickering
  const currentSeries = existingSeries || lastSeries;
  const isEditMode = !!currentSeries;
  const defaultTitle = isEditMode ? 'Edit Series' : 'Create New Series';
  const defaultDescription = isEditMode
    ? 'Update your series information.'
    : 'Create a new series to organize your posts into a cohesive series.';

  const [imagePreview, setImagePreview] = useState<string | null>(
    currentSeries?.coverImageUrl || null,
  );
  const [isImageDialogOpen, setIsImageDialogOpen] = useState<boolean>(false);
  const form = useForm<SeriesFormData>({
    defaultValues: {
      seriesData: {
        title: currentSeries?.title || '',
        description: currentSeries?.description || '',
        category: currentSeries?.category || '',
      } as CreateSeriesRequest,
      image: undefined,
    },
  });

  const navigate = useNavigate();

  // Update form when existingSeries is provided
  useEffect(() => {
    if (existingSeries) {
      setLastSeries(existingSeries);
      form.reset({
        seriesData: {
          title: existingSeries.title,
          description: existingSeries.description || '',
          category: existingSeries.category || '',
        } as CreateSeriesRequest,
        image: undefined,
      });
      setImagePreview(existingSeries.coverImageUrl || null);
    }
  }, [existingSeries, form]);

  // Clear form only after dialog is fully closed
  useEffect(() => {
    if (open === false) {
      // Delay clearing to allow close animation to complete
      const timer = setTimeout(() => {
        setLastSeries(null);
        if (!existingSeries) {
          form.reset({
            seriesData: {} as CreateSeriesRequest,
            image: undefined,
          });
          setImagePreview(null);
        }
      }, 300); // Match dialog animation duration
      return () => clearTimeout(timer);
    }
  }, [open, existingSeries, form]);

  /**
   * Handles the submission of the series creation/update form.
   *
   * @param {SeriesFormData} formData - The form data containing seriesData and optional image
   * @returns {void}
   */
  const handleSubmit = async (formData: SeriesFormData): Promise<void> => {
    try {
      // Upload image if one was selected
      let coverImageUrl: string | undefined = currentSeries?.coverImageUrl ?? undefined;
      if (formData.image) {
        try {
          const uploadedFileResult = await patronClient.files.upload({
            file: formData.image,
          });
          coverImageUrl = (await patronClient.files.serveCdn({
            fileId: uploadedFileResult.file.id,
          })) as unknown as string;
        } catch (uploadError) {
          console.error('Error uploading cover image:', uploadError);
          form.setError('image', {
            type: 'manual',
            message: 'Failed to upload cover image. Please try again.',
          });
          return; // Don't create/update series if image upload fails
        }
      }

      if (isEditMode && currentSeries) {
        // Update existing series
        await patronClient.series.update({
          seriesId: currentSeries.id,
          updateSeriesRequest: {
            title: formData.seriesData.title,
            description: formData.seriesData.description,
            category: formData.seriesData.category,
            coverImageUrl: coverImageUrl,
            slug: formData.seriesData.title.toLowerCase().replace(/ /g, '-'),
          },
        });
      } else {
        // Create new series
        await patronClient.series.create({
          ...formData.seriesData,
          coverImageUrl: coverImageUrl,
          slug: formData.seriesData.title.toLowerCase().replace(/ /g, '-'),
        });
      }

      // Call the callback to refresh series data
      if (onSeriesCreated) {
        onSeriesCreated();
      }

      navigate(0);
    } catch (error) {
      form.setError('seriesData.title', {
        type: 'manual',
        message:
          error instanceof Error
            ? error.message
            : `Failed to ${isEditMode ? 'update' : 'create'} series`,
      });
    }
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
        <AlertDialogTitle>{title || defaultTitle}</AlertDialogTitle>
        <AlertDialogDescription>{description || defaultDescription}</AlertDialogDescription>
      </AlertDialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="seriesData.title"
            rules={{ required: 'Title is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter series title..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seriesData.description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter series description..."
                    {...field}
                    value={field.value || ''}
                  />
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
                      onClick={() => setIsImageDialogOpen(true)}
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

          <AlertDialogFooter>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </AlertDialogTrigger>
            <Button type="submit">{isEditMode ? 'Update Series' : 'Create Series'}</Button>
          </AlertDialogFooter>
        </form>
      </Form>
    </AlertDialogContent>
  );

  // If trigger is provided, wrap with AlertDialog and trigger
  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
        {formContent}
      </AlertDialog>

      {/* Image Upload Dialog */}
      <AlertDialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upload Cover Image</AlertDialogTitle>
            <AlertDialogDescription>
              Select an image for your series. Image should be in 16:9 aspect ratio.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col items-center gap-2">
            <input
              id="series-image-upload"
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
              onClick={() => document.getElementById('series-image-upload')?.click()}
              shadow={false}
              className="mx-auto w-max"
            >
              <Upload />
              Choose Image File
            </Button>
          </div>

          <AlertDialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsImageDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsImageDialogOpen(false);
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

export default NewSeriesForm;
