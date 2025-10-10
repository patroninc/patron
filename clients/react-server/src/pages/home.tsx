import { Link2, PlusIcon } from 'lucide-react';
import MainLayout from '../layouts/main';
import { JSX } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PxBorder from '@/components/px-border';
import { Link, useNavigate, useSearchParams } from 'react-router';
import FocusRing from '@/components/focus-ring';
import About from '@/components/about';
import { Customization } from '@/components/customization';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import NewSeriesForm from '@/components/new-series-form';
import { Button } from '@/components/ui/button';

/**
 * @returns {JSX.Element} The Home component
 */
export const Home = (): JSX.Element => {
  const { user } = useAuth();
  const { series, fetchSeries } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';
  const description = 'creating high quality chess lessons';
  const urlSlug = 'bobby';
  const navigate = useNavigate();

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
        <Tabs
          className="gap-10"
          value={activeTab}
          onValueChange={(value) => setSearchParams({ tab: value })}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          <TabsContent
            className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
            value="all"
          >
            {!series || series.length === 0 ? (
              <div className="relative col-span-full flex flex-col items-center justify-center gap-5 bg-white p-10">
                <PxBorder width={3} radius="lg" />
                <h2 className="text-2xl">Welcome to your Patron page!</h2>
                <p className="text-lg">
                  You need to create a series first before you can create posts and start sharing
                  content with your audience.
                </p>
                <NewSeriesForm
                  onSeriesCreated={fetchSeries}
                  trigger={
                    <Button containerClassName="w-max">
                      Create Your First Series
                      <PlusIcon size={20} />
                    </Button>
                  }
                />
              </div>
            ) : (
              <>
                {series.map((series) => (
                  <div
                    className="bg-secondary-primary relative flex h-full flex-col justify-between gap-5 p-5"
                    key={series.id}
                  >
                    <Link
                      className="group flex flex-col gap-4 outline-none"
                      to={`/series/${series.id}`}
                    >
                      <div className="bg-accent relative aspect-video">
                        <PxBorder width={3} radius="lg" />
                        {series.coverImageUrl ? (
                          <img
                            src={series.coverImageUrl}
                            alt={series.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <img
                              src="/assets/series.png"
                              alt="series"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        {series.length && (
                          <div className="absolute right-2.5 bottom-2.5">
                            <div className="relative m-[3px] bg-white px-1.5 py-[3px]">
                              <PxBorder width={3} radius="md" />
                              <span className="text-sm">{series.length} posts</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <PxBorder width={3} radius="lg" />
                      <FocusRing width={3} />
                      <div className="flex flex-col gap-2">
                        <h3 className="text-xl">{series.title}</h3>
                        <p className="text-base">{series.description}</p>
                      </div>
                    </Link>
                    <Button
                      className="w-full"
                      containerClassName="mt-0"
                      onClick={() =>
                        navigate(`/new-post?series-id=${series.id}`, { viewTransition: true })
                      }
                    >
                      Create a new post
                      <PlusIcon size={20} />
                    </Button>
                  </div>
                ))}
              </>
            )}
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
