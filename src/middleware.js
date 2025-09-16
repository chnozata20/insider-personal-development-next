import { NextResponse } from 'next/server';
import { captchaService } from '@/lib/services/captcha';

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // OPTIONS request için CORS response
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers });
  }

  // Turnstile kontrolü
  const captchaToken = request.headers.get('x-captcha-token');

  if (!captchaToken) {
    return NextResponse.json(
      { error: 'Captcha doğrulaması gerekli' },
      { status: 400 }
    );
  }

  try {
    const isValid = await captchaService.verifyToken(captchaToken);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Captcha doğrulaması başarısız' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Captcha doğrulaması sırasında bir hata oluştu' },
      { status: 400 }
    );
  }

  // Her response'a CORS headers ekle
  const response = NextResponse.next();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
export const runtime = 'experimental-edge';
