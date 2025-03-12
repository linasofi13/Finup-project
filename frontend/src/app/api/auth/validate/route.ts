import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    console.log(`Validating token at: ${backendUrl}/auth/me`);
    
    const response = await axios.get(`${backendUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Token validation error:', error.message, error.response?.data);
    return NextResponse.json(
      { message: error.response?.data?.detail || 'Invalid token' },
      { status: error.response?.status || 401 }
    );
  }
}