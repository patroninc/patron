import { Link2 } from 'lucide-react';
import MainLayout from '../layouts/main';
import { JSX } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * @returns {JSX.Element} The Home component
 */
export const Home = (): JSX.Element => {
  const pfp = 'https://i.pinimg.com/736x/fa/b2/93/fab293035b25686034d03b3e7528f594.jpg';
  const name = 'Bobby Fischer';
  const description = 'creating high quality chess lessons';
  const urlSlug = 'bobby';

  return (
    <MainLayout>
      <div className="bg-secondary-primary relative flex h-[300px] w-full items-center gap-[25px] border-b-5 border-b-black p-[50px]">
        <div className="relative m-[5px] size-[190px]">
          <img src={pfp} alt="pfp" className="size-full object-cover" />
          <div className="absolute -top-[5px] left-[5px] h-[5px] w-[calc(100%-10px)] bg-black" />
          <div className="absolute -bottom-[5px] left-[5px] h-[5px] w-[calc(100%-10px)] bg-black" />
          <div className="absolute top-[5px] -left-[5px] h-[calc(100%-10px)] w-[5px] bg-black" />
          <div className="absolute top-[5px] -right-[5px] h-[calc(100%-10px)] w-[5px] bg-black" />
          <div className="absolute top-0 left-0 size-[5px] bg-black" />
          <div className="absolute top-0 right-0 size-[5px] bg-black" />
          <div className="absolute bottom-0 left-0 size-[5px] bg-black" />
          <div className="absolute right-0 bottom-0 size-[5px] bg-black" />
        </div>
        <div className="flex flex-col gap-5">
          <div className="relative m-[5px] w-max">
            <div className="absolute -top-[5px] left-0 h-[5px] w-full bg-black" />
            <div className="absolute -bottom-[5px] left-0 h-[5px] w-full bg-black" />
            <div className="absolute top-0 -left-[5px] h-full w-[5px] bg-black" />
            <div className="absolute top-0 -right-[5px] h-full w-[5px] bg-black" />
            <div className="bg-white px-[10px] py-[5px]">
              <h2 className="text-3xl">{name}</h2>
            </div>
          </div>
          <div className="relative m-[5px]">
            <div className="absolute -top-[5px] left-0 h-[5px] w-full bg-black" />
            <div className="absolute -bottom-[5px] left-0 h-[5px] w-full bg-black" />
            <div className="absolute top-0 -left-[5px] h-full w-[5px] bg-black" />
            <div className="absolute top-0 -right-[5px] h-full w-[5px] bg-black" />
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
      <main className="p-[50px]">
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="serials">Serials</TabsTrigger>
            <TabsTrigger value="membership-tiers">Membership Tiers</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          <TabsContent value="all">All</TabsContent>
          <TabsContent value="serials">Serials</TabsContent>
          <TabsContent value="membership-tiers">Membership Tiers</TabsContent>
          <TabsContent value="about">About</TabsContent>
        </Tabs>
      </main>
    </MainLayout>
  );
};

export default Home;
