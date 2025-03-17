import DocumentosPage from "../app/documentos/page";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

describe("DocumentosPage Component", () => {
  test("debe renderizar los archivos cargados correctamente", () => {
    render(<DocumentosPage />);

    // Verificar que los documentos iniciales están en la tabla
    expect(screen.getByText("PLANTILLA_FINANCIERA.docx")).toBeInTheDocument();
    expect(screen.getByText("REPORTE_FINANZAS_2025.xls")).toBeInTheDocument();
    expect(screen.getByText("EVCS_2024.zip")).toBeInTheDocument();
    expect(screen.getByText("INFORME_FINANZAS.pdf")).toBeInTheDocument();
  });

  test("debe permitir cargar un nuevo archivo", () => {
    render(<DocumentosPage />);

    // Simular la carga de un archivo
    const fileInput = screen.getByLabelText("Explorar Archivos");
    const archivoMock = new File(["contenido"], "NUEVO_DOCUMENTO.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(fileInput, { target: { files: [archivoMock] } });

    // Simular clic en guardar
    const guardarBtn = screen.getByText("Guardar");
    fireEvent.click(guardarBtn);

    // Verificar que el nuevo documento se muestra
    expect(screen.getByText("NUEVO_DOCUMENTO.pdf")).toBeInTheDocument();
  });
});