import { JSX } from 'react';
import { useSlate } from 'slate-react';
import { Type, Hash, Quote, List, ListOrdered } from 'lucide-react';
import { Button } from './index';
import { CustomElementType } from './types';
import { isBlockActive, toggleBlock } from './utils';

interface BlockButtonProps {
  format: CustomElementType;
}

/**
 * Button component for block formatting (headings, lists, etc.)
 *
 * @param props - Button props
 * @param props.format - The block format type
 * @returns Block button component
 */
const BlockButton = ({ format }: BlockButtonProps): JSX.Element => {
  const editor = useSlate();

  /**
   * Get the appropriate icon for the block format
   *
   * @returns Icon element
   */
  const getIcon = (): JSX.Element => {
    switch (format) {
      case 'heading-one':
        return <Type className="h-4 w-4" />;
      case 'heading-two':
        return <Hash className="h-4 w-4" />;
      case 'block-quote':
        return <Quote className="h-4 w-4" />;
      case 'bulleted-list':
        return <List className="h-4 w-4" />;
      case 'numbered-list':
        return <ListOrdered className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  return (
    <Button
      active={isBlockActive(editor, format)}
      onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => event.preventDefault()}
      onClick={() => toggleBlock(editor, format)}
      data-test-id={`block-button-${format}`}
    >
      {getIcon()}
    </Button>
  );
};

export default BlockButton;
