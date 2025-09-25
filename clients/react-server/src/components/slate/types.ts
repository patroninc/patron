import { BaseEditor, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

// Text formatting types
export type CustomTextKey = 'bold' | 'italic' | 'underline' | 'strikethrough';

export type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
};

// Element types
export type CustomElementType =
  | 'paragraph'
  | 'heading-one'
  | 'heading-two'
  | 'block-quote'
  | 'numbered-list'
  | 'bulleted-list'
  | 'list-item'
  | 'link'
  | 'image';

export type CustomElement = {
  type: CustomElementType;
  children: CustomText[];
  url?: string;
  alt?: string;
};

// Editor type
export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

// List types
export const LIST_TYPES = ['numbered-list', 'bulleted-list'] as const;
export type ListType = (typeof LIST_TYPES)[number];

// Initial value type
export type InitialValue = Descendant[];

// Declare module augmentation for Slate
declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
