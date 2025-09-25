import { JSX } from 'react';
import { RenderElementProps } from 'slate-react';

/**
 * Custom render function for Slate elements
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
        <blockquote className="my-4 border-l-4 border-black pl-4 italic" {...attributes}>
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
        <h1 className="my-4 text-3xl" {...attributes}>
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 className="my-4 text-2xl" {...attributes}>
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
    case 'link':
      return (
        <a href={element.url} className="text-black hover:underline" {...attributes}>
          {children}
        </a>
      );
    case 'image':
      return (
        <div className="my-4" {...attributes}>
          <img
            src={element.url}
            alt={element.alt || ''}
            className="h-auto max-w-full"
            style={{ maxHeight: '400px' }}
          />
        </div>
      );
    default:
      return (
        <p className="my-2" {...attributes}>
          {children}
        </p>
      );
  }
};

export default Element;
