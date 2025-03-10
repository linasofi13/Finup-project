import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    // Acceder al token desde las cookies
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 },
      );
    }

    // Llamar a tu backend en FastAPI para validar el token
    const response = await axios.get(
      `${process.env.BACKEND_URL}/auth/validate`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.response?.data?.detail || "Invalid token" },
      { status: error.response?.status || 401 },
    );
  }
}
