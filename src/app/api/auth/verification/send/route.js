import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/utils/email';
import { generateVerificationCode } from '@/lib/utils/verification';
import { sendVerificationSchema } from '@/lib/schemas/auth';
import { handleApiError, createSuccessResponse } from '@/lib/utils/error';
import { withAuth } from '@/lib/utils/api-wrapper';

const MAX_VERIFICATION_REQUESTS = 5;
const VERIFICATION_REQUEST_EXPIRATION = 15 * 60 * 1000; // 15 dakika
const VERIFICATION_CODE_EXPIRATION = 2 * 60 * 1000; // 2 dakika

async function sendVerificationHandler(request) {
  try {
    const body = await request.json();
    const { email, type } = sendVerificationSchema.parse(body);

    // Demo talebi için özel durum
    if (type === 'DEMO_REQUEST') {
      // Demo talebini veritabanına kaydet
      const demoRequest = await prisma.demoRequest.create({
        data: {
          email,
          status: 'PENDING',
        },
      });

      // Demo talebi e-postası gönder
      await sendVerificationEmail(email, null, type, {
        requestId: demoRequest.id,
        email,
      });

      return createSuccessResponse(
        true,
        null,
        'DEMO_REQUEST'
      );
    }

    // Kullanıcının son 15 dakika içinde kaç kod gönderdiğini kontrol et
    const recentCodes = await prisma.verificationCode.count({
      where: {
        email,
        type,
        createdAt: {
          gte: new Date(Date.now() - VERIFICATION_REQUEST_EXPIRATION), // Son 15 dakika
        },
      },
    });

    if (recentCodes >= MAX_VERIFICATION_REQUESTS) {
      return createSuccessResponse(
        false,
        null,
        'TOO_MANY_REQUESTS'
      );
    }

    // 6 haneli doğrulama kodu oluştur
    const code = generateVerificationCode();

    // Kodu veritabanına kaydet
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        type,
        expiresAt: new Date(Date.now() + VERIFICATION_CODE_EXPIRATION), // 2 dakika geçerli
      },
    });

    // E-posta gönder
    await sendVerificationEmail(email, code, type);

    return createSuccessResponse(
      true,
      null,
      'VERIFICATION_CODE_SENT'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST = withAuth(sendVerificationHandler); 