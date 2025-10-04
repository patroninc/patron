import { JSX, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { CalendarDays, ArrowLeft, Edit, Play, FileText, Volume2 } from 'lucide-react';

import MainLayout from '@/layouts/main';
import PxBorder from '@/components/px-border';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/AppDataContext';

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
    singleSeries,
    series: allSeries,
    posts: allPosts,
    fetchSinglePost,
    fetchSeries,
    fetchPosts,
  } = useAppData();
  const [isLoading, setIsLoading] = useState(false);
  const [hasTriedFetch, setHasTriedFetch] = useState(false);

  // Use server-provided data directly
  const post = singlePost;
  const series = singleSeries;

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

  // Show error if no post data is available after trying to fetch
  if (!post && hasTriedFetch) {
    return (
      <MainLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-5">
          <div className="text-lg text-red-600">Post not found</div>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Back to Home
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Show error if no post data and no postId
  if (!post && !postId) {
    return (
      <MainLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-5">
          <div className="text-lg text-red-600">Post not found</div>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Back to Home
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Don't render main content if post is still null
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
        {/* Navigation */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => (series ? navigate(`/series/${series.id}`) : navigate('/'))}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            {series ? `Back to ${series.title}` : 'Back to Home'}
          </Button>
          {series && (
            <Link to={`/series/${series.id}`} className="text-sm text-blue-600 hover:text-blue-800">
              View all posts in series
            </Link>
          )}
        </div>

        {/* Post header */}
        <div className="bg-secondary-primary relative mb-8 p-8">
          <PxBorder width={5} radius="lg" />
          <div className="flex gap-6">
            {/* Thumbnail/Media */}
            <div className="relative h-48 w-80 flex-shrink-0">
              <div className="bg-accent relative h-full w-full">
                <PxBorder width={3} radius="lg" />
                {post.thumbnailUrl ? (
                  <img
                    src={post.thumbnailUrl}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    {post.videoFileId ? (
                      <Play size={48} className="text-gray-400" />
                    ) : post.audioFileId ? (
                      <Volume2 size={48} className="text-gray-400" />
                    ) : (
                      <FileText size={48} className="text-gray-400" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Post info */}
            <div className="flex flex-1 flex-col gap-4">
              <div className="relative w-max">
                <PxBorder width={5} radius="md" />
                <div className="bg-white px-4 py-2">
                  <h1 className="text-3xl font-bold">{post.title}</h1>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  <span>
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString()
                      : 'Unknown date'}
                  </span>
                </div>
                <div className="rounded bg-gray-200 px-2 py-1">Post #{post.postNumber}</div>
                <div
                  className={`rounded px-2 py-1 ${
                    post.isPublished
                      ? 'bg-green-200 text-green-800'
                      : 'bg-yellow-200 text-yellow-800'
                  }`}
                >
                  {post.isPublished ? 'Published' : 'Draft'}
                </div>
              </div>

              {series && (
                <div className="relative">
                  <PxBorder width={3} radius="md" />
                  <div className="bg-white p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Part of series:</span>
                      <Link
                        to={`/series/${series.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {series.title}
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Media indicators */}
              <div className="flex gap-2">
                {post.videoFileId && (
                  <div className="flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-sm">
                    <Play size={14} />
                    <span>Video</span>
                  </div>
                )}
                {post.audioFileId && (
                  <div className="flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-sm">
                    <Volume2 size={14} />
                    <span>Audio</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Post content */}
        <div className="relative mb-8 bg-white p-8">
          <PxBorder width={3} radius="lg" />
          <div className="prose max-w-none">
            <h2 className="mb-4 text-2xl font-bold">Content</h2>
            <div
              className="leading-relaxed text-gray-800"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate(`/new-post?post-id=${post.id}`)}
            className="flex items-center gap-2"
          >
            <Edit size={20} />
            Edit Post
          </Button>
          {series && (
            <Button variant="secondary" onClick={() => navigate(`/series/${series.id}`)}>
              View All Posts in Series
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Post;
