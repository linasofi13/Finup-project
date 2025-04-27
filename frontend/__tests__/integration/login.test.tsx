import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import LoginPage from '@/app/login/page'
import '@testing-library/jest-dom'
import { AuthProviderMock, mockAuthContext } from '../mocks/authContext'

jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}))

describe('Login Page', () => {
    const mockRouter = {
        push: jest.fn()
    }

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter)
        mockAuthContext.login.mockClear()
    })

    it('should login successfully with valid credentials', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ token: 'fake-token' })
            })
        ) as jest.Mock

        render(
            <AuthProviderMock>
                <LoginPage />
            </AuthProviderMock>
        )

        const emailInput = screen.getByRole('textbox', { name: /email/i })
        const passwordInput = screen.getByLabelText(/contraseña/i)
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

        fireEvent.change(emailInput, { target: { value: 'juan@mail.com' } })
        fireEvent.change(passwordInput, { target: { value: 'stringst' } })

        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
        })
    })

    it('should show error message on invalid credentials', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ message: 'Incorrect username or password' })
            })
        ) as jest.Mock

        render(
            <AuthProviderMock>
                <LoginPage />
            </AuthProviderMock>
        )

        // Obtener los elementos del formulario
        const emailInput = screen.getByRole('textbox', { name: /email/i })
        const passwordInput = screen.getByLabelText(/contraseña/i)
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

        // Ingresar credenciales incorrectas
        fireEvent.change(emailInput, { target: { value: 'wrong@email.com' } })
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })

        // Intentar login
        fireEvent.click(submitButton)

        // Esperar y verificar el mensaje de error
        await waitFor(() => {
            expect(screen.getByText(/Incorrect username or password/i)).toBeInTheDocument()
        })
    })
})