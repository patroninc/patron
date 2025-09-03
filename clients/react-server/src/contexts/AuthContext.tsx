import { createContext, useContext, useEffect, useState, ReactNode, JSX } from 'react';
import { Patronts, HTTPClient } from 'patronts';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  // eslint-disable-next-line no-unused-vars
  login: (userEmail: string, userPassword: string) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  register: (userEmail: string, userPassword: string, userName: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Create HTTP client that includes credentials (cookies) with requests
const httpClient = new HTTPClient({
  fetcher: (request) => {
    return fetch(request, {
      credentials: 'include', // This ensures cookies are sent with requests
    });
  },
});

const patronClient = new Patronts({
  serverURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:8080',
  httpClient: httpClient,
  // Don't set cookieAuth since browser handles cookies automatically
});

/**
 * Authentication provider component that manages auth state and provides auth methods.
 *
 * @param {AuthProviderProps} props - The component props
 * @param {ReactNode} props.children - Child components to render
 * @returns {JSX.Element} The provider component
 */
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
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
      const response = await patronClient.auth.getCurrentUser();
      // The response is directly a UserInfoResponse object
      setUser({
        id: response.id,
        email: response.email,
        name: response.email, // UserInfoResponse doesn't have displayName, so use email
      });
    } catch {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logs in a user with email and password.
   *
   * @param {string} userEmail - User's email address
   * @param {string} userPassword - User's password
   * @returns {Promise<void>} Promise that resolves when login is complete
   */
  const login = async (userEmail: string, userPassword: string): Promise<void> => {
    try {
      console.log('Attempting login for:', userEmail);

      const response = await patronClient.auth.login({ email: userEmail, password: userPassword });

      console.log('Login successful:', response);

      setUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.displayName || response.user.email,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  };

  /**
   * Registers a new user account.
   *
   * @param {string} userEmail - User's email address
   * @param {string} userPassword - User's password
   * @returns {Promise<void>} Promise that resolves when registration is complete
   */
  const register = async (userEmail: string, userPassword: string): Promise<void> => {
    try {
      await patronClient.auth.register({
        email: userEmail,
        password: userPassword,
      });
      console.log('Registration successful, please verify email');
    } catch {
      throw new Error('Registration failed');
    }
  };

  /**
   * Logs out the current user.
   *
   * @returns {Promise<void>} Promise that resolves when logout is complete
   */
  const logout = async (): Promise<void> => {
    try {
      await patronClient.auth.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access authentication context.
 *
 * @returns {AuthContextType} The authentication context
 * @throws {Error} When used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
