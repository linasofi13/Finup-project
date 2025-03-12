import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    console.log(`Attempting login at: ${backendUrl}/auth/token`);
    
    const response = await axios.post(`${backendUrl}/auth/token`, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return NextResponse.json({
      access_token: response.data.access_token,
      user: response.data.user
    });
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.detail || 'Authentication error' },
      { status: error.response?.status || 500 }
    );
  }
}
