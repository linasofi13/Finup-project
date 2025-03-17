import { render, screen } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";
import { useAuth } from "@/hooks/useAuth";

// Creamos un mock para los componentes de Next.js App Router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/dashboard',
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock del hook useAuth
jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

// Podríamos necesitar mockear también otros hooks o componentes de Next.js
jest.mock('next/headers', () => ({
  cookies: () => ({ get: jest.fn() }),
  headers: () => new Headers(),
}));

// Si el componente tiene un layout, también debemos mockearlo
jest.mock('@/components/layout/DashboardLayout', () => {
  return {
    __esModule: true,
    default: ({ children }) => <div data-testid="dashboard-layout">{children}</div>,
  };
});

describe("DashboardPage", () => {
  beforeEach(() => {
    // Limpiamos todos los mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Configuramos el mock de useAuth para simular un usuario autenticado
    (useAuth as jest.Mock).mockReturnValue({ 
      user: { name: "Test User", id: "123" },
      loading: false 
    });
  });

  // Envolvemos nuestro componente para aislarlo de problemas de context/hooks
  const renderComponent = () => {
    // Si es necesario, podemos envolver el componente en providers adicionales
    const Component = () => {
      // Convertimos la página de server component a client component para testing
      return <div data-testid="dashboard-container"><DashboardPage /></div>;
    };

    return render(<Component />);
  };

  test("debe renderizar el título del dashboard", () => {
    renderComponent();
    expect(
      screen.getByRole("heading", { name: /dashboard/i })
    ).toBeInTheDocument();
  });

  test("debe renderizar las tarjetas de información", () => {
    renderComponent();
    expect(screen.getByText(/presupuesto asignado/i)).toBeInTheDocument();
    expect(screen.getByText(/asignaciones/i)).toBeInTheDocument();
    expect(screen.getByText(/saldo disponible/i)).toBeInTheDocument();
    expect(screen.getByText(/evc's activos/i)).toBeInTheDocument();
  });

  test("debe renderizar los gráficos", () => {
    renderComponent();
    expect(screen.getByText(/asignado vs gastado/i)).toBeInTheDocument();
    expect(screen.getByText(/asignación presupuestal/i)).toBeInTheDocument();
    expect(
      screen.getByText(/presupuesto asignado por proveedor/i)
    ).toBeInTheDocument();
  });

  test("debe renderizar los botones de acciones rápidas", () => {
    renderComponent();
    expect(screen.getByRole("button", { name: /ver gráficos/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /configurar alertas/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /soporte/i })).toBeInTheDocument();
  });
});