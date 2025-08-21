import { cn } from "~/lib/utils";

function FormCard({
  children,
  title,
  description,
  className,
}: {
  children?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className="max-w-[456px] p-[5px] w-full">
      <div
        className={cn(
          "bg-secondary-primary max-w-[446px] w-full relative sm:px-10 px-5 py-10",
          className,
        )}
      >
        <div className="flex flex-col text-center gap-5 mb-[30px]">
          <h1 className="sm:text-3xl text-2xl">{title}</h1>
          <p className="sm:text-base text-sm">{description}</p>
        </div>
        {children}
        <div className="absolute w-[calc(100%-10px)] h-[5px] left-[5px] -top-[5px] bg-black"></div>
        <div className="absolute w-[calc(100%-10px)] h-[5px] left-[5px] -bottom-[5px] bg-black"></div>
        <div className="absolute h-[calc(100%-10px)] w-[5px] -left-[5px] top-[5px] bg-black"></div>
        <div className="absolute h-[calc(100%-10px)] w-[5px] -right-[5px] top-[5px] bg-black"></div>
        <div className="absolute bg-black size-[5px] left-0 top-0"></div>
        <div className="absolute bg-black size-[5px] left-0 bottom-0"></div>
        <div className="absolute bg-black size-[5px] right-0 top-0"></div>
        <div className="absolute bg-black size-[5px] right-0 bottom-0"></div>
      </div>
    </div>
  );
}

export default FormCard;
