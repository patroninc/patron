import { Toaster as Sonner, ToasterProps } from 'sonner';
import { JSX } from 'react';

/**
 *
 * @param {object} props - Props to be passed to the Toaster component.
 * @returns The Toaster component.
 */
const Toaster = ({ ...props }: ToasterProps): JSX.Element => {
  return (
    <Sonner
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
