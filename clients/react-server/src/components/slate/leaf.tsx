import { JSX } from 'react';
import { RenderLeafProps } from 'slate-react';

/**
 * Custom render function for Slate text leaves (formatted text)
 *
 * @param props - Leaf render props
 * @param props.attributes - Leaf attributes
 * @param props.children - Leaf children
 * @param props.leaf - Leaf data
 * @returns Rendered leaf with formatting
 */
const Leaf = ({ attributes, children, leaf }: RenderLeafProps): JSX.Element => {
  let formattedChildren = children;

  if (leaf.bold) {
    formattedChildren = <strong>{formattedChildren}</strong>;
  }

  if (leaf.italic) {
    formattedChildren = <em>{formattedChildren}</em>;
  }

  if (leaf.underline) {
    formattedChildren = <u>{formattedChildren}</u>;
  }

  return <span {...attributes}>{formattedChildren}</span>;
};

export default Leaf;
