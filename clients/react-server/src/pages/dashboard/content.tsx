import { JSX, useRef } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';

import MainLayout from '@/layouts/main';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DataTable, createSimpleColumn, createActionsColumn } from '@/components/data-table';
import { Button } from '@/components/ui/button';

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

// Mock data
const postsData: Post[] = [
  {
    id: '1',
    postNumber: 1,
    title: 'Getting Started with React',
    publishedAt: '2024-01-15',
  },
  {
    id: '2',
    postNumber: 2,
    title: 'Advanced TypeScript Patterns',
    publishedAt: '2024-01-20',
  },
  {
    id: '3',
    postNumber: 3,
    title: 'Building Scalable APIs',
    publishedAt: '2024-01-25',
  },
];

const serialsData: Serial[] = [
  {
    id: '1',
    title: 'Web Development Series',
    description: 'A comprehensive guide to modern web development',
  },
  {
    id: '2',
    title: 'React Masterclass',
    description: 'Deep dive into React patterns and best practices',
  },
  {
    id: '3',
    title: 'Backend Architecture',
    description: 'Building robust and scalable backend systems',
  },
];

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
  const postsFilterRef = useRef<HTMLInputElement>(null);
  const serialsFilterRef = useRef<HTMLInputElement>(null);

  return (
    <MainLayout>
      <div className="p-[50px]">
        <h1 className="mb-[50px] text-5xl">Content</h1>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList>
            <TabsTrigger value="posts">All Posts</TabsTrigger>
            <TabsTrigger value="serials">Serials</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="mb-5 flex items-center justify-between">
              <Input ref={postsFilterRef} placeholder="Search posts..." className="md:text-base" />

              <Button>
                New post
                <Plus />
              </Button>
            </div>
            <DataTable
              columns={postsColumns}
              data={postsData}
              enableSorting={true}
              enableCheckboxes={false}
              enablePagination={true}
              enableColumnFilters={true}
              filterColumn="title"
              filterInputRef={postsFilterRef}
            />
          </TabsContent>

          <TabsContent value="serials">
            <div className="mb-5 flex items-center justify-between">
              <Input
                ref={serialsFilterRef}
                placeholder="Search serials..."
                className="md:text-base"
              />

              <Button>
                New serial
                <Plus />
              </Button>
            </div>
            <DataTable
              columns={serialsColumns}
              data={serialsData}
              enableSorting={true}
              enableCheckboxes={false}
              enablePagination={true}
              enableColumnFilters={true}
              filterColumn="title"
              filterInputRef={serialsFilterRef}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Content;
