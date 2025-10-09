import { JSX, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { PlusIcon, MoreHorizontal, Pencil, Trash2, Edit } from 'lucide-react';

import MainLayout from '@/layouts/main';
import PxBorder from '@/components/px-border';
import FocusRing from '@/components/focus-ring';
import { Button } from '@/components/ui/button';
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
import { useAppData } from '@/contexts/AppDataContext';
import NewSeriesForm from '@/components/new-series-form';
import { patronClient } from '@/lib/utils';

/**
 * Individual series display page component
 *
 * @returns {JSX.Element} The Series component
 */
export const Series = (): JSX.Element => {
  const { seriesId } = useParams<{ seriesId: string }>();
  const navigate = useNavigate();
  const {
    singleSeries,
    series: allSeries,
    posts: initialPosts,
    fetchSingleSeries,
    fetchSeries,
  } = useAppData();
  const [isLoading, setIsLoading] = useState(false);
  const [hasTriedFetch, setHasTriedFetch] = useState(false);
  const [editingSeries, setEditingSeries] = useState(false);
  const [deletingSeries, setDeletingSeries] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use server-provided data directly
  const series = singleSeries;
  const posts = initialPosts || [];

  // Fetch series data when seriesId changes or when data is missing
  useEffect(() => {
    /**
     * Fetch missing data from the server.
     */
    const fetchData = async (): Promise<void> => {
      if (!hasTriedFetch) {
        setIsLoading(true);
        setHasTriedFetch(true);

        const promises = [];

        // Always fetch single series when seriesId is available
        if (seriesId && fetchSingleSeries) {
          promises.push(
            fetchSingleSeries(seriesId).catch((error) => {
              console.warn('Failed to fetch single series:', error);
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
  }, [seriesId, allSeries, fetchSingleSeries, fetchSeries, hasTriedFetch]);

  // Reset fetch flag when seriesId changes
  useEffect(() => {
    setHasTriedFetch(false);
  }, [seriesId]);

  /**
   * Handles the deletion of a series after confirmation.
   *
   * @returns {Promise<void>}
   */
  const handleDeleteSeries = async (): Promise<void> => {
    if (!series) return;

    setIsDeleting(true);
    try {
      await patronClient.series.delete({ seriesId: series.id });
      setDeletingSeries(false);
      // Use window.location to simulate a link click and trigger a full page reload
      window.location.href = '/dashboard/content';
    } catch (error) {
      console.error('Failed to delete series:', error);
      // You could add error handling/toast notification here
      setIsDeleting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-5">
          <div className="text-lg">Loading series...</div>
        </div>
      </MainLayout>
    );
  }

  if (!series && hasTriedFetch) {
    throw new Error('This series does not exist');
  }

  if (!series && !seriesId) {
    throw new Error('This series does not exist');
  }

  // Don't render main content if series is still null
  if (!series) {
    return (
      <MainLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-5">
          <div className="text-lg">Loading series...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-[50px] px-[100px]">
        <div className="bg-secondary-primary relative mx-auto mb-10 w-full max-w-[1200px] p-10">
          <PxBorder width={5} radius="lg" />
          <div className="flex gap-5">
            <div className="bg-accent relative m-[5px] aspect-video w-[300px]">
              <PxBorder width={5} radius="lg" />
              {series.coverImageUrl ? (
                <img
                  src={series.coverImageUrl}
                  alt={series.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-[50px]"
                    viewBox="0 0 100 92"
                    fill="none"
                  >
                    <path
                      d="M41.667 92H25V83.6367H41.667V92ZM75 92H58.333V83.6367H75V92ZM25 83.6367H16.667V58.5459H25V83.6367ZM58.333 83.6367H41.667V75.2725H58.333V83.6367ZM83.333 83.6367H75V58.5459H83.333V83.6367ZM16.667 50.1816V58.5459H8.33301V50.1816H16.667ZM91.667 58.5459H83.333V50.1816H91.667V58.5459ZM8.33301 50.1816H0V33.4541H8.33301V50.1816ZM100 50.1816H91.667V33.4541H100V50.1816ZM33.333 33.4541H8.33301V25.0908H33.333V33.4541ZM91.667 33.4541H66.667V25.0908H91.667V33.4541ZM41.667 25.0908H33.333V8.36328H41.667V25.0908ZM66.667 25.0908H58.333V8.36328H66.667V25.0908ZM58.333 8.36328H41.667V0H58.333V8.36328Z"
                      fill="black"
                    />
                    <path
                      d="M58.3335 25.0908H66.6665V33.4541H91.6665V50.1816H83.3335V58.5449H75.0005V83.6357H58.3335V75.2725H41.6665V83.6357H25.0005V58.5449H16.6665V50.1816H8.3335V33.4541H33.3335V25.0908H41.6665V8.36328H58.3335V25.0908Z"
                      fill="#265B92"
                    />
                  </svg>
                </div>
              )}

              <div className="absolute right-2.5 bottom-2.5">
                <div className="relative m-[3px] bg-white px-1.5 py-[3px]">
                  <PxBorder width={3} radius="md" />
                  {/* {series.numberOfPosts && <span className="text-sm">{series.numberOfPosts}</span>} */}
                  20 posts
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-bold">{series.title}</h1>

                {series.description && <p className="text-base">{series.description}</p>}
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
                    <DropdownMenuItem onClick={() => setEditingSeries(true)}>
                      <Edit />
                      Edit series
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeletingSeries(true)} variant="destructive">
                      <Trash2 />
                      Delete series
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={() => navigate(`/new-post?series-id=${seriesId}`)} shadow={false}>
                  New post <PlusIcon />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts section */}
        <div className="relative mx-auto w-full max-w-[1200px]">
          <PxBorder width={5} className="z-[5]" radius="lg" />
          {posts.length === 0 ? (
            <div className="relative bg-white p-10 text-center">
              <PxBorder width={5} radius="lg" />
              <div className="flex flex-col items-center gap-4">
                <h3 className="text-xl">No posts yet</h3>
                <p>Start creating content for your series by adding your first post.</p>
                <Button
                  onClick={() => navigate(`/new-post?series-id=${seriesId}`)}
                  className="flex items-center gap-2"
                >
                  Create Your First Post
                  <PlusIcon size={20} />
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-secondary-primary relative flex items-center border-black not-last:border-b-[5px]"
                >
                  <Link
                    className="group flex flex-1 flex-row items-center gap-5 px-3 py-5 outline-none"
                    to={`/post/${post.id}`}
                  >
                    <span className="w-[3ch] text-xl">{post.postNumber}</span>
                    <div className="bg-accent relative aspect-video w-[178px]">
                      <PxBorder width={3} radius="lg" />
                      {post.thumbnailUrl ? (
                        <img
                          src={post.thumbnailUrl}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center"></div>
                      )}
                    </div>
                    <FocusRing width={3} />
                    <h3 className="pl-3 text-2xl font-bold">{post.title}</h3>
                  </Link>

                  <div className="pr-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" shadow={false}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/edit-post/${post.id}`)}>
                          <Pencil />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            console.log('Delete post:', post.id);
                          }}
                        >
                          <Trash2 />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Series Dialog */}
      <NewSeriesForm
        existingSeries={series}
        open={editingSeries}
        onOpenChange={(open) => !open && setEditingSeries(false)}
        onSeriesCreated={() => {
          setEditingSeries(false);
          window.location.reload(); // Reload to refresh series data
        }}
      />

      {/* Delete Series Confirmation Dialog */}
      <AlertDialog open={deletingSeries} onOpenChange={(open) => !open && setDeletingSeries(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Series</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{series?.title}"? This action cannot be undone and
              will also delete all posts in this series.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSeries}
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

export default Series;
