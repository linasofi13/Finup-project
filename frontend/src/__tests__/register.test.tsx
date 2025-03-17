import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RegisterPage from "../app/register/page"; // Asegúrate de que la ruta sea correcta
import "@testing-library/jest-dom";

describe("RegisterPage", () => {
  it("debería renderizar el formulario de registro", () => {
    render(<RegisterPage />);

    // Verificar que los campos del formulario estén presentes
    expect(screen.getByLabelText(/Nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Registrarse/i })).toBeInTheDocument();
  });

  it("debería mostrar un error cuando la contraseña es demasiado corta", async () => {
    render(<RegisterPage />);

    // Simular la entrada de una contraseña corta
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    fireEvent.change(passwordInput, { target: { value: "123" } });

    // Simular el envío del formulario
    const submitButton = screen.getByRole("button", { name: /Registrarse/i });
    fireEvent.click(submitButton);

    // Verificar que se muestra el mensaje de error
    expect(await screen.findByText(/La contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument();
  });

  it("debería mostrar un error cuando la contraseña no contiene letras", async () => {
    render(<RegisterPage />);

    // Simular la entrada de una contraseña sin letras
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    fireEvent.change(passwordInput, { target: { value: "12345678" } });

    // Simular el envío del formulario
    const submitButton = screen.getByRole("button", { name: /Registrarse/i });
    fireEvent.click(submitButton);

    // Verificar que se muestra el mensaje de error
    expect(await screen.findByText(/La contraseña debe contener al menos una letra/i)).toBeInTheDocument();
  });

  it("debería mostrar un error cuando la contraseña no contiene números", async () => {
    render(<RegisterPage />);

    // Simular la entrada de una contraseña sin números
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    fireEvent.change(passwordInput, { target: { value: "abcdefgh" } });

    // Simular el envío del formulario
    const submitButton = screen.getByRole("button", { name: /Registrarse/i });
    fireEvent.click(submitButton);

    // Verificar que se muestra el mensaje de error
    expect(await screen.findByText(/La contraseña debe contener al menos un número/i)).toBeInTheDocument();
  });

  it("debería mostrar un error cuando las contraseñas no coinciden", async () => {
    render(<RegisterPage />);

    // Simular la entrada de una contraseña y una confirmación de contraseña diferente
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirmar contraseña/i);
    fireEvent.change(passwordInput, { target: { value: "Password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "Password456" } });

    // Simular el envío del formulario
    const submitButton = screen.getByRole("button", { name: /Registrarse/i });
    fireEvent.click(submitButton);

    // Verificar que se muestra el mensaje de error
    expect(await screen.findByText(/Las contraseñas deben coincidir/i)).toBeInTheDocument();
  });
});