import { cn } from '../lib/utils';

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
        <div className="absolute -top-[5px] left-[5px] h-[5px] w-[calc(100%-10px)] bg-black"></div>
        <div className="absolute -bottom-[5px] left-[5px] h-[5px] w-[calc(100%-10px)] bg-black"></div>
        <div className="absolute top-[5px] -left-[5px] h-[calc(100%-10px)] w-[5px] bg-black"></div>
        <div className="absolute top-[5px] -right-[5px] h-[calc(100%-10px)] w-[5px] bg-black"></div>
        <div className="absolute top-0 left-0 size-[5px] bg-black"></div>
        <div className="absolute bottom-0 left-0 size-[5px] bg-black"></div>
        <div className="absolute top-0 right-0 size-[5px] bg-black"></div>
        <div className="absolute right-0 bottom-0 size-[5px] bg-black"></div>
      </div>
    </div>
  );
};

export default FormCard;
