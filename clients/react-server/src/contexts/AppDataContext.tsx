import { patronClient } from '@/lib/utils';
import { PostResponse } from 'patronts/models';
import { createContext, useContext, ReactNode, JSX, useState } from 'react';

interface AppDataContextType {
  posts: any[] | null;
  series: any[] | null;
  fetchPosts?: () => Promise<void>;
  fetchSeries?: () => Promise<void>;
  // Future data types can be added here
  // users?: any[];
  // analytics?: any;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

interface AppDataProviderProps {
  children: ReactNode;
  initialPosts?: PostResponse[] | null;
  initialSeries?: any[];
}

/**
 * App data provider component that manages SSR data and provides data access methods.
 *
 * @param {AppDataProviderProps} props - The component props
 * @param {ReactNode} props.children - Child components to render
 * @param {PostResponse[] | null} props.initialPosts - Initial posts data from server
 * @param {any[]} props.initialSeries - Initial series data from server
 * @returns {JSX.Element} The provider component
 */
export const AppDataProvider = ({
  children,
  initialPosts,
  initialSeries,
}: AppDataProviderProps): JSX.Element => {
  const [posts, setPosts] = useState<PostResponse[] | null>(initialPosts ?? null);
  const [series, setSeries] = useState<any[] | null>(initialSeries ?? null);

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

  const value = {
    posts,
    series,
    fetchPosts,
    fetchSeries,
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
