import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import ProveedoresPage from "@/app/proveedores/page";
import { AuthProvider } from "@/context/AuthContext";
import axios from "axios";

// Mock axios
jest.mock("axios", () => {
  const mockAxios = {
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() =>
      Promise.resolve({
        data: {
          id: 1,
          name: "Proveedor Test",
          role: "Rol Test",
          company: "Empresa Test",
          country: "País Test",
          cost_usd: "1000",
          category: "Categoría Test",
          line: "Línea Test",
          email: "test@example.com",
        },
      }),
    ),
    create: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ data: [] })),
      post: jest.fn(() =>
        Promise.resolve({
          data: {
            id: 1,
            name: "Proveedor Test",
            role: "Rol Test",
            company: "Empresa Test",
            country: "País Test",
            cost_usd: "1000",
            category: "Categoría Test",
            line: "Línea Test",
            email: "test@example.com",
          },
        }),
      ),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() }
      }
    })),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() }
    }
  };
  return mockAxios;
});

// Mock authService
jest.mock("@/services/authService", () => ({
  authService: {
    validateToken: jest.fn().mockResolvedValue({
      id: 1,
      email: "test@test.com",
      name: "Test User",
      rol: "Admin" // Changed to match the exact role name from Roles.ADMIN
    }),
    logout: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock useRBAC hook
jest.mock("@/hooks/useRBAC", () => ({
  useRBAC: () => ({
    isAdmin: () => true,
    isConsultor: () => false,
    canModify: () => true,
    canAccessConfig: () => true,
  }),
}));

// Mock Supabase Client
jest.mock("@/services/supabaseClient", () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: jest.fn().mockResolvedValue({ data: { path: "test-path" } }),
        getPublicUrl: jest
          .fn()
          .mockReturnValue({ data: { publicUrl: "test-url" } }),
      }),
    },
  },
  finupBucket: {
    upload: jest.fn(),
    getPublicUrl: jest.fn(),
  },
}));

const renderWithAuth = (component: React.ReactNode) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe("Proveedores Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new provider successfully", async () => {
    await act(async () => {
      renderWithAuth(<ProveedoresPage />);
    });

    // 1. Click en "Añadir Talento"
    const addButton = screen.getByText(/Añadir Talento/i);
    await act(async () => {
      fireEvent.click(addButton);
    });

    // Wait for the new row to appear
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Nombre")).toBeInTheDocument();
    });

    // 2. Encontrar los inputs en la nueva fila
    const nameInput = screen.getByPlaceholderText("Nombre");
    const roleInput = screen.getByPlaceholderText("Rol");
    const companyInput = screen.getByPlaceholderText("Empresa");
    const countryInput = screen.getByPlaceholderText("País");
    const costInput = screen.getByPlaceholderText("Costo USD");
    const categoryInput = screen.getByPlaceholderText("Categoría");
    const lineInput = screen.getByPlaceholderText("Línea");
    const emailInput = screen.getByPlaceholderText("Correo");

    // 3. Llenar el formulario
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "Proveedor Test" } });
      fireEvent.change(roleInput, { target: { value: "Rol Test" } });
      fireEvent.change(companyInput, { target: { value: "Empresa Test" } });
      fireEvent.change(countryInput, { target: { value: "País Test" } });
      fireEvent.change(costInput, { target: { value: "1000" } });
      fireEvent.change(categoryInput, { target: { value: "Categoría Test" } });
      fireEvent.change(lineInput, { target: { value: "Línea Test" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    });

    // 4. Click en el ícono de check para guardar
    const saveButton = screen.getByTestId("save-provider-button");
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // 5. Verificar que se agregó a la tabla
    await waitFor(() => {
      expect(screen.getByText("Proveedor Test")).toBeInTheDocument();
      expect(screen.getByText("Empresa Test")).toBeInTheDocument();
      expect(screen.getByText("$1000")).toBeInTheDocument();
    });
  });
});
