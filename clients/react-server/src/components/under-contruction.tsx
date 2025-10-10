import { Construction } from 'lucide-react';
import { JSX } from 'react';

/**
 * Under construction page component.
 * Displays a message indicating the page is under construction.
 *
 * @returns {JSX.Element} The under construction page
 */
export default function UnderContruction(): JSX.Element {
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
