import { JSX, useRef } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';

import MainLayout from '@/layouts/main';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DataTable, createSimpleColumn, createActionsColumn } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import NewSerialForm from '@/components/new-serial-form';
import { useAppData } from '@/contexts/AppDataContext';
import PxBorder from '@/components/px-border';

// Data types
export type Post = {
  id: string;
  postNumber: number;
  title: string;
  publishedAt: string;
};

export type Serial = {
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

// Column definitions for serials
const serialsColumns: ColumnDef<Serial>[] = [
  createSimpleColumn('title', 'Title', false),
  createSimpleColumn('description', 'Description', false),
  createActionsColumn<Serial>([
    {
      label: 'Edit serial',
      icon: Edit,
      onClick: (serial) => console.log('Edit serial:', serial.id),
    },
    {
      label: 'View serial',
      icon: Eye,
      onClick: (serial) => console.log('View serial:', serial.id),
    },
    {
      label: 'Delete serial',
      icon: Trash2,
      destructive: true,
      onClick: (serial) => console.log('Delete serial:', serial.id),
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
  const postsFilterRef = useRef<HTMLInputElement>(null);
  const serialsFilterRef = useRef<HTMLInputElement>(null);

  // Get data from context (fetched on server side)
  const { posts, series } = useAppData();

  return (
    <MainLayout>
      <div className="p-[50px] px-[100px]">
        <h1 className="mb-[50px] text-5xl">Content</h1>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList>
            <TabsTrigger value="posts">All Posts</TabsTrigger>
            <TabsTrigger value="serials">Serials</TabsTrigger>
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
                  You need to create a serial first before you can create posts.
                </div>
                <NewSerialForm
                  trigger={
                    <Button containerClassName="w-max">
                      Create Serial
                      <Plus />
                    </Button>
                  }
                />
                <PxBorder width={3} radius="lg" />
              </div>
            )}
          </TabsContent>

          <TabsContent className="m-0" value="serials">
            {series ? (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <Input
                    ref={serialsFilterRef}
                    placeholder="Search serials..."
                    className="md:text-base"
                  />

                  <NewSerialForm
                    trigger={
                      <Button>
                        New serial
                        <Plus />
                      </Button>
                    }
                  />
                </div>
                <DataTable
                  columns={serialsColumns}
                  data={series || []}
                  enableSorting={true}
                  enableCheckboxes={false}
                  enablePagination={true}
                  enableColumnFilters={true}
                  filterColumn="title"
                  filterInputRef={serialsFilterRef}
                />
              </>
            ) : (
              <div className="relative m-[3px] flex flex-col items-center justify-center gap-5 bg-white p-10">
                <div className="text-lg">You haven't created any serials yet.</div>
                <NewSerialForm
                  trigger={
                    <Button containerClassName="w-max">
                      New serial
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
