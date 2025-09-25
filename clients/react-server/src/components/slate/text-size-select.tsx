import { JSX } from 'react';
import { useSlate } from 'slate-react';
import { Type } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustomElementType } from './types';
import { isBlockActive, toggleBlock } from './utils';

interface TextSizeOption {
  value: CustomElementType;
  label: string;
}

const TEXT_SIZE_OPTIONS: TextSizeOption[] = [
  { value: 'paragraph', label: 'Normal' },
  { value: 'heading-one', label: 'Heading 1' },
  { value: 'heading-two', label: 'Heading 2' },
  { value: 'heading-three', label: 'Heading 3' },
  { value: 'heading-four', label: 'Heading 4' },
];

/**
 * Select component for changing text size/heading level in the editor
 *
 * @returns Text size select component
 */
const TextSizeSelect = (): JSX.Element => {
  const editor = useSlate();

  /**
   * Get the current text size/heading level
   *
   * @returns Current text size value
   */
  const getCurrentTextSize = (): CustomElementType => {
    // Check for each heading type in order of priority
    for (const option of TEXT_SIZE_OPTIONS) {
      if (isBlockActive(editor, option.value)) {
        return option.value;
      }
    }
    return 'paragraph'; // Default to paragraph if no heading is active
  };

  /**
   * Handle text size change
   *
   * @param value - The new text size value
   */
  const handleTextSizeChange = (value: string): void => {
    const newType = value as CustomElementType;
    toggleBlock(editor, newType);
  };

  const currentValue = getCurrentTextSize();

  return (
    <Select value={currentValue} onValueChange={handleTextSizeChange}>
      <SelectTrigger size="sm">
        <Type />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TEXT_SIZE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TextSizeSelect;
