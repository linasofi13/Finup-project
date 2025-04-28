import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProveedoresPage from '@/app/proveedores/page'

// Mock Supabase Client
jest.mock('@/services/supabaseClient', () => ({
    supabase: {
        storage: {
            from: () => ({
                upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' } }),
                getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'test-url' } })
            })
        }
    },
    finupBucket: {
        upload: jest.fn(),
        getPublicUrl: jest.fn()
    }
}))

// Mock axios
jest.mock('axios', () => ({
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({
        data: {
            id: 1,
            name: "Proveedor Test",
            role: "Rol Test",
            company: "Empresa Test",
            country: "País Test",
            cost_usd: "1000",
            category: "Categoría Test",
            line: "Línea Test",
            email: "test@example.com"
        }
    }))
}))

describe('Proveedores Page', () => {
    it('should create a new provider successfully', async () => {
        await render(<ProveedoresPage />)

        // 1. Click en "Añadir Registro"
        const addButton = screen.getByText(/Añadir Registro/i)
        fireEvent.click(addButton)

        // 2. Encontrar los inputs en la nueva fila
        const nameInput = screen.getByPlaceholderText('Nombre')
        const roleInput = screen.getByPlaceholderText('Rol')
        const companyInput = screen.getByPlaceholderText('Proveedor')
        const countryInput = screen.getByPlaceholderText('País')
        const costInput = screen.getByPlaceholderText('Costo USD')
        const categoryInput = screen.getByPlaceholderText('Categoría')
        const lineInput = screen.getByPlaceholderText('Línea')
        const emailInput = screen.getByPlaceholderText('Correo')

        // 3. Llenar el formulario
        fireEvent.change(nameInput, { target: { value: 'Proveedor Test' } })
        fireEvent.change(roleInput, { target: { value: 'Rol Test' } })
        fireEvent.change(companyInput, { target: { value: 'Empresa Test' } })
        fireEvent.change(countryInput, { target: { value: 'País Test' } })
        fireEvent.change(costInput, { target: { value: '1000' } })
        fireEvent.change(categoryInput, { target: { value: 'Categoría Test' } })
        fireEvent.change(lineInput, { target: { value: 'Línea Test' } })
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

        // 4. Click en el ícono de check para guardar (buscando por su clase CSS)
        const saveButton = screen.getByTestId('save-provider-button')

        // Alternativa: buscar por clase CSS si lo anterior falla
        // const checkButton = document.querySelector('.text-green-500.cursor-pointer')

        fireEvent.click(saveButton)

        // 5. Verificar que se agregó a la tabla
        await waitFor(() => {
            expect(screen.getByText('Proveedor Test')).toBeInTheDocument()
            expect(screen.getByText('Empresa Test')).toBeInTheDocument()
            expect(screen.getByText('$1000')).toBeInTheDocument()
        })
    })
})