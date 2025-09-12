import { JSX } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import MainLayout from '@/layouts/main';
import {
  DataTable,
  createSelectColumn,
  createSimpleColumn,
  createActionsColumn,
} from '@/components/data-table';

// User data types and placeholder data
export type User = {
  id: string;
  name: string;
  email: string;
  tier: 'supporter' | 'supporter+' | 'fan';
  createdAt: string;
  lastLogin: string;
};

const userData: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    tier: 'supporter',
    createdAt: '2024-01-15',
    lastLogin: '2024-01-20',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    tier: 'supporter+',
    createdAt: '2024-01-16',
    lastLogin: '2024-01-19',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    tier: 'fan',
    createdAt: '2024-01-17',
    lastLogin: '2024-01-18',
  },
];

// Column definitions using simplified helpers
const userColumns: ColumnDef<User>[] = [
  createSelectColumn<User>(),
  createSimpleColumn('name', 'Name', false, ({ row }) => (
    <div className="font-medium">{row.getValue('name')}</div>
  )),
  createSimpleColumn('email', 'Email', false, ({ row }) => (
    <div className="lowercase">{row.getValue('email')}</div>
  )),
  createSimpleColumn('tier', 'Tier', false),
  createSimpleColumn('createdAt', 'Created', true, ({ row }) => {
    const date = new Date(row.getValue('createdAt'));
    return <div>{date.toLocaleDateString()}</div>;
  }),
  createSimpleColumn('lastLogin', 'Last Login', true, ({ row }) => {
    const date = new Date(row.getValue('lastLogin'));
    return <div>{date.toLocaleDateString()}</div>;
  }),
  createActionsColumn<User>([
    {
      label: 'Copy user ID',
      onClick: (user) => navigator.clipboard.writeText(user.id),
    },
    {
      label: 'Edit user',
      onClick: (user) => console.log('Edit user:', user.id),
    },
    {
      label: 'View profile',
      onClick: (user) => console.log('View profile:', user.id),
    },
    {
      label: 'Delete user',
      onClick: (user) => console.log('Delete user:', user.id),
      className: 'text-red-600',
    },
  ]),
];

/**
 * Audience dashboard page component.
 * Displays audience demographics and engagement data.
 *
 * @returns {JSX.Element} The audience dashboard page
 */
const Audience = (): JSX.Element => {
  return (
    <MainLayout>
      <main className="p-[50px]">
        <h1 className="mb-[50px] text-5xl">Audience</h1>
        <DataTable
          columns={userColumns}
          data={userData}
          enableSorting={true}
          enableCheckboxes={true}
          enablePagination={true}
          enableColumnFilters={true}
          filterPlaceholder="Search users..."
          filterColumn="name"
        />
      </main>
    </MainLayout>
  );
};

export default Audience;
