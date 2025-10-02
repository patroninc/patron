import { createContext, useContext, ReactNode, JSX } from 'react';

interface AppDataContextType {
  posts: any[] | null;
  series: any[] | null;
  // Future data types can be added here
  // users?: any[];
  // analytics?: any;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

interface AppDataProviderProps {
  children: ReactNode;
  initialPosts?: any[];
  initialSeries?: any[];
}

/**
 * App data provider component that manages SSR data and provides data access methods.
 *
 * @param {AppDataProviderProps} props - The component props
 * @param {ReactNode} props.children - Child components to render
 * @param {any[]} props.initialPosts - Initial posts data from server
 * @param {any[]} props.initialSeries - Initial series data from server
 * @returns {JSX.Element} The provider component
 */
export const AppDataProvider = ({
  children,
  initialPosts,
  initialSeries,
}: AppDataProviderProps): JSX.Element => {
  const value = {
    posts: initialPosts ?? null,
    series: initialSeries ?? null,
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
