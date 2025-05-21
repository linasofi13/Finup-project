import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import ProveedoresPage from "@/app/proveedores/page";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";

// Mock ProtectedContent component
jest.mock("@/components/ui/ProtectedContent", () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Supabase Client
jest.mock("@/services/supabaseClient", () => ({
    supabase: {
        storage: {
            from: () => ({
                upload: jest.fn().mockResolvedValue({ data: { path: "test-path" } }),
                getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "test-url" } }),
            }),
        },
    },
    finupBucket: {
        upload: jest.fn().mockResolvedValue({ data: { path: "test-path" } }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "test-url" } }),
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

describe("Document Upload Feature", () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    it("should upload a document successfully", async () => {
        // Mock provider data
        const mockProviders = [
            {
                id: "1",
                name: "Test Provider",
                role: "Developer",
                company: "Test Company",
                country: "Test Country",
                cost_usd: "1000",
                category: "Test Category",
                line: "Test Line",
                email: "test@example.com",
            },
        ];

        // Mock initial document list response (empty)
        (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockProviders });
        (axios.get as jest.Mock).mockResolvedValueOnce({ data: [] });

        renderWithAuth(<ProveedoresPage />);

        // Wait for providers to load
        await waitFor(() => {
            expect(screen.getByText("Test Provider")).toBeInTheDocument();
        });

        // Select a provider
        const providerSelect = screen.getByRole("combobox");
        await act(async () => {
            fireEvent.change(providerSelect, { target: { value: "1" } });
        });

        // Wait for the file input to appear
        await waitFor(() => {
            expect(screen.getByTestId("doc-file-input")).toBeInTheDocument();
        });

        // Create a mock file
        const file = new File(["test content"], "test.pdf", { type: "application/pdf" });

        // Get the file input and upload button
        const fileInput = screen.getByTestId("doc-file-input");
        const uploadButton = screen.getByRole("button", { name: /subir documento/i });

        // Upload the file
        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file] } });
        });

        // Mock the document list response after upload
        (axios.get as jest.Mock).mockResolvedValueOnce({
            data: [{
                id: "1",
                provider_id: "1",
                file_name: "test.pdf",
                file_url: "test-url",
                uploaded_at: new Date().toISOString()
            }]
        });

        // Click upload button
        await act(async () => {
            fireEvent.click(uploadButton);
        });

        // Verify success message
        await waitFor(() => {
            expect(screen.getByText(/archivo subido exitosamente/i)).toBeInTheDocument();
        });

        // Verify that the document was added to the list
        await waitFor(() => {
            const documentList = screen.getByText("Documentos Cargados");
            expect(documentList).toBeInTheDocument();
            expect(screen.getByText("test.pdf")).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it("should show error message when upload fails", async () => {
        // Mock provider data
        const mockProviders = [
            {
                id: "1",
                name: "Test Provider",
                role: "Developer",
                company: "Test Company",
                country: "Test Country",
                cost_usd: "1000",
                category: "Test Category",
                line: "Test Line",
                email: "test@example.com",
            },
        ];

        // Mock axios get response for providers
        (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockProviders });
        (axios.get as jest.Mock).mockResolvedValueOnce({ data: [] });

        // Mock Supabase upload to fail
        const { finupBucket } = require("@/services/supabaseClient");
        finupBucket.upload.mockRejectedValueOnce(new Error("Upload failed"));

        renderWithAuth(<ProveedoresPage />);

        // Wait for providers to load
        await waitFor(() => {
            expect(screen.getByText("Test Provider")).toBeInTheDocument();
        });

        // Select a provider
        const providerSelect = screen.getByRole("combobox");
        await act(async () => {
            fireEvent.change(providerSelect, { target: { value: "1" } });
        });

        // Wait for the file input to appear
        await waitFor(() => {
            expect(screen.getByTestId("doc-file-input")).toBeInTheDocument();
        });

        // Create a mock file
        const file = new File(["test content"], "test.pdf", { type: "application/pdf" });

        // Get the file input and upload button
        const fileInput = screen.getByTestId("doc-file-input");
        const uploadButton = screen.getByRole("button", { name: /subir documento/i });

        // Upload the file
        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file] } });
        });

        // Click upload button
        await act(async () => {
            fireEvent.click(uploadButton);
        });

        // Verify error message
        await waitFor(() => {
            expect(screen.getByText(/error al subir el archivo/i)).toBeInTheDocument();
        });
    });
}); 