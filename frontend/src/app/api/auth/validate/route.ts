import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 },
      );
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    console.log(`Validating token at: ${backendUrl}/auth/me`);

    try {
      const response = await axios.get(`${backendUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      return NextResponse.json(response.data);
    } catch (apiError: any) {
      // Si el token expiró o es inválido (401), intentamos desconectar al usuario
      if (apiError.response?.status === 401) {
        // Create response with error message
        const response = NextResponse.json(
          { message: "Session expired, please login again" },
          { status: 401 }
        );
        // Delete the auth token cookie
        response.cookies.delete("auth_token");
        return response;
      }
      
      // Otros errores del servidor
      throw apiError;
    }
  } catch (error: any) {
    console.error(
      "Token validation error:",
      error.message,
      error.response?.data,
    );
    return NextResponse.json(
      { message: error.response?.data?.detail || "Invalid token" },
      { status: error.response?.status || 401 },
    );
  }
}
