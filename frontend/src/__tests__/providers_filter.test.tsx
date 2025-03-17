import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ProveedoresPage from "@/app/proveedores/page";
import "@testing-library/jest-dom";

// Mock de los datos de proveedores
const mockProveedores = [
  {
    id: 1,
    name: "Proveedor 1",
    role: "Administrador",
    company: "Empresa A",
    country: "Colombia",
    cost_usd: 1000,
    category: "Tecnología",
    line: "Software",
    email: "proveedor1@example.com",
  },
  {
    id: 2,
    name: "Proveedor 2",
    role: "Consultor",
    company: "Empresa B",
    country: "Argentina",
    cost_usd: 2000,
    category: "Consultoría",
    line: "Servicios",
    email: "proveedor2@example.com",
  },
  {
    id: 3,
    name: "Proveedor 3",
    role: "Desarrollador",
    company: "Empresa C",
    country: "México",
    cost_usd: 1500,
    category: "Tecnología",
    line: "Hardware",
    email: "proveedor3@example.com",
  },
];

// Mock de axios
jest.mock("axios", () => ({
  get: jest.fn(() =>
    Promise.resolve({
      data: mockProveedores,
    }),
  ),
}));

describe("ProveedoresPage - Filtros", () => {
  beforeEach(() => {
    // Renderizar el componente antes de cada prueba
    render(<ProveedoresPage />);
  });

  it("debería filtrar proveedores por rol", async () => {
    // Simular la entrada en el campo de filtro de rol
    const rolFilterInput = screen.getByPlaceholderText("Filtrar...", {
      name: "role",
    });
    fireEvent.change(rolFilterInput, { target: { value: "Administrador" } });

    // Verificar que solo se muestra el proveedor con el rol "Administrador"
    expect(screen.getByText("Proveedor 1")).toBeInTheDocument();
    expect(screen.queryByText("Proveedor 2")).not.toBeInTheDocument();
    expect(screen.queryByText("Proveedor 3")).not.toBeInTheDocument();
  });

  it("debería filtrar proveedores por proveedor", async () => {
    // Simular la entrada en el campo de filtro de proveedor
    const proveedorFilterInput = screen.getByPlaceholderText("Filtrar...", {
      name: "company",
    });
    fireEvent.change(proveedorFilterInput, { target: { value: "Empresa B" } });

    // Verificar que solo se muestra el proveedor de "Empresa B"
    expect(screen.getByText("Proveedor 2")).toBeInTheDocument();
    expect(screen.queryByText("Proveedor 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Proveedor 3")).not.toBeInTheDocument();
  });

  it("debería filtrar proveedores por país", async () => {
    // Simular la entrada en el campo de filtro de país
    const paisFilterInput = screen.getByPlaceholderText("Filtrar...", {
      name: "country",
    });
    fireEvent.change(paisFilterInput, { target: { value: "México" } });

    // Verificar que solo se muestra el proveedor de "México"
    expect(screen.getByText("Proveedor 3")).toBeInTheDocument();
    expect(screen.queryByText("Proveedor 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Proveedor 2")).not.toBeInTheDocument();
  });
});