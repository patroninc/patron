import * as React from 'react';

import { cn } from '@/lib/utils';
import { JSX } from 'react';
import PxBorder from '@/components/px-border';

/**
 *
 * @param {object} props - Props to be passed to the Table component.
 * @param {string} props.className - Additional class names to be applied to the Table component.
 * @returns The Table component.
 */
const Table = ({ className, ...props }: React.ComponentProps<'table'>): JSX.Element => {
  return (
    <div data-slot="table-container" className="relative m-[3px]">
      <div className="relative w-full overflow-x-auto">
        <table
          data-slot="table"
          className={cn('w-full caption-bottom text-sm', className)}
          {...props}
        />
      </div>
      <PxBorder width={3} radius="md" />
    </div>
  );
};

/**
 *
 * @param {object} props - Props to be passed to the TableHeader component.
 * @param {string} props.className - Additional class names to be applied to the TableHeader component.
 * @returns The TableHeader component.
 */
const TableHeader = ({ className, ...props }: React.ComponentProps<'thead'>): JSX.Element => {
  return (
    <thead
      data-slot="table-header"
      className={cn('[&_tr]:border-b-3 [&_tr]:border-b-black', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the TableBody component.
 * @param {string} props.className - Additional class names to be applied to the TableBody component.
 * @returns The TableBody component.
 */
const TableBody = ({ className, ...props }: React.ComponentProps<'tbody'>): JSX.Element => {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the TableFooter component.
 * @param {string} props.className - Additional class names to be applied to the TableFooter component.
 * @returns The TableFooter component.
 */
const TableFooter = ({ className, ...props }: React.ComponentProps<'tfoot'>): JSX.Element => {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the TableRow component.
 * @param {string} props.className - Additional class names to be applied to the TableRow component.
 * @returns The TableRow component.
 */
const TableRow = ({ className, ...props }: React.ComponentProps<'tr'>): JSX.Element => {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'data-[state=selected]:bg-muted bg-secondary-primary border-b-3 border-b-black',
        className,
      )}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the TableHead component.
 * @param {string} props.className - Additional class names to be applied to the TableHead component.
 * @returns The TableHead component.
 */
const TableHead = ({ className, ...props }: React.ComponentProps<'th'>): JSX.Element => {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'text-foreground h-10 px-2 text-left align-middle font-bold whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the TableCell component.
 * @param {string} props.className - Additional class names to be applied to the TableCell component.
 * @returns The TableCell component.
 */
const TableCell = ({ className, ...props }: React.ComponentProps<'td'>): JSX.Element => {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  );
};

/**
 *
 * @param {object} props - Props to be passed to the TableCaption component.
 * @param {string} props.className - Additional class names to be applied to the TableCaption component.
 * @returns The TableCaption component.
 */
const TableCaption = ({ className, ...props }: React.ComponentProps<'caption'>): JSX.Element => {
  return (
    <caption
      data-slot="table-caption"
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    />
  );
};

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
