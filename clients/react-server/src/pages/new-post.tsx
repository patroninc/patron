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
import PxBorder from '@/components/px-border';
import { patronClient } from '@/lib/utils';
import { CreatePostRequest } from 'patronts/models';
import { Editor } from '@tinymce/tinymce-react';

export type PostFormData = {
  title: string;
  content: string;
  slug: string;
  postNumber: number;
  isPublished: boolean;
  isPremium: boolean;
  thumbnailUrl?: string;
};

import '../styling/tinymce.css';

/**
 * New post creation page component.
 * Provides a comprehensive form for creating new posts with all available options.
 *
 * @returns {JSX.Element} The new post page
 */
const NewPost = (): JSX.Element => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const editorRef = useRef<any>(null);

  /**
   * Form instance for post creation with default values and validation rules.
   */
  const form = useForm<PostFormData>({
    defaultValues: {
      title: '',
      content: '',
      slug: '',
      postNumber: 1,
      isPublished: false,
      isPremium: false,
      thumbnailUrl: undefined,
    },
  });

  // Auto-generate slug from title
  const watchedTitle = form.watch('title');
  useEffect(() => {
    if (watchedTitle) {
      const slug = watchedTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      form.setValue('slug', slug);
    }
  }, [watchedTitle, form]);

  /**
   * Handles the submission of the post creation form.
   *
   * @param {PostFormData} formData - The form data containing all post information
   * @returns {void}
   */
  const handleSubmit = async (formData: PostFormData): Promise<void> => {
    try {
      setIsLoading(true);

      // Get content from TinyMCE editor
      const editorContent = editorRef.current?.getContent() || formData.content;

      const createPostRequest: CreatePostRequest = {
        seriesId: '', // TODO: This needs to be provided - series selection was removed
        title: formData.title,
        content: editorContent,
        slug: formData.slug,
        postNumber: formData.postNumber,
        isPublished: formData.isPublished,
        isPremium: formData.isPremium,
        thumbnailUrl: formData.thumbnailUrl || null,
        audioFileId: null,
        videoFileId: null,
      };

      const result = await patronClient.posts.createPost(createPostRequest);
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
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter post title..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug */}
              <FormField
                control={form.control}
                name="slug"
                rules={{ required: 'Slug is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="post-slug" {...field} />
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
                      <div className="space-y-4">
                        <input
                          id="post-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => document.getElementById('post-image-upload')?.click()}
                          className="w-full"
                          shadow={false}
                        >
                          <Upload className="h-4 w-4" />
                          {imagePreview ? 'Change Image' : 'Choose Thumbnail Image'}
                        </Button>
                        {imagePreview && (
                          <div className="relative aspect-video w-1/3">
                            <PxBorder width={3} radius="lg" />
                            <img
                              src={imagePreview}
                              alt="Thumbnail preview"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
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
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel>Publish this post immediately</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPremium"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel>Make this post premium (requires subscription)</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
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
    </MainLayout>
  );
};

export default NewPost;
