import { JSX } from 'react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import PxBorder from '@/components/px-border';
import FocusRing from '@/components/focus-ring';

interface TextareaProps extends React.ComponentProps<'textarea'> {
  maxCharacters?: number;
}

/**
 * A customizable textarea component with optional character limit and count display.
 *
 * @param {object} props - The component props
 * @param {string} [props.className] - Additional CSS classes to apply to the textarea
 * @param {number} [props.maxCharacters] - Maximum number of characters allowed. When provided, displays character count and enforces limit
 * @param {string} [props.value] - The controlled value of the textarea
 * @param {function} [props.onChange] - Callback function called when the textarea value changes
 * @returns {JSX.Element} A textarea component with optional character limit functionality
 */
const Textarea = ({
  className,
  maxCharacters,
  value,
  onChange,
  ...props
}: TextareaProps): JSX.Element => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [characterCount, setCharacterCount] = React.useState(0);
  const isControlled = value !== undefined;

  // Ensure initial count reflects any defaultValue, SSR content, or browser-filled values
  React.useLayoutEffect(() => {
    if (textareaRef.current) {
      setCharacterCount(textareaRef.current.value.length);
    }
  }, []);

  React.useEffect(() => {
    if (!isControlled) return;
    const currentLength = typeof value === 'string' ? value.length : 0;
    setCharacterCount(currentLength);
  }, [isControlled, value]);

  /**
   * Handles the change event for the textarea.
   *
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - The change event.
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const newValue = e.target.value;
    if (!maxCharacters || newValue.length <= maxCharacters) {
      setCharacterCount(newValue.length);
      onChange?.(e);
    }
  };

  return (
    <div className="relative m-[3px] max-w-full min-w-0">
      <textarea
        data-slot="textarea"
        className={cn(
          'placeholder:text-foreground/50 flex min-h-60 w-full min-w-0 resize-none bg-white px-3 pt-3 pb-10 text-base transition-[color] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        ref={textareaRef}
        maxLength={maxCharacters}
        {...(isControlled ? { value } : {})}
        onChange={handleChange}
        {...props}
      />
      <PxBorder width={3} radius="lg" />
      <FocusRing className="peer-focus-visible:block" width={3} />
      {maxCharacters && (
        <div className="text-foreground pointer-events-none absolute bottom-3 left-3 text-xs">
          {characterCount}/{maxCharacters}
        </div>
      )}
    </div>
  );
};

export { Textarea };
