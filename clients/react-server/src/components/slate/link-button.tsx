import { JSX, useState } from 'react';
import { useSlate } from 'slate-react';
import { Link, Unlink } from 'lucide-react';
import { Button as SlateButton } from './index';
import { Button } from '@/components/ui/button';
import { isLinkActive, insertLink, unwrapLink } from './utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Button component for link operations
 *
 * @returns Link button component
 */
const LinkButton = (): JSX.Element => {
  const editor = useSlate();
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  /**
   * Handle link button click
   */
  const handleClick = (): void => {
    if (isLinkActive(editor)) {
      unwrapLink(editor);
    } else {
      setIsOpen(true);
    }
  };

  /**
   * Handle URL submission
   */
  const handleSubmit = (): void => {
    if (url.trim()) {
      insertLink(editor, url.trim(), linkText.trim());
      setUrl('');
      setLinkText('');
      setIsOpen(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = (): void => {
    setUrl('');
    setLinkText('');
    setIsOpen(false);
  };

  /**
   * Handle key down events in the popover
   *
   * @param e - The keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <SlateButton
          active={isLinkActive(editor)}
          onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => event.preventDefault()}
          onClick={handleClick}
        >
          {isLinkActive(editor) ? <Unlink className="h-4 w-4" /> : <Link className="h-4 w-4" />}
        </SlateButton>
      </PopoverTrigger>
      <PopoverContent className="w-80" sideOffset={20} onKeyDown={handleKeyDown}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link-url">Link URL</Label>
            <Input
              id="link-url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link-text">Link Text (optional)</Label>
            <Input
              id="link-text"
              type="text"
              placeholder="Display text for the link"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              shadow={false}
              onClick={handleCancel}
              className="h-8 px-3"
            >
              Cancel
            </Button>
            <Button
              type="button"
              shadow={false}
              onClick={handleSubmit}
              disabled={!url.trim()}
              className="h-8 px-3"
            >
              Add Link
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LinkButton;
