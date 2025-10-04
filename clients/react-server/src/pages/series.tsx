import { JSX, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { CalendarDays, ArrowLeft, PlusIcon, Play, FileText } from 'lucide-react';

import MainLayout from '@/layouts/main';
import PxBorder from '@/components/px-border';
import FocusRing from '@/components/focus-ring';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/AppDataContext';

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

  // Show error if no series data is available after trying to fetch
  if (!series && hasTriedFetch) {
    return (
      <MainLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-5">
          <div className="text-lg text-red-600">Series not found</div>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Back to Home
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Show error if no series data and no seriesId
  if (!series && !seriesId) {
    return (
      <MainLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-5">
          <div className="text-lg text-red-600">Series not found</div>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Back to Home
          </Button>
        </div>
      </MainLayout>
    );
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
        <div className="bg-secondary-primary relative m-[5px] mb-10 p-10">
          <PxBorder width={5} radius="lg" />
          <div className="flex gap-10">
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
            </div>

            {/* Series info */}
            <div className="flex flex-1 flex-col gap-4">
              <h1 className="text-3xl font-bold">{series.title}</h1>

              {series.description && <p className="text-lg">{series.description}</p>}

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  <span>
                    {series.createdAt
                      ? new Date(series.createdAt).toLocaleDateString()
                      : 'Unknown date'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts section */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Posts ({posts.length})</h2>
            <Button
              onClick={() => navigate(`/new-post?series-id=${seriesId}`)}
              className="flex items-center gap-2"
            >
              <PlusIcon size={20} />
              Create New Post
            </Button>
          </div>

          {posts.length === 0 ? (
            <div className="relative bg-white p-8 text-center">
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
                <div key={post.id} className="bg-secondary-primary relative p-5">
                  <Link className="group flex flex-col gap-4 outline-none" to={`/post/${post.id}`}>
                    <div className="bg-accent relative aspect-video h-[50px]">
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
                    <PxBorder width={3} radius="lg" />
                    <FocusRing width={3} />
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-bold">{post.title}</h3>
                      <div className="flex items-center justify-between text-sm">
                        <span>Post #{post.postNumber}</span>
                        <div className="flex items-center gap-2">
                          <CalendarDays size={14} />
                          <span>
                            {post.createdAt
                              ? new Date(post.createdAt).toLocaleDateString()
                              : 'No date'}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm">
                        {post.isPublished ? (
                          <span className="font-medium text-green-600">Published</span>
                        ) : (
                          <span className="font-medium text-yellow-600">Draft</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Series;
