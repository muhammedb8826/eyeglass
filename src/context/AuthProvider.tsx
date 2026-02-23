import { createContext, ReactNode, useState } from "react";

interface AuthContextType {
  auth: {
    user?: string;
    password?: string;
    accessToken?: string;
    refreshToken?: string;
  };
  setAuth: React.Dispatch<React.SetStateAction<{
    user?: string;
    password?: string;
    accessToken?: string;
    refreshToken?: string;
  }>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<{
    user?: string;
    password?: string;
    accessToken?: string;
    refreshToken?: string;
  }>({});

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;