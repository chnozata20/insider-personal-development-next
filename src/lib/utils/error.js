import { NextResponse } from 'next/server';

// Özel hata sınıfları
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

export class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = 401;
  }
}

export class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthorizationError';
    this.status = 403;
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

export class BusinessError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BusinessError';
    this.status = 400;
  }
}

// Hata yönetimi
export function handleApiError(error) {
  console.error('API Hatası:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    details: error.details
  });

  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.status }
    );
  }

  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }

  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }

  if (error.name === 'ZodError') {
    return NextResponse.json(
      { error: 'Geçersiz veri formatı', details: error.errors },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: 'Bir hata oluştu' },
    { status: 500 }
  );
}

// Yardımcı fonksiyonlar
export function createErrorResponse(message, status = 500, details = null) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details
    },
    { status }
  );
}

export function createSuccessResponse(success = true, data = null, message = null) {
  return NextResponse.json({
    success,
    data,
    message
  });
} 