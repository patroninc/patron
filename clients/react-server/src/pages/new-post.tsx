import { JSX, useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, Save } from 'lucide-react';
import { useNavigate } from 'react-router';

import MainLayout from '@/layouts/main';
import { Input } from '@/components/ui/input';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PxBorder from '@/components/px-border';
import { patronClient } from '@/lib/utils';
import { CreatePostRequest } from 'patronts/models';
import { Editor } from '@tinymce/tinymce-react';
import { useAppData } from '@/contexts/AppDataContext';

import '../styling/tinymce.css';

/**
 * New post creation page component.
 * Provides a comprehensive form for creating new posts with all available options.
 *
 * @returns {JSX.Element} The new post page
 */
const NewPost = (): JSX.Element => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showNoSeriesModal, setShowNoSeriesModal] = useState<boolean>(false);
  const navigate = useNavigate();

  const editorRef = useRef<any>(null);

  const { series } = useAppData();

  /**
   * Form instance for post creation with default values and validation rules.
   */
  const form = useForm<CreatePostRequest>({
    defaultValues: {
      title: '',
      content: '',
      postNumber: 1,
      isPublished: false,
      thumbnailUrl: undefined,
      seriesId: undefined,
    },
  });

  // Show modal if user has no series when entering the page
  useEffect(() => {
    if (!series || series.length === 0) {
      setShowNoSeriesModal(true);
    }
  }, [series]);

  /**
   * Handles the submission of the post creation form.
   *
   * @param {CreatePostRequest} formData - The form data containing all post information
   * @returns {void}
   */
  const handleSubmit = async (formData: CreatePostRequest): Promise<void> => {
    try {
      setIsLoading(true);

      // Get content from TinyMCE editor
      const editorContent = editorRef.current?.getContent() || formData.content;

      // Generate slug from title
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const createPostRequest: CreatePostRequest = {
        seriesId: formData.seriesId === 'none' ? '' : formData.seriesId || '',
        title: formData.title,
        content: editorContent,
        slug: slug,
        postNumber: formData.postNumber,
        isPublished: formData.isPublished,
        isPremium: formData.isPremium,
        thumbnailUrl: formData.thumbnailUrl || null,
        audioFileId: null,
        videoFileId: null,
      };

      const result = await patronClient.posts.create(createPostRequest);
      console.log('Post created successfully:', result);

      // Navigate back to content dashboard
      navigate('/dashboard/content');
    } catch (error) {
      console.error('Failed to create post:', error);
      form.setError('title', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'Failed to create post',
      });
    } finally {
      setIsLoading(false);
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
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        form.setValue('thumbnailUrl', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <MainLayout>
      <div className="p-[50px] px-[100px]">
        <h1 className="mb-[50px] text-5xl">Create New Post</h1>

        <div className="max-w-4xl space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Title and Series Row */}
              <div className="flex items-center gap-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: 'Title is required' }}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter post title..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Post Number */}
                <FormField
                  control={form.control}
                  name="postNumber"
                  rules={{ required: 'Post number is required', min: 1 }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="w-[100px]"
                          min="1"
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Series Selection */}
                <FormField
                  control={form.control}
                  name="seriesId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Series</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a series..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Series</SelectItem>
                          {series?.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Content Editor */}
              <FormField
                control={form.control}
                name="content"
                rules={{ required: 'Content is required' }}
                render={() => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <div className="relative m-[3px] bg-white">
                        <PxBorder className="z-10" width={3} radius="lg" />
                        <Editor
                          apiKey="oja86xbqgcds3rxbw50q4thormz7y3np8vsw1tg2xpm3d60i"
                          // eslint-disable-next-line max-params
                          onInit={(_evt, editor) => {
                            editorRef.current = editor;
                          }}
                          init={{
                            height: 500,
                            menubar: false,
                            plugins: [
                              'importcss',
                              'autolink',
                              'lists',
                              'link',
                              'image',
                              'anchor',
                              'searchreplace',
                              'fullscreen',
                              'code',
                            ],
                            promotion: false,
                            onboarding: false,
                            statusbar: false,
                            icons_url: '/tinymce/icons/custom/icons.js',
                            icons: 'custom',
                            block_formats:
                              'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4',
                            object_resizing: false,
                            image_description: false,
                            image_dimensions: false,
                            link_default_target: false,
                            toolbar:
                              'undo redo blocks bold italic underline strikethrough bullist numlist link image quote triangleUp',
                            content_css: [
                              '../styling/inner-tinymce.css',
                              'https://fonts.googleapis.com/css2?family=Albert+Sans:ital,wght@0,100..900;1,100..900&display=swap',
                            ],
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Thumbnail Image */}
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Thumbnail Image</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={openImageDialog}
                          className="w-full"
                          shadow={false}
                        >
                          <Upload className="h-4 w-4" />
                          {imagePreview ? 'Change Image' : 'Add Image'}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Publish Options */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value ?? undefined}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Publish this post immediately</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between gap-4 pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/dashboard/content')}
                  shadow={false}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Creating Post...' : 'Create Post'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <AlertDialog open={showNoSeriesModal} onOpenChange={setShowNoSeriesModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create a series first</AlertDialogTitle>
            <AlertDialogDescription>
              You need to create a series first before you can create posts. Please go to the
              Content dashboard to create a new series.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex sm:justify-center">
            <AlertDialogAction onClick={() => navigate('/dashboard/content')}>
              Go to Content Dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Upload Dialog */}
      <AlertDialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upload Thumbnail Image</AlertDialogTitle>
            <AlertDialogDescription>
              Select an image for your post. Image should be in 16:9 aspect ratio.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col items-center gap-2">
            <input
              id="post-image-upload"
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
              onClick={() => document.getElementById('post-image-upload')?.click()}
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
    </MainLayout>
  );
};

export default NewPost;
