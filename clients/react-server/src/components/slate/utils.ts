import { Editor, Element as SlateElement, Transforms, Range } from 'slate';
import { CustomEditor, CustomElementType, CustomTextKey, ListType } from './types';

/**
 * Check if a text format mark is active in the editor
 *
 * @param editor - The Slate editor instance
 * @param format - The format to check
 * @returns True if the format is active
 */
// eslint-disable-next-line max-params
export const isMarkActive = (editor: CustomEditor, format: CustomTextKey): boolean => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

/**
 * Toggle a text format mark in the editor
 *
 * @param editor - The Slate editor instance
 * @param format - The format to toggle
 */
// eslint-disable-next-line max-params
export const toggleMark = (editor: CustomEditor, format: CustomTextKey): void => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

/**
 * Check if a block format is active in the editor
 *
 * @param editor - The Slate editor instance
 * @param format - The format to check
 * @returns True if the format is active
 */
// eslint-disable-next-line max-params
export const isBlockActive = (editor: CustomEditor, format: CustomElementType): boolean => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => {
        if (!Editor.isEditor(n) && SlateElement.isElement(n)) {
          return n.type === format;
        }
        return false;
      },
    }),
  );

  return !!match;
};

/**
 * Check if a format is a list type
 *
 * @param format - The format to check
 * @returns True if it's a list type
 */
export const isListType = (format: CustomElementType): format is ListType => {
  return ['numbered-list', 'bulleted-list'].includes(format);
};

/**
 * Toggle a block format in the editor
 *
 * @param editor - The Slate editor instance
 * @param format - The format to toggle
 */
// eslint-disable-next-line max-params
export const toggleBlock = (editor: CustomEditor, format: CustomElementType): void => {
  const isActive = isBlockActive(editor, format);
  const isList = isListType(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      isListType(n.type as CustomElementType) &&
      !isList,
    split: true,
  });

  let newProperties: Partial<SlateElement>;
  newProperties = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  };
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

/**
 * Check if a link is active in the editor
 *
 * @param editor - The Slate editor instance
 * @returns True if a link is active
 */
// eslint-disable-next-line max-params
export const isLinkActive = (editor: CustomEditor): boolean => {
  const [link] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  });
  return !!link;
};

/**
 * Insert a link at the current selection
 *
 * @param editor - The Slate editor instance
 * @param url - The URL to link to
 */
// eslint-disable-next-line max-params
export const insertLink = (editor: CustomEditor, url: string): void => {
  if (editor.selection) {
    wrapLink(editor, url);
  }
};

/**
 * Remove a link from the current selection
 *
 * @param editor - The Slate editor instance
 */
export const unwrapLink = (editor: CustomEditor): void => {
  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  });
};

/**
 * Wrap the current selection with a link
 *
 * @param editor - The Slate editor instance
 * @param url - The URL to link to
 */
// eslint-disable-next-line max-params
export const wrapLink = (editor: CustomEditor, url: string): void => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type: 'link' as const,
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

/**
 * Insert an image at the current selection
 *
 * @param editor - The Slate editor instance
 * @param url - The image URL
 * @param alt - The alt text for the image
 */
// eslint-disable-next-line max-params
export const insertImage = (editor: CustomEditor, url: string, alt = ''): void => {
  const image = { type: 'image' as const, url, alt, children: [{ text: '' }] };
  Transforms.insertNodes(editor, image);
};
