import { JSX, useRef } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';

import MainLayout from '@/layouts/main';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DataTable, createSimpleColumn, createActionsColumn } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import NewSeriesForm from '@/components/new-series-form';
import { useAppData } from '@/contexts/AppDataContext';
import PxBorder from '@/components/px-border';

// Data types
export type Post = {
  id: string;
  postNumber: number;
  title: string;
  publishedAt: string;
};

export type Series = {
  id: string;
  title: string;
  description: string;
};

// Column definitions for posts
const postsColumns: ColumnDef<Post>[] = [
  createSimpleColumn('postNumber', '#', true),
  createSimpleColumn('title', 'Title', false),
  createSimpleColumn('publishedAt', 'Published At', true, ({ row }) => {
    const date = new Date(row.getValue('publishedAt'));
    return <div>{date.toLocaleDateString()}</div>;
  }),
  createActionsColumn<Post>([
    {
      label: 'Edit post',
      icon: Edit,
      onClick: (post) => console.log('Edit post:', post.id),
    },
    {
      label: 'View post',
      icon: Eye,
      onClick: (post) => console.log('View post:', post.id),
    },
    {
      label: 'Delete post',
      icon: Trash2,
      destructive: true,
      onClick: (post) => console.log('Delete post:', post.id),
    },
  ]),
];

// Column definitions for series
const seriesColumns: ColumnDef<Series>[] = [
  createSimpleColumn('title', 'Title', false),
  createSimpleColumn('description', 'Description', false),
  createActionsColumn<Series>([
    {
      label: 'Edit series',
      icon: Edit,
      onClick: (series) => console.log('Edit series:', series.id),
    },
    {
      label: 'View series',
      icon: Eye,
      onClick: (series) => console.log('View series:', series.id),
    },
    {
      label: 'Delete series',
      icon: Trash2,
      destructive: true,
      onClick: (series) => console.log('Delete series:', series.id),
    },
  ]),
];

/**
 * Content dashboard page component.
 * Displays content management interface for creators.
 *
 * @returns {JSX.Element} The content dashboard page
 */
const Content = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'posts';
  const postsFilterRef = useRef<HTMLInputElement>(null);
  const seriesFilterRef = useRef<HTMLInputElement>(null);

  // Get data from context (fetched on server side)
  const { posts, series } = useAppData();

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
            <TabsTrigger value="posts">All Posts</TabsTrigger>
            <TabsTrigger value="series">Series</TabsTrigger>
          </TabsList>

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
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Content;
