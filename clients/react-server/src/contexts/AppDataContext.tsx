import { patronClient } from '@/lib/utils';
import { PostResponse, SeriesResponse } from 'patronts/models';
import { createContext, useContext, ReactNode, JSX, useState } from 'react';

interface AppDataContextType {
  posts: PostResponse[] | null;
  series: SeriesResponse[] | null;
  singleSeries: SeriesResponse | null;
  singlePost: PostResponse | null;
  fetchPosts?: () => Promise<void>;
  fetchSeries?: () => Promise<void>;
  fetchSingleSeries?: (seriesId: string) => Promise<void>;
  fetchSinglePost?: (postId: string) => Promise<void>;
  // Future data types can be added here
  // users?: any[];
  // analytics?: any;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

interface AppDataProviderProps {
  children: ReactNode;
  initialPosts?: PostResponse[] | null;
  initialSeries?: SeriesResponse[] | null;
  initialSingleSeries?: SeriesResponse | null;
  initialSinglePost?: PostResponse | null;
}

/**
 * App data provider component that manages SSR data and provides data access methods.
 *
 * @param {AppDataProviderProps} props - The component props
 * @param {ReactNode} props.children - Child components to render
 * @param {PostResponse[] | null} props.initialPosts - Initial posts data from server
 * @param {SeriesResponse[] | null} props.initialSeries - Initial series data from server
 * @param {SeriesResponse | null} props.initialSingleSeries - Initial single series data from server
 * @param {PostResponse | null} props.initialSinglePost - Initial single post data from server
 * @returns {JSX.Element} The provider component
 */
export const AppDataProvider = ({
  children,
  initialPosts,
  initialSeries,
  initialSingleSeries,
  initialSinglePost,
}: AppDataProviderProps): JSX.Element => {
  const [posts, setPosts] = useState<PostResponse[] | null>(initialPosts ?? null);
  const [series, setSeries] = useState<SeriesResponse[] | null>(initialSeries ?? null);
  const [singleSeries, setSingleSeries] = useState<SeriesResponse | null>(
    initialSingleSeries ?? null,
  );
  const [singlePost, setSinglePost] = useState<PostResponse | null>(initialSinglePost ?? null);

  /**
   * Fetch posts from the server.
   */
  const fetchPosts = async (): Promise<void> => {
    const postsResp = await patronClient.posts.list({ limit: 20 });
    setPosts(postsResp);
  };

  /**
   * Fetch series from the server.
   */
  const fetchSeries = async (): Promise<void> => {
    const seriesResp = await patronClient.series.list({ limit: 20 });
    setSeries(seriesResp);
  };

  /**
   * Fetch a single series from the server.
   *
   * @param {string} seriesId - The ID of the series to fetch
   */
  const fetchSingleSeries = async (seriesId: string): Promise<void> => {
    // Clear the current singleSeries to avoid showing stale data
    setSingleSeries(null);
    const seriesResp = await patronClient.series.get({ seriesId });
    setSingleSeries(seriesResp);
  };

  /**
   * Fetch a single post from the server.
   *
   * @param {string} postId - The ID of the post to fetch
   */
  const fetchSinglePost = async (postId: string): Promise<void> => {
    // Clear the current singlePost to avoid showing stale data
    setSinglePost(null);
    const postResp = await patronClient.posts.get({ postId });
    setSinglePost(postResp);
  };

  const value = {
    posts,
    series,
    singleSeries,
    singlePost,
    fetchPosts,
    fetchSeries,
    fetchSingleSeries,
    fetchSinglePost,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

/**
 * Custom hook to access app data context.
 *
 * @returns {AppDataContextType} The app data context
 * @throws {Error} When used outside of AppDataProvider
 */
export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
