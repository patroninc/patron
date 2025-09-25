import { JSX } from 'react';
import { useSlate } from 'slate-react';
import { Bold, Italic, Underline, Strikethrough } from 'lucide-react';
import { Button } from './index';
import { CustomTextKey } from './types';
import { isMarkActive, toggleMark } from './utils';

interface MarkButtonProps {
  format: CustomTextKey;
}

/**
 * Button component for text formatting (bold, italic, etc.)
 *
 * @param props - Button props
 * @param props.format - The text format type
 * @returns Mark button component
 */
const MarkButton = ({ format }: MarkButtonProps): JSX.Element => {
  const editor = useSlate();

  /**
   * Get the appropriate icon for the text format
   *
   * @returns Icon element
   */
  const getIcon = (): JSX.Element => {
    switch (format) {
      case 'bold':
        return <Bold className="h-4 w-4" />;
      case 'italic':
        return <Italic className="h-4 w-4" />;
      case 'underline':
        return <Underline className="h-4 w-4" />;
      case 'strikethrough':
        return <Strikethrough className="h-4 w-4" />;
      default:
        return <Bold className="h-4 w-4" />;
    }
  };

  return (
    <Button
      active={isMarkActive(editor, format)}
      onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => event.preventDefault()}
      onClick={() => toggleMark(editor, format)}
    >
      {getIcon()}
    </Button>
  );
};

export default MarkButton;
