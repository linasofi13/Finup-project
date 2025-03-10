import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Check if BACKEND_URL is defined
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      console.error('BACKEND_URL environment variable is not defined');
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log(`Attempting to register user with backend at: ${backendUrl}/auth/register`);
    
    const response = await axios.post(`${backendUrl}/auth/register`, {
        username: name, // Changed from 'name' to 'username' to match backend model
        email: email,
        password: password
      });
    
    console.log('Registration response:', response.data);
    // Return the response from the backend
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // More detailed error logging
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return NextResponse.json(
      { message: error.response?.data?.detail || 'Error al registrarse' },
      { status: error.response?.status || 500 }
    );
  }
}