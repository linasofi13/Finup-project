import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // Create a new response
    const response = NextResponse.json({ message: "Logged out successfully" });

    // Delete the auth token cookie
    response.cookies.delete("auth_token");

    return response;
  } catch (error: any) {
    console.error("Logout error:", error.message);
    return NextResponse.json(
      { message: "Error during logout" },
      { status: 500 },
    );
  }
}
