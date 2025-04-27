import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import ProveedoresPage from '@/app/proveedores/page'
import * as XLSX from 'xlsx'

// Mock Supabase Client
jest.mock('@/services/supabaseClient', () => ({
    supabase: {
        storage: {
            from: () => ({
                upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' } }),
                getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'test-url' } })
            })
        }
    }
}))

// Mock XLSX
jest.mock('xlsx', () => ({
    utils: {
        json_to_sheet: jest.fn(),
        book_new: jest.fn(),
        book_append_sheet: jest.fn(),
    },
    writeFile: jest.fn().mockImplementation((workbook, filename) => {
        // Mock implementation that matches how XLSX.writeFile is called
        return undefined;
    }),
}))

// Mock datos de proveedores
jest.mock('axios', () => ({
    get: jest.fn(() => Promise.resolve({
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
                email: "test@example.com"
            }
        ]
    }))
}))

describe('Proveedores Page - Export Feature', () => {
    it('should generate Excel file with provider data', async () => {
        // 1. Renderizar la página
        await act(async () => {
            render(<ProveedoresPage />)
        })

        // 2. Click en exportar
        const exportButton = screen.getByRole('button', { name: /exportar a excel/i })
        await act(async () => {
            fireEvent.click(exportButton)
        })

        // 3. Verificar la generación del Excel
        await waitFor(() => {
            // Verificar que se creó un nuevo libro
            expect(XLSX.utils.book_new).toHaveBeenCalled()

            // Verificar que se convirtieron los datos a hoja
            expect(XLSX.utils.json_to_sheet).toHaveBeenCalled()

            // Verificar que se guardó el archivo
            expect(XLSX.writeFile).toHaveBeenCalled()
            const [workbook, filename] = XLSX.writeFile.mock.calls[0]
            expect(filename).toBe('proveedores.xlsx')

            // Verificar el formato de los datos
            const sheetData = XLSX.utils.json_to_sheet.mock.calls[0][0]
            expect(sheetData).toEqual([
                expect.objectContaining({
                    name: "Proveedor Test",
                    role: "Rol Test",
                    company: "Empresa Test",
                    country: "País Test",
                    cost_usd: "1000",
                    category: "Categoría Test",
                    line: "Línea Test",
                    email: "test@example.com"
                })
            ])
        })
    })
})