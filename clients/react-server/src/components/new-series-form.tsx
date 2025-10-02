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
import PxBorder from './px-border';
import { patronClient } from '@/lib/utils';
import { useNavigate } from 'react-router';
import { CreateSeriesRequest } from 'patronts/models';

export type SeriesFormData = {
  seriesData: Exclude<CreateSeriesRequest, 'coverImageUrl'>;
  image?: File;
};

interface NewSeriesFormProps {
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
 * Reusable form component for creating a new series.
 * Can be used as a standalone dialog or with a custom trigger.
 *
 * @param {NewSeriesFormProps} props - The component props
 * @returns {JSX.Element} The new series form component
 */
const NewSeriesForm = ({
  trigger,
  title = 'Create New Series',
  description = 'Create a new series to organize your posts into a cohesive series.',
}: NewSeriesFormProps): JSX.Element => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState<boolean>(false);
  const form = useForm<SeriesFormData>({
    defaultValues: {
      seriesData: {} as CreateSeriesRequest,
      image: undefined,
    },
  });

  const navigate = useNavigate();

  /**
   * Handles the submission of the series creation form.
   *
   * @param {SeriesFormData} formData - The form data containing seriesData and optional image
   * @returns {void}
   */
  const handleSubmit = async (formData: SeriesFormData): Promise<void> => {
    try {
      // Upload image if one was selected
      let coverImageUrl: string | undefined = undefined;
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
          return; // Don't create series if image upload fails
        }
      }

      await patronClient.series.create({
        ...formData.seriesData,
        coverImageUrl: coverImageUrl,
        slug: formData.seriesData.title.toLowerCase().replace(/ /g, '-'),
      });

      navigate(0);
    } catch (error) {
      form.setError('seriesData.title', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'Failed to create series',
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
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
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
            <Button type="submit">Create Series</Button>
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
