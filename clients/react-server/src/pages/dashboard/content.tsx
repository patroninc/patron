import { JSX, useRef, useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { PostResponse, SeriesResponse } from 'patronts/models';

import MainLayout from '@/layouts/main';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DataTable, createSimpleColumn, createActionsColumn } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import NewSeriesForm from '@/components/new-series-form';
import { useAppData } from '@/contexts/AppDataContext';
import PxBorder from '@/components/px-border';
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
 * Content dashboard page component.
 * Displays content management interface for creators.
 *
 * @returns {JSX.Element} The content dashboard page
 */
const Content = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'series';
  const postsFilterRef = useRef<HTMLInputElement>(null);
  const seriesFilterRef = useRef<HTMLInputElement>(null);
  const [editingSeries, setEditingSeries] = useState<SeriesResponse | undefined>(undefined);
  const [deletingSeries, setDeletingSeries] = useState<SeriesResponse | undefined>(undefined);
  const [lastDeletingSeries, setLastDeletingSeries] = useState<SeriesResponse | null>(null);
  const [deletingPost, setDeletingPost] = useState<PostResponse | undefined>(undefined);
  const [lastDeletingPost, setLastDeletingPost] = useState<PostResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get data from context (fetched on server side)
  const { posts, series } = useAppData();

  // Keep track of the last valid series for delete dialog to prevent flickering
  const currentDeletingSeries = deletingSeries || lastDeletingSeries;
  const currentDeletingPost = deletingPost || lastDeletingPost;

  // Update lastDeletingSeries when deletingSeries is set
  useEffect(() => {
    if (deletingSeries) {
      setLastDeletingSeries(deletingSeries);
    }
  }, [deletingSeries]);

  // Clear lastDeletingSeries after dialog closes
  useEffect(() => {
    if (!deletingSeries) {
      const timer = setTimeout(() => {
        setLastDeletingSeries(null);
      }, 300); // Match dialog animation duration
      return () => clearTimeout(timer);
    }
  }, [deletingSeries]);

  // Update lastDeletingPost when deletingPost is set
  useEffect(() => {
    if (deletingPost) {
      setLastDeletingPost(deletingPost);
    }
  }, [deletingPost]);

  // Clear lastDeletingPost after dialog closes
  useEffect(() => {
    if (!deletingPost) {
      const timer = setTimeout(() => {
        setLastDeletingPost(null);
      }, 300); // Match dialog animation duration
      return () => clearTimeout(timer);
    }
  }, [deletingPost]);

  /**
   * Handles the deletion of a series after confirmation.
   *
   * @returns {Promise<void>}
   */
  const handleDeleteSeries = async (): Promise<void> => {
    if (!currentDeletingSeries) return;

    setIsDeleting(true);
    try {
      await patronClient.series.delete({ seriesId: currentDeletingSeries.id });
      setDeletingSeries(undefined);
      navigate(0); // Refresh the page
    } catch (error) {
      console.error('Failed to delete series:', error);
      // You could add error handling/toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handles the deletion of a post after confirmation.
   *
   * @returns {Promise<void>}
   */
  const handleDeletePost = async (): Promise<void> => {
    if (!currentDeletingPost) return;

    setIsDeleting(true);
    try {
      await patronClient.posts.delete({ postId: currentDeletingPost.id });
      setDeletingPost(undefined);
      navigate(0); // Refresh the page
    } catch (error) {
      console.error('Failed to delete post:', error);
      // You could add error handling/toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  // Column definitions for posts
  const postsColumns: ColumnDef<PostResponse>[] = [
    createSimpleColumn('postNumber', '#', true),
    createSimpleColumn('title', 'Title', false),
    createSimpleColumn('createdAt', 'Created At', true, ({ row }) => {
      const value = row.getValue('createdAt');
      if (!value) return <div>-</div>;

      const date = value instanceof Date ? value : new Date(value as string);
      if (isNaN(date.getTime())) return <div>Invalid date</div>;

      return <div>{date.toLocaleDateString()}</div>;
    }),
    createActionsColumn<PostResponse>([
      {
        label: 'Edit post',
        icon: Edit,
        onClick: (post) => navigate(`/edit-post?id=${post.id}`),
      },
      {
        label: 'View post',
        icon: Eye,
        onClick: (post) => navigate(`/post/${post.id}`),
      },
      {
        label: 'Delete post',
        icon: Trash2,
        destructive: true,
        onClick: (post) => setDeletingPost(post),
      },
    ]),
  ];

  // Column definitions for series (needs to be inside component to access setEditingSeries)
  const seriesColumns: ColumnDef<SeriesResponse>[] = [
    createSimpleColumn('title', 'Title', false),
    createSimpleColumn('description', 'Description', false),
    createActionsColumn<SeriesResponse>([
      {
        label: 'Edit series',
        icon: Edit,
        onClick: (series) => setEditingSeries(series),
      },
      {
        label: 'View series',
        icon: Eye,
        onClick: (series) => navigate(`/series/${series.id}`),
      },
      {
        label: 'Delete series',
        icon: Trash2,
        destructive: true,
        onClick: (series) => setDeletingSeries(series),
      },
    ]),
  ];

  return (
    <MainLayout>
      <div className="p-[50px] px-[100px]">
        <h1 className="mb-[50px] text-5xl">Content</h1>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setSearchParams({ tab: value })}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="series">Series</TabsTrigger>
            <TabsTrigger value="posts">All Posts</TabsTrigger>
          </TabsList>

          <TabsContent className="m-0" value="series">
            {series ? (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <Input
                    ref={seriesFilterRef}
                    placeholder="Search series..."
                    className="md:text-base"
                  />

                  <NewSeriesForm
                    trigger={
                      <Button>
                        New series
                        <Plus />
                      </Button>
                    }
                  />
                </div>
                <DataTable
                  columns={seriesColumns}
                  data={series || []}
                  enableSorting={true}
                  enableCheckboxes={false}
                  enablePagination={true}
                  enableColumnFilters={true}
                  filterColumn="title"
                  filterInputRef={seriesFilterRef}
                />
              </>
            ) : (
              <div className="relative m-[3px] flex flex-col items-center justify-center gap-5 bg-white p-10">
                <div className="text-lg">You haven't created any series yet.</div>
                <NewSeriesForm
                  trigger={
                    <Button containerClassName="w-max">
                      New series
                      <Plus />
                    </Button>
                  }
                />
                <PxBorder width={3} radius="lg" />
              </div>
            )}
          </TabsContent>

          <TabsContent className="m-0" value="posts">
            {series && series.length > 0 ? (
              posts && posts.length > 0 ? (
                <>
                  <div className="mb-5 flex items-center justify-between">
                    <Input
                      ref={postsFilterRef}
                      placeholder="Search posts..."
                      className="md:text-base"
                    />

                    <Button onClick={() => navigate('/new-post')}>
                      New post
                      <Plus />
                    </Button>
                  </div>
                  <DataTable
                    columns={postsColumns}
                    data={posts || []}
                    enableSorting={true}
                    enableCheckboxes={false}
                    enablePagination={true}
                    enableColumnFilters={true}
                    filterColumn="title"
                    filterInputRef={postsFilterRef}
                  />
                </>
              ) : (
                <div className="relative m-[3px] flex flex-col items-center justify-center gap-5 bg-white p-10">
                  <div className="text-lg">You haven't created any posts yet.</div>
                  <Button onClick={() => navigate('/new-post')} containerClassName="w-max">
                    New post
                    <Plus />
                  </Button>
                  <PxBorder width={3} radius="lg" />
                </div>
              )
            ) : (
              <div className="relative m-[3px] flex flex-col items-center justify-center gap-5 bg-white p-10">
                <div className="text-lg">
                  You need to create a series first before you can create posts.
                </div>
                <NewSeriesForm
                  trigger={
                    <Button containerClassName="w-max">
                      Create Series
                      <Plus />
                    </Button>
                  }
                />
                <PxBorder width={3} radius="lg" />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Series Dialog */}
      <NewSeriesForm
        existingSeries={editingSeries}
        open={!!editingSeries}
        onOpenChange={(open) => !open && setEditingSeries(undefined)}
        onSeriesCreated={() => setEditingSeries(undefined)}
      />

      {/* Delete Series Confirmation Dialog */}
      <AlertDialog
        open={!!deletingSeries}
        onOpenChange={(open) => !open && setDeletingSeries(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Series</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{currentDeletingSeries?.title}"? This action cannot
              be undone and will also delete all posts in this series.
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

      {/* Delete Post Confirmation Dialog */}
      <AlertDialog
        open={!!deletingPost}
        onOpenChange={(open) => !open && setDeletingPost(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{currentDeletingPost?.title}"? This action cannot be
              undone.
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

export default Content;
