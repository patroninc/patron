import { createContext, useContext, useEffect, useState, ReactNode, JSX } from 'react';
import { UserInfo } from 'patronts/models';
import { patronClient } from '@/lib/utils';

interface AuthContextType {
  user: UserInfo | null;
  // eslint-disable-next-line no-unused-vars
  setUser: (user: UserInfo | null) => void;
  loading: boolean;
  // eslint-disable-next-line no-unused-vars
  setLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component that manages auth state and provides auth methods.
 *
 * @param {AuthProviderProps} props - The component props
 * @param {ReactNode} props.children - Child components to render
 * @returns {JSX.Element} The provider component
 */
export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Checks the current authentication status by calling the API.
   *
   * @returns {Promise<void>} Promise that resolves when check is complete
   */
  const checkAuthStatus = async (): Promise<void> => {
    try {
      const userInfo = await patronClient.auth.getCurrentUser({
        credentials: 'include',
      });
      setUser(userInfo);
    } catch {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    setUser,
    loading,
    setLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to access authentication context.
 *
 * @returns {AuthContextType} The authentication context
 * @throws {Error} When used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
