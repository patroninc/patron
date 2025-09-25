import isHotkey from 'is-hotkey';
import React, { JSX, KeyboardEvent, PointerEvent, useCallback, useMemo } from 'react';
import { Descendant, createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  useSlate,
  withReact,
} from 'slate-react';
import { Button } from './index';
import BlockButton from './block-button';
import MarkButton from './mark-button';
import LinkButton from './link-button';
import ImageButton from './image-button';
import { Undo2Icon, Redo2Icon } from 'lucide-react';
import { CustomTextKey } from './types';
import { toggleMark } from './utils';
import PxBorder from '@/components/px-border';

const HOTKEYS: Record<string, CustomTextKey> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+shift+s': 'strikethrough',
};

const HISTORY_HOTKEYS = {
  'mod+z': 'undo',
  'mod+y': 'redo',
  'mod+shift+z': 'redo',
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
 * @param props.value - The editor value
 * @param props.onChange - Change handler
 * @param props.placeholder - Placeholder text
 * @returns Rich text editor component
 */
const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Enter some rich text…',
}: RichTextEditorProps): JSX.Element => {
  const renderElement = useCallback((props: RenderElementProps) => <Element {...props} />, []);
  const renderLeaf = useCallback((props: RenderLeafProps) => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  return (
    <div className="relative m-[3px] bg-white">
      <Slate editor={editor} initialValue={value} onChange={onChange}>
        <div className="bg-accent flex items-center gap-2 border-b-3 border-b-black p-2">
          <HistoryButton action="undo" icon={<Undo2Icon className="h-4 w-4" />} />
          <HistoryButton action="redo" icon={<Redo2Icon className="h-4 w-4" />} />
          <MarkButton format="bold" />
          <MarkButton format="italic" />
          <MarkButton format="underline" />
          <MarkButton format="strikethrough" />
          <LinkButton />
          <ImageButton />
          <BlockButton format="heading-one" />
          <BlockButton format="heading-two" />
          <BlockButton format="block-quote" />
          <BlockButton format="numbered-list" />
          <BlockButton format="bulleted-list" />
        </div>
        <div className="p-4">
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder={placeholder}
            spellCheck
            autoFocus
            onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
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
            className="prose min-h-[300px] max-w-none focus:outline-none"
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
        <blockquote className="my-4 border-l-4 border-neutral-300 pl-4 italic" {...attributes}>
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul className="my-4 list-inside list-disc space-y-1" {...attributes}>
          {children}
        </ul>
      );
    case 'heading-one':
      return (
        <h1 className="my-4 text-3xl font-bold" {...attributes}>
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 className="my-4 text-2xl font-bold" {...attributes}>
          {children}
        </h2>
      );
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'numbered-list':
      return (
        <ol className="my-4 list-inside list-decimal space-y-1" {...attributes}>
          {children}
        </ol>
      );
    default:
      return (
        <p className="my-2" {...attributes}>
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

  return <span {...attributes}>{children}</span>;
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
      { text: ', or ' },
      { text: 'strikethrough', strikethrough: true },
      {
        text: '. You can also add links and images!',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Here is a link and an image:' }],
  },
  {
    type: 'link' as const,
    url: 'https://example.com',
    children: [{ text: 'link to example.com' }],
  },
  {
    type: 'image' as const,
    url: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Sample+Image',
    alt: 'Sample image',
    children: [{ text: '' }],
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
