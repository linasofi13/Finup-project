import { AuthContext, AuthContextType } from "@/context/AuthContext";

const mockLogin = jest
  .fn()
  .mockImplementation(async (email: string, password: string) => {
    return Promise.resolve();
  }) as jest.MockedFunction<(email: string, password: string) => Promise<void>>;

const mockLogout = jest.fn() as jest.MockedFunction<() => void>;
const mockSetUser = jest.fn() as jest.MockedFunction<(user: any) => void>;
const mockRefreshSession = jest.fn() as jest.MockedFunction<() => Promise<void>>;
const mockRegister = jest.fn() as jest.MockedFunction<(data: any) => Promise<void>>;

export const mockAuthContext: AuthContextType = {
  user: null,
  login: mockLogin,
  logout: mockLogout,
  loading: false,
  error: null,
  refreshSession: mockRefreshSession,
  setUser: mockSetUser,
  register: mockRegister,
};

export const AuthProviderMock = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <AuthContext.Provider value={mockAuthContext}>
    {children}
  </AuthContext.Provider>
);
