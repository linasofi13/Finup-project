import "@testing-library/jest-dom";

// Limpiar todos los mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});

// Mock fetch global
global.fetch = jest.fn();

// Mock window.alert
window.alert = jest.fn();
