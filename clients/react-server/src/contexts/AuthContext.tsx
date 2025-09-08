import { createContext, useContext, useState, ReactNode, JSX } from 'react';
import { UserInfo } from 'patronts/models';

interface AuthContextType {
  user: UserInfo | null;
  // eslint-disable-next-line no-unused-vars
  setUser: (user: UserInfo | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: UserInfo | null;
}

/**
 * Authentication provider component that manages auth state and provides auth methods.
 *
 * @param {AuthProviderProps} props - The component props
 * @param {ReactNode} props.children - Child components to render
 * @param {UserInfo | null} props.initialUser - Initial user data from server
 * @returns {JSX.Element} The provider component
 */
export const AuthProvider = ({ children, initialUser }: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<UserInfo | null>(initialUser ?? null);

  const value = {
    user,
    setUser,
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
