import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // Eliminar la cookie de autenticación de manera más completa
    const cookieStore = cookies();
    cookieStore.delete({
      name: "auth_token",
      path: "/",
    });

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.error("Logout error:", error.message);
    return NextResponse.json(
      { message: "Error during logout" },
      { status: 500 },
    );
  }
}
