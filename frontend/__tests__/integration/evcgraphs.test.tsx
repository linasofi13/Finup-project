import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { act } from "react";
import DashboardPage from "@/app/dashboard/page";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import userEvent from "@testing-library/user-event";
import React from "react";
import { TEST_API_URL } from "../config/testConfig";

// Mock ResponsiveContainer to bypass layout measurements in tests
jest.mock("recharts", () => {
  const Recharts = jest.requireActual("recharts");
  return {
    ...Recharts,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 600 }}>{children}</div>
    ),
  };
});

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  usePathname() {
    return "/dashboard";
  },
}));

// Mock axios
jest.mock("axios", () => ({
  get: jest.fn((url: string) => {
    if (url.includes('/providers/providers')) {
      return Promise.resolve({ data: [] });
    }
    if (url.includes('/evc-qs/evc_qs/')) {
      return Promise.resolve({ data: mockEvcQsData });
    }
    if (url.includes('/evc-financials/evc_financials/')) {
      return Promise.resolve({ data: [] });
    }
    if (url.includes('/evcs/')) {
      return Promise.resolve({ data: mockEvcsData });
    }
    return Promise.resolve({ data: [] });
  }),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() }
    }
  })),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() }
  }
}));

// Get the mocked axios instance
const mockAxios = axios as jest.Mocked<typeof axios>;

// Mock js-cookie
jest.mock("js-cookie", () => ({
  get: jest.fn(() => "mock-token"),
  set: jest.fn(),
  remove: jest.fn(),
}));

// Mock AuthContext values
const mockAuthContext = {
  user: {
    id: "1",
    email: "test@example.com",
    name: "Test User",
    role: "admin",
  },
  login: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: true,
  loading: false,
  error: null,
  refreshSession: jest.fn(),
  setUser: jest.fn(),
  register: jest.fn()
};

// Wrapper component with mocked context
const renderWithAuth = (component: React.ReactNode) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      {component}
    </AuthContext.Provider>,
  );
};

// Mock data
const mockEvcsData = [
  {
    id: 1,
    name: "EVC Test 1",
    status: true,
    entorno_id: 1,
  },
  {
    id: 2,
    name: "EVC Test 2",
    status: false,
    entorno_id: 2,
  },
];

const mockEvcQsData = [
  {
    id: 1,
    evc_id: 1,
    year: 2024,
    q: 1,
    allocated_budget: 10000,
    allocated_percentage: 25,
  },
  {
    id: 2,
    evc_id: 1,
    year: 2024,
    q: 2,
    allocated_budget: 15000,
    allocated_percentage: 30,
  },
];

describe("Dashboard EVC Indicators", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Configure mocks
    mockAxios.get.mockImplementation((url) => {
      if (url.includes('/providers/providers')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/evc-qs/evc_qs/')) {
        return Promise.resolve({ data: mockEvcQsData });
      }
      if (url.includes('/evc-financials/evc_financials/')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/evcs/')) {
        return Promise.resolve({ data: mockEvcsData });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it("should display EVC graphics with correct data", async () => {
    const user = userEvent.setup();
    // 1. Render dashboard
    await act(async () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <DashboardPage />
        </AuthContext.Provider>,
      );
    });

    // 2. Wait for initial data load
    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith(`${TEST_API_URL}/providers/providers`);
    });

    // 3. Click on EVCs tab
    const evcsTab = await screen.getByText("EVCs");
    await act(async () => {
      await user.click(evcsTab);
    });

    // 4. Verify graphics are displayed
    await waitFor(() => {
      // Estado de EVCs
      expect(screen.getByText("EVCs por Estado")).toBeInTheDocument();

      // Look for the text in any element, not just text elements
      expect(screen.getByText(/Activos/i)).toBeInTheDocument();
      expect(screen.getByText(/Inactivos/i)).toBeInTheDocument();

      // Distribución por Entorno
      expect(screen.getByText("Distribución de EVCs por Entorno")).toBeInTheDocument();
      expect(screen.getByText("Entorno 1")).toBeInTheDocument();
      expect(screen.getByText("Entorno 2")).toBeInTheDocument();

      // Presupuesto
      expect(screen.getByText("Presupuesto Total por Año")).toBeInTheDocument();
      expect(screen.getByText("% Promedio de Uso por Año")).toBeInTheDocument();
    });

    // 5. Verify data calculations
    await waitFor(() => {
      // Verificar totales
      const totalActivos = mockEvcsData.filter((evc) => evc.status).length;
      const totalInactivos = mockEvcsData.filter((evc) => !evc.status).length;

      // Verificar presupuesto
      const totalBudget = mockEvcQsData.reduce(
        (sum, q) => sum + q.allocated_budget,
        0,
      );
      expect(screen.getByText(totalBudget.toString())).toBeInTheDocument();

      // Verificar porcentajes
      const avgPercentage =
        mockEvcQsData.reduce((sum, q) => sum + q.allocated_percentage, 0) /
        mockEvcQsData.length;
      expect(screen.getByText(`${avgPercentage}%`)).toBeInTheDocument();
    });

    // 6. Verify API calls
    expect(mockAxios.get).toHaveBeenCalledWith(`${TEST_API_URL}/providers/providers`);
    expect(mockAxios.get).toHaveBeenCalledWith(`${TEST_API_URL}/evc-qs/evc_qs/`);
    expect(mockAxios.get).toHaveBeenCalledWith(`${TEST_API_URL}/evc-financials/evc_financials/`);
    expect(mockAxios.get).toHaveBeenCalledWith(`${TEST_API_URL}/evcs/`);
  });

  it("should handle empty data gracefully", async () => {
    // Mock empty responses
    mockAxios.get.mockImplementation(() => Promise.resolve({ data: [] }));
    const user = userEvent.setup();

    await act(async () => {
      render(
        <AuthContext.Provider value={mockAuthContext}>
          <DashboardPage />
        </AuthContext.Provider>,
      );
    });

    const evcsTab = screen.getByText("EVCs");
    await act(async () => {
      await user.click(evcsTab);
    });

    // Verify empty state handling
    await waitFor(async () => {
      expect(await screen.findByText("EVCs por Estado")).toBeInTheDocument();
      // Verify no data messages or empty charts are shown
    });
  });
});
