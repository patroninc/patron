import { JSX, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';

import MainLayout from '@/layouts/main';
import PxBorder from '@/components/px-border';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/AppDataContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { patronClient } from '@/lib/utils';

/**
 * Individual post display page component
 *
 * @returns {JSX.Element} The Post component
 */
export const Post = (): JSX.Element => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const {
    singlePost,
    series: allSeries,
    posts: allPosts,
    fetchSinglePost,
    fetchSeries,
    fetchPosts,
  } = useAppData();
  const [isLoading, setIsLoading] = useState(false);
  const [hasTriedFetch, setHasTriedFetch] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use server-provided data directly
  const post = singlePost;

  // Fetch post data when postId changes or when data is missing
  useEffect(() => {
    /**
     * Fetch missing data from the server.
     */
    const fetchData = async (): Promise<void> => {
      if (!hasTriedFetch) {
        setIsLoading(true);
        setHasTriedFetch(true);

        const promises = [];

        // Always fetch single post when postId is available
        if (postId && fetchSinglePost) {
          promises.push(
            fetchSinglePost(postId).catch((error) => {
              console.warn('Failed to fetch single post:', error);
            }),
          );
        }

        // Fetch all posts if missing
        if (!allPosts && fetchPosts) {
          promises.push(
            fetchPosts().catch((error) => {
              console.warn('Failed to fetch all posts:', error);
            }),
          );
        }

        // Fetch all series if missing
        if (!allSeries && fetchSeries) {
          promises.push(
            fetchSeries().catch((error) => {
              console.warn('Failed to fetch all series:', error);
            }),
          );
        }

        if (promises.length > 0) {
          await Promise.all(promises);
        }

        setIsLoading(false);
      }
    };

    fetchData();
  }, [postId, allPosts, allSeries, fetchSinglePost, fetchPosts, fetchSeries, hasTriedFetch]);

  // Reset fetch flag when postId changes
  useEffect(() => {
    setHasTriedFetch(false);
  }, [postId]);

  /**
   * Handles the deletion of a post after confirmation.
   *
   * @returns {Promise<void>}
   */
  const handleDeletePost = async (): Promise<void> => {
    if (!post) return;

    setIsDeleting(true);
    try {
      await patronClient.posts.delete({ postId: post.id });
      setDeletingPost(false);
      // Use window.location to simulate a link click and trigger a full page reload
      window.location.href = '/dashboard/content';
    } catch (error) {
      console.error('Failed to delete post:', error);
      // You could add error handling/toast notification here
      setIsDeleting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-5">
          <div className="text-lg">Loading post...</div>
        </div>
      </MainLayout>
    );
  }

  if (!post && hasTriedFetch) {
    throw new Error('This post does not exist');
  }

  if (!post && !postId) {
    throw new Error('This post does not exist');
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-5">
          <div className="text-lg">Loading post...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-[50px] px-[100px]">
        <div className="bg-secondary-primary relative mx-auto mb-10 w-full max-w-[1200px]">
          <PxBorder width={5} radius="lg" />
          <div className="flex gap-5 p-10">
            <div className="flex flex-1 flex-col justify-between">
              <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-bold">{post.title}</h1>
              </div>

              <div className="flex items-center justify-end gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button shadow={false} variant="secondary" size="icon">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setDeletingPost(true)} variant="destructive">
                      <Trash2 />
                      Delete post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button shadow={false} onClick={() => navigate(`/edit-post?id=${post.id}`)}>
                  <Edit />
                  Edit
                </Button>
              </div>
            </div>
          </div>

          <div className="prose max-w-none border-t-5 border-black bg-white p-10">
            <div
              className="prose-black prose-img:border-5 prose-img:rounded-[6px] prose-img:border-black prose-li:m-0 prose-h1:text-4xl prose-ul:color-black prose-strong:font-bold prose-p:text-base prose-img:m-0 prose-headings:m-0 prose-p:m-0 prose-ul:m-0 prose-ol:m-0 flex flex-col gap-5 leading-relaxed text-black"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />{' '}
          </div>
        </div>
      </div>

      {/* Delete Post Confirmation Dialog */}
      <AlertDialog open={deletingPost} onOpenChange={(open) => !open && setDeletingPost(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{post?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Post;
