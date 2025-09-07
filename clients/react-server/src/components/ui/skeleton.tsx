import { JSX } from 'react';
import { cn } from '../../lib/utils';

/**
 *
 * @param {object} props - Props for the Skeleton component
 * @param {string} props.className - Additional class names for styling
 * @returns {JSX.Element} The Skeleton component
 */
const Skeleton = ({ className, ...props }: React.ComponentProps<'div'>): JSX.Element => {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  );
};

export { Skeleton };
