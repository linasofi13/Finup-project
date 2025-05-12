import { render, screen, waitFor, within } from "@testing-library/react";
import { act } from "react";
import DocumentosPage from "@/app/documentos/page";
import axios from "axios";

// Mock axios
jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

// Mock data
const mockDocumentos = [
  {
    id: 1,
    file_name: "documento1.pdf",
    file_url: "http://example.com/doc1.pdf",
    uploaded_at: "2024-04-27T10:00:00Z",
    provider: {
      id: 1,
      name: "Proveedor Test",
    },
  },
  {
    id: 2,
    file_name: "documento2.xlsx",
    file_url: "http://example.com/doc2.xlsx",
    uploaded_at: "2024-04-27T11:00:00Z",
    provider: {
      id: 2,
      name: "Proveedor Test 2",
    },
  },
];

describe("Documentos Page", () => {
  beforeEach(() => {
    // Configure los mocks antes de cada test
    mockAxios.get.mockImplementation((url) => {
      if (url.includes("provider-documents")) {
        return Promise.resolve({ data: mockDocumentos });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it("should display the list of uploaded documents with their details", async () => {
    // 1. Renderizar componente
    await act(async () => {
      render(<DocumentosPage />);
    });

    // 2. Verificar que se llama a la API
    expect(mockAxios.get).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/provider-documents/",
    );

    // 3. Verificar que se muestran los documentos
    await waitFor(() => {
      // Verificar nombres de documentos
      expect(screen.getByText("documento1.pdf")).toBeInTheDocument();
      expect(screen.getByText("documento2.xlsx")).toBeInTheDocument();

      // Verificar nombres de proveedores
      expect(screen.getByText("Proveedor Test")).toBeInTheDocument();
      expect(screen.getByText("Proveedor Test 2")).toBeInTheDocument();

      // Verificar fechas - usando getAllByText y verificando la cantidad
      const fechas = screen.getAllByText("27/4/2024");
      expect(fechas).toHaveLength(2);

      // Verificar que cada fecha está en la fila correcta
      const rows = screen.getAllByRole("row");
      mockDocumentos.forEach((doc, index) => {
        const row = rows[index + 1]; // +1 para saltar el header
        const fileName = within(row).getByText(doc.file_name);
        const fecha = within(row).getByText(
          new Date(doc.uploaded_at).toLocaleDateString(),
        );
        expect(fileName).toBeInTheDocument();
        expect(fecha).toBeInTheDocument();
      });

      // Verificar acciones disponibles
      const downloadButtons = screen.getAllByRole("link");
      expect(downloadButtons).toHaveLength(2);
      expect(downloadButtons[0]).toHaveAttribute(
        "href",
        mockDocumentos[0].file_url,
      );

      const deleteButtons = screen.getAllByRole("button", {
        name: /eliminar/i,
      });
      expect(deleteButtons).toHaveLength(2);
    });
  });
});
