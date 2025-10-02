import { Link2, CalendarDays, PlusIcon } from 'lucide-react';
import MainLayout from '../layouts/main';
import { JSX } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PxBorder from '@/components/px-border';
import { Link } from 'react-router';
import FocusRing from '@/components/focus-ring';
import About from '@/components/about';
import Tiers from '@/components/tiers';
import { Customization } from '@/components/customization';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import NewSeriesForm from '@/components/new-series-form';

/**
 * @returns {JSX.Element} The Home component
 */
export const Home = (): JSX.Element => {
  const { user } = useAuth();
  const { posts, series } = useAppData();
  const description = 'creating high quality chess lessons';
  const urlSlug = 'bobby';

  const tiers = [
    {
      id: 1,
      name: 'Supporter',
      features: ['Access to 1st series', 'feature 2', 'feature 3'],
      price: 2,
    },
    {
      id: 2,
      name: 'Supporter+',
      features: ['Access to 1st and 2nd series', 'feature 2', 'feature 3', 'feature 4'],
      price: 5,
    },
    {
      id: 3,
      name: 'Supporter++',
      features: ['Access to all series', 'feature 2', 'feature 3', 'feature 4', 'feature 5'],
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
          <img src={user?.avatarUrl ?? undefined} alt="pfp" className="size-full object-cover" />
          <PxBorder width={5} radius="lg" />
        </div>
        <div className="flex flex-col gap-5">
          <div className="relative m-[5px] w-max">
            <PxBorder width={5} radius="md" />
            <div className="bg-white px-[10px] py-[5px]">
              <h2 className="text-3xl">{user?.displayName ?? undefined}</h2>
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
        <Customization initialData={user ?? undefined} />
      </div>
      <main className="p-[50px] px-[100px]">
        <Tabs className="gap-10" defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="series">Series</TabsTrigger>
            <TabsTrigger value="membership-tiers">Membership Tiers</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          <TabsContent
            className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
            value="all"
          >
            <Link
              to="/new-post"
              className="bg-secondary-primary group relative flex cursor-pointer flex-col gap-4 px-5 py-20 outline-none"
            >
              <PxBorder width={3} radius="lg" />
              <FocusRing width={3} />
              <div className="flex h-full flex-col items-center justify-center gap-5 text-center text-black">
                <PlusIcon size={70} />
                <h2 className="text-3xl">Add new post</h2>
              </div>
            </Link>
            {posts &&
              posts.map((post) => (
                <Link
                  className="group outline-none"
                  to={`/post/${post.seriesId}/${post.postNumber}`}
                  key={post.id}
                >
                  <div
                    key={post.postNumber}
                    className="bg-secondary-primary relative flex h-full flex-col gap-4 p-5"
                  >
                    <div className="bg-accent relative aspect-video">
                      <PxBorder width={3} radius="lg" />
                      {post.thumbnailUrl ? (
                        <img
                          src={post.thumbnailUrl}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
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
                      )}
                    </div>
                    <PxBorder width={3} radius="lg" />
                    <FocusRing width={3} />
                    <div className="flex flex-col gap-3">
                      <h3 className="text-xl">{post.title}</h3>
                      <div className="flex items-center gap-2">
                        <CalendarDays strokeWidth={1.5} size={20} />
                        <p className="text-sm">
                          {post.createdAt
                            ? new Date(post.createdAt).toLocaleDateString()
                            : 'No date'}
                        </p>
                      </div>
                    </div>
                    <p className="text-base">{post.content}</p>
                  </div>
                </Link>
              ))}
          </TabsContent>
          <TabsContent
            className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
            value="series"
          >
            <NewSeriesForm
              trigger={
                <button
                  type="button"
                  className="bg-secondary-primary group relative flex cursor-pointer flex-col gap-4 px-5 py-20 outline-none"
                >
                  <PxBorder width={3} radius="lg" />
                  <FocusRing width={3} />
                  <div className="flex h-full flex-col items-center justify-center gap-5 text-center text-black">
                    <PlusIcon size={70} />
                    <h2 className="text-3xl">Create new series</h2>
                  </div>
                </button>
              }
            />
            {series &&
              series.map((seriesItem) => (
                <Link
                  key={seriesItem.id}
                  className="group outline-none"
                  to={`/series/${seriesItem.id}`}
                >
                  <div
                    key={seriesItem.id}
                    className="bg-secondary-primary relative flex h-full flex-col gap-4 p-5"
                  >
                    <div className="bg-accent relative aspect-video">
                      <PxBorder width={3} radius="lg" />
                      {seriesItem.coverImageUrl ? (
                        <img
                          src={seriesItem.coverImageUrl}
                          alt={seriesItem.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
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
                      )}
                    </div>
                    <PxBorder width={3} radius="lg" />
                    <FocusRing width={3} />
                    <div className="flex flex-col gap-3">
                      <h3 className="text-xl">{seriesItem.title}</h3>
                      <p className="text-base">
                        {seriesItem.description || 'No description available'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </TabsContent>
          <TabsContent
            className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
            value="membership-tiers"
          >
            <Tiers tiers={tiers} />
          </TabsContent>
          <TabsContent className="gap-10" value="about">
            <About joined={joined} about={about} />
          </TabsContent>
        </Tabs>
      </main>
    </MainLayout>
  );
};

export default Home;
