import { type JSX } from 'react';
import { cn } from '@/lib/utils';

type PxBorderProps = {
  /** Thickness of the pixel border in CSS pixels. Allowed: 2 | 3 */
  width?: 2 | 3;
  /**
   * Optional className for the outer container (positioning, z-index, etc.).
   */
  className?: string;
};

/**
 * Renders a pixel border around its parent using Tailwind classes.
 * Place this inside a relatively positioned container.
 *
 * @param {object} props - Props to be passed to the PxBorder component.
 * @param {number} props.width - The thickness of the pixel border in CSS pixels (2 | 3).
 * @param {string} props.className - Additional class names to be applied to the PxBorder component.
 * @returns {JSX.Element} The PxBorder component.
 */
const PxBorder = ({ width = 3, className }: PxBorderProps): JSX.Element => {
  if (width === 2) {
    return (
      <>
        <div
          className={cn(
            'absolute -top-[4px] left-0 hidden h-0.5 w-4 bg-white group-focus-visible:block',
            className,
          )}
        />
        <div
          className={cn(
            'absolute top-0 -right-[4px] hidden h-4 w-0.5 bg-white group-focus-visible:block',
            className,
          )}
        />
        <div
          className={cn(
            'absolute -bottom-[4px] left-0 hidden h-0.5 w-4 bg-white group-focus-visible:block',
            className,
          )}
        />
        <div
          className={cn(
            'absolute bottom-0 -left-[4px] hidden h-4 w-0.5 bg-white group-focus-visible:block',
            className,
          )}
        />
        <div
          className={cn(
            'absolute -bottom-0.5 -left-0.5 hidden size-0.5 bg-white group-focus-visible:block',
            className,
          )}
        />
        <div
          className={cn(
            'absolute -right-0.5 -bottom-0.5 hidden size-0.5 bg-white group-focus-visible:block',
            className,
          )}
        />
        <div
          className={cn(
            'absolute -top-0.5 -left-0.5 hidden size-0.5 bg-white group-focus-visible:block',
            className,
          )}
        />
        <div
          className={cn(
            'absolute -top-0.5 -right-0.5 hidden size-0.5 bg-white group-focus-visible:block',
            className,
          )}
        />
      </>
    );
  }

  return (
    <>
      <div
        className={cn(
          'absolute -top-[6px] left-[3px] hidden h-[3px] w-[calc(100%-6px)] bg-white group-focus-visible:block',
          className,
        )}
      />
      <div
        className={cn(
          'absolute -bottom-[6px] left-[3px] hidden h-[3px] w-[calc(100%-6px)] bg-white group-focus-visible:block',
          className,
        )}
      />
      <div
        className={cn(
          'absolute top-[3px] -left-[6px] hidden h-[calc(100%-6px)] w-[3px] bg-white group-focus-visible:block',
          className,
        )}
      />
      <div
        className={cn(
          'absolute top-[3px] -right-[6px] hidden h-[calc(100%-6px)] w-[3px] bg-white group-focus-visible:block',
          className,
        )}
      />
      <div
        className={cn(
          'absolute top-0 -left-[3px] hidden size-[3px] bg-white group-focus-visible:block',
          className,
        )}
      />
      <div
        className={cn(
          'absolute -top-[3px] left-[0] hidden size-[3px] bg-white group-focus-visible:block',
          className,
        )}
      />
      <div
        className={cn(
          'absolute top-0 -right-[3px] hidden size-[3px] bg-white group-focus-visible:block',
          className,
        )}
      />
      <div
        className={cn(
          'absolute -top-[3px] right-[0] hidden size-[3px] bg-white group-focus-visible:block',
          className,
        )}
      />
      <div
        className={cn(
          'absolute bottom-0 -left-[3px] hidden size-[3px] bg-white group-focus-visible:block',
          className,
        )}
      />
      <div
        className={cn(
          'absolute -bottom-[3px] left-[0] hidden size-[3px] bg-white group-focus-visible:block',
          className,
        )}
      />
      <div
        className={cn(
          'absolute -right-[3px] bottom-0 hidden size-[3px] bg-white group-focus-visible:block',
          className,
        )}
      />
      <div
        className={cn(
          'absolute right-[0] -bottom-[3px] hidden size-[3px] bg-white group-focus-visible:block',
          className,
        )}
      />
    </>
  );
};

export default PxBorder;
