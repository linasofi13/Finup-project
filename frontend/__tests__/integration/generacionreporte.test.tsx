import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import ProveedoresPage from "@/app/proveedores/page";
import * as XLSX from "xlsx";
import axios from "axios";
import { AuthProvider } from "@/context/AuthContext";

// Mock axios
jest.mock("axios", () => {
  const mockAxios = {
    get: jest.fn(() =>
      Promise.resolve({
        data: [
          {
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
        ],
      }),
    ),
    create: jest.fn(() => ({
      get: jest.fn(() =>
        Promise.resolve({
          data: [
            {
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
          ],
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
    validateToken: jest.fn().mockResolvedValue({ id: 1, email: "test@test.com", name: "Test User" }),
    logout: jest.fn().mockResolvedValue(undefined),
  },
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
}));

// Mock XLSX
jest.mock("xlsx", () => {
  const mockXLSX = {
    utils: {
      json_to_sheet: jest.fn(),
      book_new: jest.fn(),
      book_append_sheet: jest.fn(),
    },
    writeFile: jest.fn(),
  };
  return mockXLSX;
});

const renderWithAuth = (component: React.ReactNode) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe("Proveedores Page - Export Feature", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should generate Excel file with provider data", async () => {
    // 1. Renderizar la página
    await act(async () => {
      renderWithAuth(<ProveedoresPage />);
    });

    // 2. Click en exportar
    const exportButton = screen.getByRole("button", {
      name: /exportar a excel/i,
    });
    await act(async () => {
      fireEvent.click(exportButton);
    });

    // 3. Verificar la generación del Excel
    await waitFor(() => {
      // Verificar que se creó un nuevo libro
      expect(XLSX.utils.book_new).toHaveBeenCalled();

      // Verificar que se convirtieron los datos a hoja
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();

      // Verificar que se guardó el archivo
      expect(XLSX.writeFile).toHaveBeenCalled();
      const [workbook, filename] = (XLSX.writeFile as jest.Mock).mock.calls[0];
      expect(filename).toBe("talentos.xlsx");

      // Verificar el formato de los datos
      const sheetData = (XLSX.utils.json_to_sheet as jest.Mock).mock.calls[0][0];
      expect(sheetData).toEqual([
        expect.objectContaining({
          name: "Proveedor Test",
          role: "Rol Test",
          company: "Empresa Test",
          country: "País Test",
          cost_usd: "1000",
          category: "Categoría Test",
          line: "Línea Test",
          email: "test@example.com",
        }),
      ]);
    });
  });
});
