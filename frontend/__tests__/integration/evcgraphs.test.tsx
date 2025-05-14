import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { act } from "react";
import DashboardPage from "@/app/dashboard/page";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import userEvent from "@testing-library/user-event";
import React from "react";

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
jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

// Mock AuthContext values
const mockAuthContext = {
  user: {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    role: "admin",
  },
  login: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: true,
  loading: false,
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
      switch (url) {
        case "http://127.0.0.1:8000/evcs/":
          return Promise.resolve({ data: mockEvcsData });
        case "http://127.0.0.1:8000/evc-qs/evc_qs/":
          return Promise.resolve({ data: mockEvcQsData });
        default:
          return Promise.resolve({ data: [] });
      }
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
      expect(mockAxios.get).toHaveBeenCalledWith("http://127.0.0.1:8000/evcs/");
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
      const activoTexts = screen.getAllByText(
        (content, element) =>
          element?.tagName.toLowerCase() === "text" &&
          content.includes("Activos"),
      );
      expect(activoTexts.length).toBeGreaterThan(0);

      expect(
        screen.getByText(
          (content, element) =>
            element?.tagName.toLowerCase() === "text" &&
            content.includes("Inactivos"),
        ),
      ).toBeInTheDocument();

      // Distribución por Entorno
      expect(
        screen.getByText("Distribución de EVCs por Entorno"),
      ).toBeInTheDocument();
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

    // 5. Verify API calls
    expect(mockAxios.get).toHaveBeenCalledWith("http://127.0.0.1:8000/evcs/");
    expect(mockAxios.get).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/evc-qs/evc_qs/",
    );
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
