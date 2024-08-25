import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      console.log('No token found');
      return NextResponse.json({ message: 'Not Authorized' }, { status: 403 });
    }

    const response = await fetch(`http://localhost:1337/api/users/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('Error response from API:', errorData);
      throw new Error(errorData.message || 'Failed to fetch user data');
    }

    const user = await response.json();
    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.error('Error in API route:', error.message);
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 500 });
  }
}