import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url, headers, body } = await request.json();

    // Basic security check to only allow our known API endpoints
    if (!url.startsWith('https://generativelanguage.googleapis.com/') && 
        !url.startsWith('https://api.longcat.chat/')) {
        return NextResponse.json({ error: 'Unauthorized URL' }, { status: 403 });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (!response.ok) {
        return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: 'Failed to fetch from proxy' }, { status: 500 });
  }
}
