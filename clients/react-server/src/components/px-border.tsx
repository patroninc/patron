import { type JSX } from 'react';
import { cn } from '@/lib/utils';

type PxBorderProps = {
  /** Thickness of the pixel border in CSS pixels. Allowed: 2 | 3 | 5 */
  width?: 2 | 3 | 5;
  /** Border style: "md" for 4 sides only, "lg" for 8 parts with corners */
  radius?: 'md' | 'lg';
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
 * @param {number} props.width - The thickness of the pixel border in CSS pixels (2 | 3 | 5).
 * @param {string} props.radius - Border style: "md" for 4 sides only, "lg" for 8 parts with corners.
 * @param {string} props.className - Additional class names to be applied to the PxBorder component.
 * @returns {JSX.Element} The PxBorder component.
 */
const PxBorder = ({ width = 3, radius = 'lg', className }: PxBorderProps): JSX.Element => {
  const px = width === 2 || width === 3 || width === 5 ? width : 3;
  const clsMap = {
    2: {
      edgeH: 'h-[2px]',
      edgeW: 'w-[2px]',
      lenW: 'w-[calc(100%-4px)]',
      lenH: 'h-[calc(100%-4px)]',
      offP: 'left-[2px]',
      offN: '-left-[2px]',
      offTopN: '-top-[2px]',
      offBotN: '-bottom-[2px]',
      rightN: '-right-[2px]',
      topP: 'top-[2px]',
      corner: 'size-[2px]',
    },
    3: {
      edgeH: 'h-[3px]',
      edgeW: 'w-[3px]',
      lenW: 'w-[calc(100%-6px)]',
      lenH: 'h-[calc(100%-6px)]',
      offP: 'left-[3px]',
      offN: '-left-[3px]',
      offTopN: '-top-[3px]',
      offBotN: '-bottom-[3px]',
      rightN: '-right-[3px]',
      topP: 'top-[3px]',
      corner: 'size-[3px]',
    },
    5: {
      edgeH: 'h-[5px]',
      edgeW: 'w-[5px]',
      lenW: 'w-[calc(100%-10px)]',
      lenH: 'h-[calc(100%-10px)]',
      offP: 'left-[5px]',
      offN: '-left-[5px]',
      offTopN: '-top-[5px]',
      offBotN: '-bottom-[5px]',
      rightN: '-right-[5px]',
      topP: 'top-[5px]',
      corner: 'size-[5px]',
    },
  } as const;
  const C = clsMap[px];

  return (
    <>
      {radius === 'lg' && (
        <>
          <div className={cn('absolute bg-black', C.offTopN, C.offP, C.edgeH, C.lenW, className)} />
          <div className={cn('absolute bg-black', C.offBotN, C.offP, C.edgeH, C.lenW, className)} />
          <div className={cn('absolute bg-black', C.topP, C.offN, C.edgeW, C.lenH, className)} />
          <div className={cn('absolute bg-black', C.topP, C.rightN, C.edgeW, C.lenH, className)} />
          <div className={cn('absolute bg-black', 'top-0 left-0', C.corner, className)} />
          <div className={cn('absolute bg-black', 'top-0 right-0', C.corner, className)} />
          <div className={cn('absolute bg-black', 'bottom-0 left-0', C.corner, className)} />
          <div className={cn('absolute bg-black', 'right-0 bottom-0', C.corner, className)} />
        </>
      )}

      {radius === 'md' && (
        <>
          <div
            className={cn('absolute bg-black', C.offTopN, C.edgeH, 'left-0 w-full', className)}
          />
          <div
            className={cn('absolute bg-black', C.offBotN, C.edgeH, 'left-0 w-full', className)}
          />
          <div className={cn('absolute bg-black', C.offN, C.edgeW, 'top-0 h-full', className)} />
          <div className={cn('absolute bg-black', C.rightN, C.edgeW, 'top-0 h-full', className)} />
        </>
      )}
    </>
  );
};

export default PxBorder;
