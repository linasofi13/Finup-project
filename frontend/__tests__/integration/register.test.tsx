import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import RegisterPage from '@/app/register/page'

// Mock useAuth hook correctamente
const mockRegisterUser = jest.fn().mockResolvedValue({ success: true }) // Importante: debe resolver exitosamente
jest.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        registerUser: mockRegisterUser,
        error: null,
        register: mockRegisterUser
    })
}))

// Mock useRouter
const mockRouter = {
    push: jest.fn()
}
jest.mock('next/navigation', () => ({
    useRouter: () => mockRouter
}))

describe('Register Page', () => {
    beforeEach(() => {
        mockRegisterUser.mockClear()
        mockRouter.push.mockClear()
    })

    it('should register user with valid data and redirect to dashboard', async () => {
        render(<RegisterPage />)

        // Get form elements
        const form = screen.getByRole('form')
        const nameInput = screen.getByLabelText(/nombre completo/i)
        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/^contraseña$/i)
        const confirmInput = screen.getByLabelText(/confirmar contraseña/i)

        // Fill form
        await act(async () => {
            fireEvent.input(nameInput, { target: { value: 'Test User' } })
            fireEvent.input(emailInput, { target: { value: 'test@example.com' } })
            fireEvent.input(passwordInput, { target: { value: 'Password123' } })
            fireEvent.input(confirmInput, { target: { value: 'Password123' } })
        })

        // Submit form
        await act(async () => {
            fireEvent.submit(form)
        })

        // Verify form submission and redirect
        await waitFor(() => {
            // Verificar que se llamó a registerUser con los datos correctos
            expect(mockRegisterUser).toHaveBeenCalledWith(
                'Test User',
                'test@example.com',
                'Password123'
            )

            // Verificar que se redirige al dashboard después del registro exitoso
            expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
        })
    })

    it('should show error when passwords do not match', async () => {
        render(<RegisterPage />)

        // Get password inputs
        const passwordInput = screen.getByLabelText(/^contraseña$/i)
        const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)

        // Enter different passwords
        await act(async () => {
            // First set password
            fireEvent.input(passwordInput, {
                target: { value: 'Password123' }
            })

            // Then set confirm password and trigger validation
            fireEvent.input(confirmPasswordInput, {
                target: { value: 'DifferentPassword123' }
            })
            fireEvent.blur(confirmPasswordInput)
        })

        // Wait for error message using proper aria attributes
        await waitFor(() => {
            const errorMessage = screen.getByText('Las contraseñas deben coincidir')
            expect(errorMessage).toBeInTheDocument()
        })
    })

    it('should show required field errors when submitting empty form', async () => {
        render(<RegisterPage />)

        // Get form
        const form = screen.getByRole('form')

        // Submit empty form
        await act(async () => {
            fireEvent.submit(form)
        })

        // Verify required field errors appear
        await waitFor(() => {
            // Check for all required field messages
            const nameError = screen.getByText('Nombre es requerido')
            const emailError = screen.getByText('Email es requerido')
            const passwordError = screen.getByText('La contraseña debe tener al menos 8 caracteres')
            const confirmPasswordError = screen.getByText('Confirmar contraseña es requerido')

            // Verify all error messages are displayed
            expect(nameError).toBeInTheDocument()
            expect(emailError).toBeInTheDocument()
            expect(passwordError).toBeInTheDocument()
            expect(confirmPasswordError).toBeInTheDocument()
        })
    })

    it('should show error when trying to register with existing email', async () => {
        // Mock registerUser to reject with duplicate email error
        mockRegisterUser.mockRejectedValueOnce({
            response: {
                data: {
                    message: "El correo electrónico ya está registrado"
                }
            }
        });

        render(<RegisterPage />)

        // Get form elements
        const form = screen.getByRole('form')
        const nameInput = screen.getByLabelText(/nombre completo/i)
        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/^contraseña$/i)
        const confirmInput = screen.getByLabelText(/confirmar contraseña/i)

        // Fill form with existing email
        await act(async () => {
            fireEvent.input(nameInput, { target: { value: 'Test User' } })
            fireEvent.input(emailInput, { target: { value: 'juan2@mail.com' } })
            fireEvent.input(passwordInput, { target: { value: 'Password123' } })
            fireEvent.input(confirmInput, { target: { value: 'Password123' } })
        })

        // Submit form
        await act(async () => {
            fireEvent.submit(form)
        })

        // Verify error message appears
        await waitFor(() => {
            const errorMessage = screen.getByText('El correo electrónico ya está registrado')
            expect(errorMessage).toBeInTheDocument()
        })
    })

})