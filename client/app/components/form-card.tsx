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
    <div
      className={cn("bg-secondary-primary w-[446px] relative p-10", className)}
    >
      <div className="flex flex-col text-center gap-5 mb-[30px]">
        <h1 className="text-3xl">{title}</h1>
        <p className="text-base">{description}</p>
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
  );
}

export default FormCard;
