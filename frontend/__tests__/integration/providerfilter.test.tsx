import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProveedoresPage from "@/app/proveedores/page";
import axios from "axios";
import { finupBucket } from "@/services/supabaseClient";

// Mock axios
jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

// Mock Supabase Client
jest.mock("@/services/supabaseClient", () => ({
  finupBucket: {
    upload: jest
      .fn()
      .mockResolvedValue({ data: { path: "test/path" }, error: null }),
    remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
    getPublicUrl: jest
      .fn()
      .mockReturnValue({ data: { publicUrl: "test-url" } }),
  },
}));

// Mock data con proveedores del mismo rol pero diferentes costos
const mockProviders = [
  {
    id: 1,
    name: "Juan Pérez",
    role: "Desarrollador Frontend",
    company: "Tech SA",
    country: "México",
    cost_usd: 45,
    category: "IT",
    line: "Desarrollo",
    email: "juan@tech.com",
  },
  {
    id: 2,
    name: "Ana García",
    role: "Desarrollador Frontend",
    company: "Dev Corp",
    country: "Colombia",
    cost_usd: 38,
    category: "IT",
    line: "Desarrollo",
    email: "ana@devcorp.com",
  },
  {
    id: 3,
    name: "Carlos López",
    role: "Desarrollador Backend",
    company: "Systems LLC",
    country: "Argentina",
    cost_usd: 50,
    category: "IT",
    line: "Desarrollo",
    email: "carlos@systems.com",
  },
];

describe("Provider Role Filtering", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: mockProviders });
  });

  it("should filter providers by role and compare their costs", async () => {
    const user = userEvent.setup();

    // 1. Render the providers page
    render(<ProveedoresPage />);

    // 2. Wait for providers to load
    await screen.findByText("Juan Pérez");

    // 3. Get the role filter input
    const roleFilter = screen.getByTestId("role-filter");
    await user.type(roleFilter, "Desarrollador Frontend");

    // 4. Verify filtered results
    const rows = screen.getAllByRole("row");
    const filteredRows = rows.filter((row) =>
      within(row).queryByText("Desarrollador Frontend"),
    );

    // Should show only Frontend Developers
    expect(filteredRows).toHaveLength(2);

    // Verify the costs are shown
    expect(screen.getByText("$45")).toBeInTheDocument();
    expect(screen.getByText("$38")).toBeInTheDocument();

    // Backend developer should not be visible
    expect(screen.queryByText("$50")).not.toBeInTheDocument();

    // 5. Verify provider details are visible
    const techSAProvider = within(filteredRows[0]);
    expect(techSAProvider.getByText("Tech SA")).toBeInTheDocument();
    expect(techSAProvider.getByText("México")).toBeInTheDocument();

    const devCorpProvider = within(filteredRows[1]);
    expect(devCorpProvider.getByText("Dev Corp")).toBeInTheDocument();
    expect(devCorpProvider.getByText("Colombia")).toBeInTheDocument();

    // 6. Verify costs comparison (lowest to highest)
    /*const costs = filteredRows.map(row => {
            const costText = within(row).getByText(/\$\d+/).textContent
            return parseInt(costText.replace('$', ''))
        })

        expect(costs[0]).toBeLessThanOrEqual(costs[1])*/
  });

  it("should handle no matches for role filter", async () => {
    const user = userEvent.setup();

    render(<ProveedoresPage />);
    await screen.findByText("Juan Pérez");

    const roleFilter = screen.getByTestId("role-filter");
    await user.type(roleFilter, "Rol Inexistente");

    // Should show no results
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(2); // Header row + filter row only
  });

  it("should clear filters when input is emptied", async () => {
    const user = userEvent.setup();

    render(<ProveedoresPage />);
    await screen.findByText("Juan Pérez");

    const roleFilter = screen.getByTestId("role-filter");

    // Apply filter
    await user.type(roleFilter, "Desarrollador Frontend");
    expect(screen.getAllByRole("row")).toHaveLength(4); // Header, filter, 2 results

    // Clear filter
    await user.clear(roleFilter);
    expect(screen.getAllByRole("row")).toHaveLength(5); // All rows visible again
  });
});
