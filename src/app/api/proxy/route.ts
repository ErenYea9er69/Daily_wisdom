import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url, headers, body } = await request.json();

    // Basic security check to only allow our known API endpoints
    if (url.startsWith('https://api.longcat.chat/')) {
        headers['Authorization'] = `Bearer ${process.env.LONGCAT_API_KEY}`;
    } else if (url.startsWith('https://generativelanguage.googleapis.com/')) {
        // Safe to pass through if we use the client key, or we can override it if we had a GEMINI_API_KEY
    } else {
        return NextResponse.json({ error: 'Unauthorized URL' }, { status: 403 });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    const responseText = await response.text();
    let data;
    try {
        data = JSON.parse(responseText);
    } catch (e) {
        // Upstream returned non-JSON (e.g. 502 Bad Gateway HTML page, or Cloudflare challenge)
        console.error("Upstream returned non-JSON:", responseText.substring(0, 200));
        return NextResponse.json({ 
            error: 'Invalid JSON response from upstream provider', 
            details: responseText.substring(0, 500) 
        }, { status: response.status || 502 });
    }
    
    if (!response.ok) {
        return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: 'Failed to fetch from proxy', details: error.message }, { status: 500 });
  }
}
