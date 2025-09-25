import { JSX } from 'react';
import { Button as UIButton } from '@/components/ui/button';

interface SlateButtonProps {
  active?: boolean;
  onPointerDown?: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onClick?: () => void;
  children: JSX.Element;
  'data-test-id'?: string;
  variant?: 'default' | 'secondary';
  disabled?: boolean;
}

/**
 * Custom button component for Slate toolbar
 *
 * @param props - Button props
 * @param props.active - Whether the button is active
 * @param props.onPointerDown - Pointer down handler
 * @param props.onClick - Click handler
 * @param props.children - Button content
 * @param props.data-test-id - Test identifier
 * @returns Button component
 */
const Button = ({
  active,
  onPointerDown,
  onClick,
  children,
  variant,
  disabled,
  ...props
}: SlateButtonProps): JSX.Element => {
  return (
    <UIButton
      type="button"
      variant={variant || (active ? 'default' : 'secondary')}
      size="sm"
      onPointerDown={onPointerDown}
      onClick={onClick}
      className="h-8 w-8 p-0"
      shadow={false}
      disabled={disabled}
      {...props}
    >
      {children}
    </UIButton>
  );
};

export default Button;
