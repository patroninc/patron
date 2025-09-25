import isHotkey from 'is-hotkey';
import isUrl from 'is-url';
import React, { JSX, KeyboardEvent, PointerEvent, useCallback, useMemo } from 'react';
import { Descendant, createEditor, Range, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  useSlate,
  useSelected,
  withReact,
} from 'slate-react';
import { Button } from './index';
import BlockButton from './block-button';
import MarkButton from './mark-button';
import LinkButton from './link-button';
import TextSizeSelect from './text-size-select';
import { Undo2Icon, Redo2Icon } from 'lucide-react';
import { CustomTextKey, CustomEditor, CustomElement } from './types';
import { toggleMark } from './utils';
import PxBorder from '@/components/px-border';

/**
 * Put this at the start and end of an inline component to work around this Chromium bug:
 * https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
 *
 * @returns Chromium bug fix component
 */
const InlineChromiumBugfix = (): JSX.Element => (
  <span contentEditable={false} style={{ fontSize: 0 }}>
    {String.fromCodePoint(160) /* Non-breaking space */}
  </span>
);

const HOTKEYS: Record<string, CustomTextKey> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
};

const HISTORY_HOTKEYS = {
  'mod+z': 'undo',
  'mod+y': 'redo',
  'mod+shift+z': 'redo',
};

/**
 * Enhance editor with inline element support
 *
 * @param editor - The Slate editor instance
 * @returns Enhanced editor with inline support
 */
const withInlines = (editor: CustomEditor): CustomEditor => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = (element: CustomElement) =>
    ['link'].includes(element.type) || isInline(element);

  editor.insertText = (text: string) => {
    if (text && isUrl(text)) {
      // Import wrapLink from utils
      const { wrapLink } = require('./utils');
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = (data: DataTransfer) => {
    const text = data.getData('text/plain');

    if (text && isUrl(text)) {
      const { wrapLink } = require('./utils');
      wrapLink(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

/**
 * Allowed URL schemes for security
 */
const allowedSchemes = ['http:', 'https:', 'mailto:', 'tel:'];

/**
 * Link component with URL validation and selection highlighting
 *
 * @param props - Element render props
 * @param props.attributes - Element attributes
 * @param props.children - Element children
 * @param props.element - Element data
 * @returns Rendered link element
 */
const LinkComponent = ({ attributes, children, element }: RenderElementProps): JSX.Element => {
  const selected = useSelected();
  const safeUrl = useMemo(() => {
    if (!element.url) return 'about:blank';

    let parsedUrl: URL | null = null;
    try {
      parsedUrl = new URL(element.url);
    } catch {
      // Invalid URL
    }
    if (parsedUrl && allowedSchemes.includes(parsedUrl.protocol)) {
      return parsedUrl.href;
    }
    return 'about:blank';
  }, [element.url]);

  return (
    <a
      {...attributes}
      href={safeUrl}
      className={`inline text-black underline ${selected ? 'rounded-none ring-2 ring-black ring-offset-1' : ''}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </a>
  );
};

interface RichTextEditorProps {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
  placeholder?: string;
}

/**
 * Rich text editor component with formatting toolbar
 *
 * @param props - Editor props
 * @param props.value - The editor value (used as initialValue for Slate)
 * @param props.onChange - Change handler for editor content
 * @param props.placeholder - Placeholder text for the editor
 * @returns Rich text editor component
 */
const RichTextEditor = (props: RichTextEditorProps): JSX.Element => {
  const { value, onChange, placeholder = 'Enter some rich text…' } = props;
  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, []);
  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);
  const editor = useMemo(() => withInlines(withHistory(withReact(createEditor()))), []);

  return (
    <div className="relative m-[3px] bg-white">
      <Slate editor={editor} initialValue={value} onChange={onChange}>
        <div className="bg-accent flex items-center gap-2 border-b-3 border-b-black p-2">
          <HistoryButton action="undo" icon={<Undo2Icon className="h-4 w-4" />} />
          <HistoryButton action="redo" icon={<Redo2Icon className="h-4 w-4" />} />
          <TextSizeSelect />
          <MarkButton format="bold" />
          <MarkButton format="italic" />
          <MarkButton format="underline" />
          <BlockButton format="bulleted-list" />
          <BlockButton format="numbered-list" />
          <LinkButton />
          <BlockButton format="block-quote" />
        </div>
        <div className="p-5">
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder={placeholder}
            spellCheck
            autoFocus
            onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
              const { selection } = editor;

              // Default left/right behavior is unit:'character'.
              // This fails to distinguish between two cursor positions, such as
              // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
              // Here we modify the behavior to unit:'offset'.
              // This lets the user step into and out of the inline without stepping over characters.
              if (selection && Range.isCollapsed(selection)) {
                if (isHotkey('left', event)) {
                  event.preventDefault();
                  Transforms.move(editor, { unit: 'offset', reverse: true });
                  return;
                }
                if (isHotkey('right', event)) {
                  event.preventDefault();
                  Transforms.move(editor, { unit: 'offset' });
                  return;
                }
              }

              // Handle formatting hotkeys
              for (const hotkey in HOTKEYS) {
                if (isHotkey(hotkey, event as any)) {
                  event.preventDefault();
                  const mark = HOTKEYS[hotkey];
                  toggleMark(editor, mark);
                }
              }

              // Handle history hotkeys
              for (const hotkey in HISTORY_HOTKEYS) {
                if (isHotkey(hotkey, event as any)) {
                  event.preventDefault();
                  const action = HISTORY_HOTKEYS[hotkey as keyof typeof HISTORY_HOTKEYS];
                  if (action === 'undo') {
                    editor.undo();
                  } else if (action === 'redo') {
                    editor.redo();
                  }
                }
              }
            }}
            className="prose min-h-[300px]! max-w-none focus:outline-none"
          />
        </div>
      </Slate>
      <PxBorder width={3} radius="lg" />
    </div>
  );
};

/**
 * Custom element renderer for Slate editor
 *
 * @param props - Element render props
 * @param props.attributes - Element attributes
 * @param props.children - Element children
 * @param props.element - Element data
 * @returns Rendered element
 */
const Element = ({ attributes, children, element }: RenderElementProps): JSX.Element => {
  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote className="my-5 border-l-3 border-black pl-5 italic" {...attributes}>
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul className="my-5 list-inside list-disc space-y-1" {...attributes}>
          {children}
        </ul>
      );
    case 'heading-one':
      return (
        <h1 className="my-5 text-3xl" {...attributes}>
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 className="my-5 text-2xl" {...attributes}>
          {children}
        </h2>
      );
    case 'heading-three':
      return (
        <h3 className="my-5 text-xl" {...attributes}>
          {children}
        </h3>
      );
    case 'heading-four':
      return (
        <h4 className="my-5 text-lg" {...attributes}>
          {children}
        </h4>
      );
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'numbered-list':
      return (
        <ol className="my-5 list-inside list-decimal space-y-1" {...attributes}>
          {children}
        </ol>
      );
    case 'link':
      return <LinkComponent {...{ attributes, children, element }} />;
    default:
      return (
        <p className="my-5" {...attributes}>
          {children}
        </p>
      );
  }
};

/**
 * Custom leaf renderer for formatted text in Slate editor
 *
 * @param props - Leaf render props
 * @param props.attributes - Leaf attributes
 * @param props.children - Leaf children
 * @param props.leaf - Leaf data
 * @returns Rendered leaf with formatting
 */
const Leaf = ({ attributes, children, leaf }: RenderLeafProps): JSX.Element => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return (
    <span
      // The following is a workaround for a Chromium bug where,
      // if you have an inline at the end of a block,
      // clicking the end of a block puts the cursor inside the inline
      // instead of inside the final {text: ''} node
      // https://github.com/ianstormtaylor/slate/issues/4704#issuecomment-1006696364
      style={leaf.text === '' ? { paddingLeft: '0.1px' } : undefined}
      {...attributes}
    >
      {children}
    </span>
  );
};

interface HistoryButtonProps {
  action: 'undo' | 'redo';
  icon: React.ReactElement;
}

/**
 * Button component for editor history actions (undo/redo)
 *
 * @param props - Button props
 * @param props.action - Action type (undo/redo)
 * @param props.icon - Icon element
 * @returns History button component
 */
const HistoryButton = ({ action, icon }: HistoryButtonProps): JSX.Element => {
  const editor = useSlate();

  /**
   * Handle click action for undo/redo
   */
  const handleClick = (): void => {
    if (action === 'undo') {
      editor.undo();
    } else if (action === 'redo') {
      editor.redo();
    }
  };

  return (
    <Button
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => event.preventDefault()}
      onClick={handleClick}
    >
      {icon}
    </Button>
  );
};

/**
 * Initial value for the rich text editor with example content
 */
const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a ' },
      { text: '<textarea>' },
      { text: '!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      { text: ', ' },
      { text: 'italic', italic: true },
      { text: ', ' },
      { text: 'underlined', underline: true },
      {
        text: '. You can also add links!',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Here is a link:' }],
  },
  {
    type: 'link' as const,
    url: 'https://example.com',
    children: [{ text: 'link to example.com' }],
  },
  {
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Try it out for yourself!' }],
  },
];

export default RichTextEditor;
export { initialValue };
