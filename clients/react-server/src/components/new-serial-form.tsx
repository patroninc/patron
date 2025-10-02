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

export type SerialFormData = {
  seriesData: Exclude<CreateSeriesRequest, 'coverImageUrl'>;
  image?: File;
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
  const form = useForm<SerialFormData>({
    defaultValues: {
      seriesData: {} as CreateSeriesRequest,
      image: undefined,
    },
  });

  const navigate = useNavigate();

  /**
   * Handles the submission of the serial creation form.
   *
   * @param {SerialFormData} formData - The form data containing seriesData and optional image
   * @returns {void}
   */
  const handleSubmit = async (formData: SerialFormData): Promise<void> => {
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
          return; // Don't create serial if image upload fails
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
        message: error instanceof Error ? error.message : 'Failed to create serial',
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
                  <Input placeholder="Enter serial title..." {...field} />
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
                    placeholder="Enter serial description..."
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

export default NewSerialForm;
