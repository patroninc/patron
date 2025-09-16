import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { SquarePen } from 'lucide-react';
import { JSX } from 'react';
import PxBorder from './px-border';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

/**
 *
 * @param {object} props - Props to be passed to the About component.
 * @param {string} props.joined - The date the user joined the platform.
 * @param {string} props.about - The user's about text.
 * @returns {JSX.Element} The About component
 */
export default function About({ joined, about }: { joined: string; about: string }): JSX.Element {
  return (
    <div className="flex flex-col items-end gap-5">
      <div className="relative flex flex-col gap-10 bg-white p-5">
        <PxBorder width={3} radius="lg" />
        <p className="text-lg">{about}</p>
        <p className="text-base">Joined {joined}</p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="lg" containerClassName="w-max" variant="secondary">
            Edit
            <SquarePen />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit about section</AlertDialogTitle>
          </AlertDialogHeader>
          <Textarea maxCharacters={500} defaultValue={about} />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
