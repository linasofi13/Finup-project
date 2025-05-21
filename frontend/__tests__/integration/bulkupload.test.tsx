import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import ProveedoresPage from "@/app/proveedores/page";
import * as XLSX from "xlsx";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";

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
    upload: jest.fn().mockResolvedValue({ data: { path: "test-path" } }),
    getPublicUrl: jest
      .fn()
      .mockReturnValue({ data: { publicUrl: "test-url" } }),
  },
}));

// Mock XLSX
jest.mock("xlsx", () => ({
  read: jest.fn(),
  utils: {
    json_to_sheet: jest.fn(),
    sheet_to_json: jest.fn().mockReturnValue([
      {
        Nombre: "Test Provider",
        Rol: "Test Role",
        Proveedor: "Test Company",
        País: "Test Country",
        "Costo USD": "1000",
        Categoría: "Test Category",
        Línea: "Test Line",
        Correo: "test@example.com",
      },
    ]),
    book_new: jest.fn(),
    book_append_sheet: jest.fn(),
  },
}));

// Mock axios
jest.mock("axios", () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
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

describe("Bulk Upload Feature", () => {
  it("should upload and process Excel file successfully", async () => {
    renderWithAuth(<ProveedoresPage />);

    // 1. Crear archivo Excel mock
    const excelFile = new File(["dummy excel content"], "providers.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // 2. Simular carga de archivo
    const fileInput = screen.getByTestId("file-input");
    await act(async () => {
      fireEvent.change(fileInput, {
        target: { files: [excelFile] },
      });
    });

    // 3. Esperar que se procese el archivo y aparezca el modal
    await waitFor(() => {
      expect(screen.getByTestId("preview-modal-title")).toBeInTheDocument();
    }, { timeout: 3000 });

    // 4. Verificar datos en el modal
    expect(screen.getByText("Test Provider")).toBeInTheDocument();
    expect(screen.getByText("Test Company")).toBeInTheDocument();

    // 5. Confirmar carga
    const confirmButton = screen.getByRole("button", { name: /confirmar/i });
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    // 6. Verificar mensaje de éxito
    await waitFor(() => {
      expect(
        screen.getByText(/proveedores subidos con éxito/i),
      ).toBeInTheDocument();
    });
  });
});
