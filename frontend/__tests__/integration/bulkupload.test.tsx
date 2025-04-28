import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import ProveedoresPage from "@/app/proveedores/page";
import * as XLSX from "xlsx";

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
  post: jest.fn().mockResolvedValue({ data: { success: true } }),
  get: jest.fn().mockResolvedValue({ data: [] }),
}));

describe("Bulk Upload Feature", () => {
  it("should upload and process Excel file successfully", async () => {
    render(<ProveedoresPage />);

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
    });

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
