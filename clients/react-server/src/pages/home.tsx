import { Link2, CalendarDays, PlusIcon, SquarePen, Pencil } from 'lucide-react';
import MainLayout from '../layouts/main';
import { JSX } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PxBorder from '@/components/px-border';
import { Link } from 'react-router';
import FocusRing from '@/components/focus-ring';
import { Button } from '@/components/ui/button';

/**
 * @returns {JSX.Element} The Home component
 */
export const Home = (): JSX.Element => {
  const pfp = 'https://i.pinimg.com/736x/fa/b2/93/fab293035b25686034d03b3e7528f594.jpg';
  const name = 'Bobby Fischer';
  const description = 'creating high quality chess lessons';
  const urlSlug = 'bobby';

  const posts = [
    {
      id: 1,
      serial_id: 1,
      title: 'The Sicilian Defense: Dragon Variation',
      description:
        'Master the aggressive Dragon variation with tactical patterns and key attacking ideas that will surprise your opponents.',
      post_number: 1,
      published_at: '2024-01-15',
    },
    {
      id: 2,
      serial_id: 1,
      title: 'Endgame Fundamentals: King and Pawn',
      description:
        'Learn the essential principles of king and pawn endgames, including opposition, triangulation, and breakthrough techniques.',
      post_number: 2,
      published_at: '2024-01-22',
    },
    {
      id: 3,
      serial_id: 1,
      title: 'Tactical Patterns: The Greek Gift',
      description:
        'Discover the classic Greek Gift sacrifice and learn to recognize when this devastating tactical motif can be applied.',
      post_number: 3,
      published_at: '2024-01-29',
    },
    {
      id: 4,
      serial_id: 1,
      title: 'Positional Play: Weak Squares',
      description:
        "Understand how to identify and exploit weak squares in your opponent's position for long-term strategic advantage.",
      post_number: 4,
      published_at: '2024-02-05',
    },
    {
      id: 5,
      serial_id: 1,
      title: 'Opening Principles: Development and Control',
      description:
        'Master the fundamental opening principles that every chess player must know to build a strong foundation.',
      post_number: 5,
      published_at: '2024-02-12',
    },
    {
      id: 6,
      serial_id: 1,
      title: 'Advanced Tactics: Deflection and Decoy',
      description:
        'Learn advanced tactical themes including deflection and decoy sacrifices to create winning combinations.',
      post_number: 6,
      published_at: '2024-02-19',
    },
    {
      id: 7,
      serial_id: 1,
      title: 'Time Management in Chess',
      description:
        'Develop better time management skills to avoid time pressure and make the most of your thinking time.',
      post_number: 7,
      published_at: '2024-02-26',
    },
  ];

  const serials = [
    {
      id: 1,
      title: 'Chess Tactics Mastery',
      description:
        'Master essential tactical patterns and combinations that will dramatically improve your game.',
    },
    {
      id: 2,
      title: 'Opening Repertoire',
      description:
        'Build a solid opening repertoire with both White and Black pieces for tournament play.',
    },
    {
      id: 3,
      title: 'Endgame Excellence',
      description:
        'Learn the fundamental endgame techniques that separate good players from great ones.',
    },
  ];

  const tiers = [
    {
      id: 1,
      name: 'Supporter',
      features: ['Access to 1st serial', 'feature 2', 'feature 3'],
      price: 2,
    },
    {
      id: 2,
      name: 'Supporter+',
      features: ['Access to 1st and 2nd serials', 'feature 2', 'feature 3', 'feature 4'],
      price: 5,
    },
    {
      id: 3,
      name: 'Supporter++',
      features: ['Access to all serials', 'feature 2', 'feature 3', 'feature 4', 'feature 5'],
      price: 10,
    },
  ];

  const about =
    'Bobby Fischer is a passionate chess instructor dedicated to helping players of all levels unlock their full potential. With years of experience both playing and teaching, Bobby specializes in making complex strategies accessible and fun, guiding students to improve their skills and enjoy the game even more.';
  const joined = 'September 2025';

  return (
    <MainLayout>
      <div className="bg-secondary-primary relative flex h-[300px] w-full items-center gap-[25px] border-b-5 border-b-black p-[50px] px-[100px]">
        <div className="relative m-[5px] size-[190px]">
          <img src={pfp} alt="pfp" className="size-full object-cover" />
          <PxBorder width={5} radius="lg" />
        </div>
        <div className="flex flex-col gap-5">
          <div className="relative m-[5px] w-max">
            <PxBorder width={5} radius="md" />
            <div className="bg-white px-[10px] py-[5px]">
              <h2 className="text-3xl">{name}</h2>
            </div>
          </div>
          <div className="relative m-[5px]">
            <PxBorder width={5} radius="md" />
            <div className="bg-white px-[10px] py-[5px]">
              <p className="text-lg">{description}</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 mb-[5px] ml-[5px]">
          <div className="absolute -bottom-[5px] left-0 h-[5px] w-full bg-black" />
          <div className="absolute top-0 -left-[5px] h-full w-[5px] bg-black" />
          <div className="flex items-center gap-2.5 bg-white px-[10px] py-[5px]">
            <Link2 size={20} />
            <p className="text-base">patron.com/{urlSlug}</p>
          </div>
        </div>
      </div>
      <main className="p-[50px] px-[100px]">
        <Tabs className="gap-10" defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="serials">Serials</TabsTrigger>
            <TabsTrigger value="membership-tiers">Membership Tiers</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          <TabsContent className="grid grid-cols-4 gap-10" value="all">
            <button className="bg-secondary-primary group relative flex cursor-pointer flex-col gap-4 p-5 outline-none">
              <PxBorder width={3} radius="lg" />
              <FocusRing width={3} />
              <div className="flex h-full flex-col items-center justify-center gap-5 text-center text-black">
                <PlusIcon size={70} />
                <h2 className="text-3xl">Add new post</h2>
              </div>
            </button>
            {posts.map((post) => (
              <Link
                className="group outline-none"
                to={`/post/${post.serial_id}/${post.post_number}`}
              >
                <div
                  key={post.post_number}
                  className="bg-secondary-primary relative flex h-full flex-col gap-4 p-5"
                >
                  <div className="bg-accent relative aspect-video">
                    <PxBorder width={3} radius="lg" />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full"
                      viewBox="0 0 284 160"
                      fill="none"
                    >
                      <rect width="284" height="160" fill="#ECDD30" />
                      <path
                        d="M137 108H127V102.909H137V108ZM157 108H147V102.909H157V108ZM127 102.909H122V87.6367H127V102.909ZM147 102.909H137V97.8184H147V102.909ZM162 102.909H157V87.6367H162V102.909ZM122 82.5459V87.6367H117V82.5459H122ZM167 87.6367H162V82.5459H167V87.6367ZM117 82.5459H112V72.3633H117V82.5459ZM172 82.5459H167V72.3633H172V82.5459ZM132 72.3633H117V67.2725H132V72.3633ZM167 72.3633H152V67.2725H167V72.3633ZM137 67.2725H132V57.0908H137V67.2725ZM152 67.2725H147V57.0908H152V67.2725ZM147 57.0908H137V52H147V57.0908Z"
                        fill="black"
                      />
                      <path
                        d="M147 67.2725H152V72.3633H167V82.5449H162V87.6367H157V102.909H147V97.8184H137V102.909H127V87.6367H122V82.5449H117V72.3633H132V67.2725H137V57.0908H147V67.2725Z"
                        fill="#265B92"
                      />
                    </svg>
                  </div>
                  <PxBorder width={3} radius="lg" />
                  <FocusRing width={3} />
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xl">{post.title}</h3>
                    <div className="flex items-center gap-2">
                      <CalendarDays strokeWidth={1.5} size={20} />
                      <p className="text-sm">{post.published_at}</p>
                    </div>
                  </div>
                  <p className="text-base">{post.description}</p>
                </div>
              </Link>
            ))}
          </TabsContent>
          <TabsContent className="grid grid-cols-4 gap-10" value="serials">
            <button className="bg-secondary-primary group relative flex cursor-pointer flex-col gap-4 p-5 outline-none">
              <PxBorder width={3} radius="lg" />
              <FocusRing width={3} />
              <div className="flex h-full flex-col items-center justify-center gap-5 text-center text-black">
                <PlusIcon size={70} />
                <h2 className="text-3xl">Create new serial</h2>
              </div>
            </button>
            {serials.map((serial) => (
              <Link className="group outline-none" to={`/serial/${serial.id}`}>
                <div
                  key={serial.id}
                  className="bg-secondary-primary relative flex h-full flex-col gap-4 p-5"
                >
                  <div className="bg-accent relative aspect-video">
                    <PxBorder width={3} radius="lg" />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full"
                      viewBox="0 0 284 160"
                      fill="none"
                    >
                      <rect width="284" height="160" fill="#ECDD30" />
                      <path
                        d="M137 108H127V102.909H137V108ZM157 108H147V102.909H157V108ZM127 102.909H122V87.6367H127V102.909ZM147 102.909H137V97.8184H147V102.909ZM162 102.909H157V87.6367H162V102.909ZM122 82.5459V87.6367H117V82.5459H122ZM167 87.6367H162V82.5459H167V87.6367ZM117 82.5459H112V72.3633H117V82.5459ZM172 82.5459H167V72.3633H172V82.5459ZM132 72.3633H117V67.2725H132V72.3633ZM167 72.3633H152V67.2725H167V72.3633ZM137 67.2725H132V57.0908H137V67.2725ZM152 67.2725H147V57.0908H152V67.2725ZM147 57.0908H137V52H147V57.0908Z"
                        fill="black"
                      />
                      <path
                        d="M147 67.2725H152V72.3633H167V82.5449H162V87.6367H157V102.909H147V97.8184H137V102.909H127V87.6367H122V82.5449H117V72.3633H132V67.2725H137V57.0908H147V67.2725Z"
                        fill="#265B92"
                      />
                    </svg>
                  </div>
                  <PxBorder width={3} radius="lg" />
                  <FocusRing width={3} />
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xl">{serial.title}</h3>
                    <p className="text-base">{serial.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </TabsContent>
          <TabsContent className="grid grid-cols-4 gap-10" value="membership-tiers">
            <button className="bg-secondary-primary group relative flex cursor-pointer flex-col gap-4 p-5 outline-none">
              <PxBorder width={3} radius="lg" />
              <FocusRing width={3} />
              <div className="flex h-full flex-col items-center justify-center gap-5 text-center text-black">
                <Pencil strokeWidth={1.5} size={70} />
                <h2 className="text-3xl">Manage tiers</h2>
              </div>
            </button>
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="bg-secondary-primary relative flex h-full flex-col justify-between gap-4 p-5"
              >
                <PxBorder width={3} radius="lg" />
                <FocusRing width={3} />
                <div className="flex flex-col gap-5">
                  <div className="flex justify-between">
                    <h3 className="text-2xl">{tier.name}</h3>
                    <div className="flex flex-col items-end gap-[5px]">
                      <p className="text-4xl font-bold">{tier.price}$</p>
                      <p className="text-base">per month</p>
                    </div>
                  </div>
                  <ul className="flex [list-style-type:square] flex-col gap-2 pl-5">
                    {tier.features.map((feature) => (
                      <li className="text-sm">{feature}</li>
                    ))}
                  </ul>
                </div>
                <Button variant="secondary" className="w-full">
                  Edit this tier
                  <SquarePen />
                </Button>
              </div>
            ))}
          </TabsContent>
          <TabsContent className="gap-10" value="about">
            <div className="flex flex-col items-end gap-5">
              <div className="relative flex flex-col gap-10 bg-white p-5">
                <PxBorder width={3} radius="lg" />
                <p className="text-lg">{about}</p>
                <p className="text-base">Joined {joined}</p>
              </div>
              <Button size="lg" containerClassName="w-max" variant="secondary">
                Edit
                <SquarePen />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </MainLayout>
  );
};

export default Home;
