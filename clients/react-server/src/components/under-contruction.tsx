import { Construction } from 'lucide-react';

export default function UnderContruction() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4 p-5">
        <Construction className="size-[60px]" />
        <h1 className="text-4xl">Under Construction</h1>
        <p className="text-lg">This page is under construction. Please check back later.</p>
      </div>
    </div>
  );
}
