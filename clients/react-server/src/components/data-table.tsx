/* eslint-disable max-params */
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  Table,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { ChevronDown, MoreHorizontal } from 'lucide-react';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  enableSorting?: boolean;
  enableCheckboxes?: boolean;
  enablePagination?: boolean;
  enableColumnFilters?: boolean;
  filterColumn?: string;
  filterInputRef?: React.RefObject<HTMLInputElement | null>;
  className?: string;
  // eslint-disable-next-line no-unused-vars
  onTableReady?: (table: Table<TData>) => void;
}

/**
 * Reusable DataTable component with configurable features
 *
 * @param props - The component props
 * @param props.columns - Array of column definitions
 * @param props.data - Array of data to display
 * @param props.enableSorting - Whether to enable sorting functionality
 * @param props.enableCheckboxes - Whether to enable row selection checkboxes
 * @param props.enablePagination - Whether to enable pagination
 * @param props.enableColumnFilters - Whether to enable column filtering
 * @param props.filterColumn - Column key to filter on
 * @param props.filterInputRef - Ref to an external input controlling the filter
 * @param props.className - Additional CSS classes
 * @param props.onTableReady - Optional callback invoked when the table instance is ready
 * @returns The DataTable component
 */
export const DataTable = <TData, TValue>({
  columns,
  data,
  enableSorting = true,
  enableCheckboxes = false,
  enablePagination = true,
  enableColumnFilters = false,
  filterColumn,
  filterInputRef,
  className,
  onTableReady,
}: DataTableProps<TData, TValue>): React.JSX.Element => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: enableSorting ? setSorting : undefined,
    onColumnFiltersChange: enableColumnFilters ? setColumnFilters : undefined,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableColumnFilters ? getFilteredRowModel() : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: enableCheckboxes ? setRowSelection : undefined,
    enableSorting,
    enableRowSelection: enableCheckboxes,
    state: {
      sorting: enableSorting ? sorting : undefined,
      columnFilters: enableColumnFilters ? columnFilters : undefined,
      columnVisibility,
      rowSelection: enableCheckboxes ? rowSelection : undefined,
    },
  });

  // Call onTableReady callback when table is ready
  React.useEffect(() => {
    if (onTableReady) {
      onTableReady(table);
    }
  }, [table, onTableReady]);

  // Wire external input (via ref) to the table filter
  React.useEffect(() => {
    if (!enableColumnFilters || !filterColumn || !filterInputRef?.current) return;
    const inputEl = filterInputRef.current;
    /**
     * Handle changes from the external input and update the table filter value.
     *
     * @param event - The DOM input event from the external input element
     */
    const handleInput = (event: Event): void => {
      const target = event.target as HTMLInputElement;
      table.getColumn(filterColumn)?.setFilterValue(target.value);
    };

    // Initialize from current input value
    table.getColumn(filterColumn)?.setFilterValue(inputEl.value);

    inputEl.addEventListener('input', handleInput);
    return () => {
      inputEl.removeEventListener('input', handleInput);
    };
  }, [enableColumnFilters, filterColumn, filterInputRef, table]);

  // Keep external input value in sync when filter state changes elsewhere
  React.useEffect(() => {
    if (!enableColumnFilters || !filterColumn || !filterInputRef?.current) return;
    const value = (table.getColumn(filterColumn)?.getFilterValue() as string) ?? '';
    if (filterInputRef.current.value !== value) {
      filterInputRef.current.value = value;
    }
  }, [columnFilters, enableColumnFilters, filterColumn, filterInputRef, table]);

  return (
    <div className={`font-base text-main-foreground w-full ${className || ''}`}>
      <div>
        <UITable>
          <TableHeader className="font-heading">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="bg-accent" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="text-foreground px-3 text-sm leading-5" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="text-foreground data-[state=selected]:bg-primary data-[state=selected]:text-white"
                  key={row.id}
                  data-state={enableCheckboxes && row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className={`px-3 py-2 ${cell.column.id === 'actions' ? 'text-right' : ''}`}
                      key={cell.id}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UITable>
      </div>
      {enablePagination && (
        <div className="flex items-center justify-end space-x-2 py-4">
          {enableCheckboxes && (
            <div className="text-foreground flex-1 text-sm">
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
          )}
          <div className="flex items-center gap-5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions for creating common column types
/**
 * Creates a select column for checkboxes
 *
 * @returns A column definition for checkboxes
 */
export const createSelectColumn = <TData,>(): ColumnDef<TData> => {
  return {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
};

/**
 * Creates a sortable header column
 *
 * @param accessorKey - The data accessor key
 * @param header - The header text or component
 * @param cell - Optional custom cell renderer
 * @returns A column definition with sortable header
 */
export const createSortableHeader = <TData, TValue>(
  accessorKey: string,
  // eslint-disable-next-line no-unused-vars
  header: string | ((columnProps: any) => React.ReactNode),
  // eslint-disable-next-line no-unused-vars
  cell?: (rowProps: any) => React.ReactNode,
): ColumnDef<TData, TValue> => {
  return {
    accessorKey,
    header: ({ column }) => {
      if (typeof header === 'function') {
        return header({ column });
      }

      const isSorted = column.getIsSorted();
      return (
        <p
          className="flex cursor-pointer items-center gap-1 text-sm leading-5 select-none"
          onClick={() => column.toggleSorting(isSorted === 'asc')}
        >
          {header}
          <ChevronDown className={`h-4 w-4 ${isSorted === 'desc' ? 'rotate-180' : ''}`} />
        </p>
      );
    },
    cell: cell || (({ row }) => <div>{row.getValue(accessorKey)}</div>),
  };
};

/**
 * Creates a simple column with optional sorting
 *
 * @param accessorKey - The data accessor key
 * @param header - The column header text
 * @param sortable - Whether the column should be sortable
 * @param cell - Optional custom cell renderer
 * @returns A column definition
 */
export const createSimpleColumn = <TData, TValue>(
  accessorKey: string,
  header: string,
  sortable: boolean = false,
  // eslint-disable-next-line no-unused-vars
  cell?: (rowProps: any) => React.ReactNode,
): ColumnDef<TData, TValue> => {
  if (!sortable) {
    return {
      accessorKey,
      header,
      cell: cell || (({ row }) => <div>{row.getValue(accessorKey)}</div>),
    };
  }

  return createSortableHeader(accessorKey, header, cell);
};

/**
 * Creates a simple actions column with dropdown menu
 *
 * @param actions - Array of action objects with label, onClick, optional icon, and optional destructive variant
 * @returns An actions column definition
 */
export const createActionsColumn = <TData,>(
  actions: Array<{
    label: string;
    // eslint-disable-next-line no-unused-vars
    onClick: (row: TData) => void;
    className?: string;
    icon?: React.ComponentType<{ className?: string }>;
    destructive?: boolean;
  }>,
): ColumnDef<TData> => {
  return {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const data = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" shadow={false} className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <DropdownMenuItem
                  key={index}
                  onClick={() => action.onClick(data)}
                  className={action.className}
                  variant={action.destructive ? 'destructive' : undefined}
                >
                  {IconComponent && <IconComponent />}
                  {action.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };
};
