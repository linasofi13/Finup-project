import { NextResponse } from 'next/server';
import axios from 'axios';
import querystring from 'querystring';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Call your FastAPI backend
    const backendUrl = process.env.BACKEND_URL;
    console.log(`Attempting to login at: ${backendUrl}/auth/login`);
    
    // Convert to form data format that OAuth2PasswordRequestForm expects
    const formData = querystring.stringify({
      username: email, // FastAPI OAuth2 expects username, not email
      password: password
    });
    
    const response = await axios.post(`${backendUrl}/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('Login successful:', response.data);
    
    return NextResponse.json({
      token: response.data.access_token,
      user: {
        id: '1', // You might need to fetch user details in a separate call
        email: email,
        name: email.split('@')[0] // Temporary, you should get this from user info
      }
    });
  } catch (error: any) {
    console.error('Login error:', error.response?.data);
    return NextResponse.json(
      { detail: error.response?.data?.detail || 'Error al iniciar sesión' },
      { status: error.response?.status || 500 }
    );
  }
}