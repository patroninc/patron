import { JSX, useState } from 'react';
import { useSlate } from 'slate-react';
import { Link, Unlink } from 'lucide-react';
import { Button } from './index';
import { isLinkActive, insertLink, unwrapLink } from './utils';

/**
 * Button component for link operations
 *
 * @returns Link button component
 */
const LinkButton = (): JSX.Element => {
  const editor = useSlate();
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [url, setUrl] = useState('');

  /**
   * Handle link button click
   */
  const handleClick = (): void => {
    if (isLinkActive(editor)) {
      unwrapLink(editor);
    } else {
      setIsPromptOpen(true);
    }
  };

  /**
   * Handle URL submission
   */
  const handleSubmit = (): void => {
    if (url.trim()) {
      insertLink(editor, url.trim());
      setUrl('');
      setIsPromptOpen(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = (): void => {
    setUrl('');
    setIsPromptOpen(false);
  };

  if (isPromptOpen) {
    return (
      <div className="flex items-center gap-2 rounded border border-gray-300 bg-white p-2">
        <input
          type="url"
          placeholder="Enter URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              handleCancel();
            }
          }}
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          autoFocus
        />
        <Button onClick={handleSubmit} className="h-6 w-6 p-0">
          <span className="text-xs">✓</span>
        </Button>
        <Button onClick={handleCancel} className="h-6 w-6 p-0">
          <span className="text-xs">✕</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      active={isLinkActive(editor)}
      onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => event.preventDefault()}
      onClick={handleClick}
    >
      {isLinkActive(editor) ? <Unlink className="h-4 w-4" /> : <Link className="h-4 w-4" />}
    </Button>
  );
};

export default LinkButton;
