import { JSX, useState } from 'react';
import { useSlate } from 'slate-react';
import { Image } from 'lucide-react';
import { Button } from './index';
import { insertImage } from './utils';
import ImageDialog from './image-dialog';

/**
 * Button component for image insertion
 *
 * @returns Image button component
 */
const ImageButton = (): JSX.Element => {
  const editor = useSlate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /**
   * Handle image button click
   */
  const handleClick = (): void => {
    setIsDialogOpen(true);
  };

  /**
   * Handle image insertion from dialog
   */
  const handleInsert = (url: string, alt: string): void => {
    insertImage(editor, url, alt);
  };

  /**
   * Handle dialog close
   */
  const handleClose = (): void => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => event.preventDefault()}
        onClick={handleClick}
      >
        <Image className="h-4 w-4" />
      </Button>
      <ImageDialog isOpen={isDialogOpen} onClose={handleClose} onInsert={handleInsert} />
    </>
  );
};

export default ImageButton;
