import { cn } from '@/lib/utils';
import PxBorder from '@/components/px-border';

export interface FormCardProps {
  children?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

/**
 *
 * @param formCardProps - The props for the FormCard component, including children, title, description, and className.
 * @returns A styled card component for forms.
 */
const FormCard = (formCardProps: FormCardProps): React.ReactElement => {
  const { children, title, description, className } = formCardProps;
  return (
    <div className="w-full max-w-[456px] min-w-[350px] p-[5px] max-[360px]:min-w-full">
      <div
        className={cn(
          'bg-secondary-primary relative w-full max-w-[446px] px-5 py-10 sm:px-10',
          className,
        )}
      >
        <div className="mb-[30px] flex flex-col gap-5 text-center">
          <h1 className="text-2xl sm:text-3xl">{title}</h1>
          <p className="text-sm sm:text-base">{description}</p>
        </div>
        {children}
        <PxBorder width={5} radius="lg" />
      </div>
    </div>
  );
};

export default FormCard;
