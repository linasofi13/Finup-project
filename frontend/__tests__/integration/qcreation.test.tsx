import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import EvcsPage from "@/app/evcs/page";
import axios from "axios";
import { TEST_API_URL } from "../config/testConfig";

// Mock axios
jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

// Mock data
const mockEvc = {
  id: 1,
  name: "EVC Test",
  description: "EVC de prueba",
  status: true,
  creation_date: "2024-04-27T10:00:00Z",
  updated_at: "2024-04-27T10:00:00Z",
  entorno_id: 1,
  technical_leader_id: 1,
  functional_leader_id: 1,
  evc_qs: [],
};

describe("Quarter Creation", () => {
  beforeEach(() => {
    // Mock API calls
    mockAxios.get.mockImplementation((url) => {
      if (url.includes("/evcs/")) {
        return Promise.resolve({ data: [mockEvc] });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it("should create a new quarter for an existing EVC", async () => {
    // 1. Render component
    await act(async () => {
      render(<EvcsPage />);
    });

    // 2. Click "Gestionar Quarters" on the EVC card
    const gestionarQuartersBtn = screen.getByRole("button", {
      name: /gestionar quarters/i,
    });
    await act(async () => {
      fireEvent.click(gestionarQuartersBtn);
    });

    // 3. Verify modal is shown
    await waitFor(() => {
      expect(
        screen.getByText(`Gestión de Quarters - ${mockEvc.name}`),
      ).toBeInTheDocument();
    });

    // 4. Fill quarter form
    const yearInput = screen.getByPlaceholderText("YYYY");
    const quarterSelect = screen.getByLabelText("Quarter");
    const budgetInput = screen.getByPlaceholderText("$");
    const percentageInput = screen.getByPlaceholderText("%");

    await act(async () => {
      fireEvent.change(yearInput, { target: { value: "2024" } });
      fireEvent.change(quarterSelect, { target: { value: "1" } });
      fireEvent.change(budgetInput, { target: { value: "10000" } });
      fireEvent.change(percentageInput, { target: { value: "25" } });
    });

    // Mock quarter creation response
    mockAxios.post.mockResolvedValueOnce({
      data: {
        id: 1,
        year: 2024,
        q: 1,
        allocated_budget: 10000,
        allocated_percentage: 25,
        evc_id: mockEvc.id,
      },
    });

    // 5. Submit form
    const submitButton = screen.getByRole("button", {
      name: /agregar quarter/i,
    });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // 6. Verify quarter was added to the list
    await waitFor(() => {
      expect(screen.getByText("2024")).toBeInTheDocument();
      expect(screen.getByText("Q1")).toBeInTheDocument();
      expect(screen.getByText("$10,000")).toBeInTheDocument();
      expect(screen.getByText("25%")).toBeInTheDocument();
    });

    // 7. Verify API calls
    expect(mockAxios.post).toHaveBeenCalledWith(
      `${TEST_API_URL}/evc-qs/evc_qs/`,
      {
        evc_id: mockEvc.id,
        year: 2024,
        q: 1,
        allocated_budget: 10000,
        allocated_percentage: 25,
      },
    );
  });
});
