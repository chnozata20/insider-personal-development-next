import prisma from '@/lib/prisma';
import { handleApiError, createSuccessResponse } from '@/lib/utils/error';
import { sendVerificationEmail } from '@/lib/utils/email';
import { passwordResetRequestSchema } from '@/lib/schemas/auth';
import { generateVerificationCode } from '@/lib/utils/verification';
import { withAuth } from '@/lib/utils/api-wrapper';

const MAX_RESET_REQUESTS = 3;
const RESET_REQUEST_EXPIRATION = 15 * 60 * 1000; // 15 dakika
const LAST_DAY_COUNT = 24;

async function resetPasswordRequestHandler(request) {
  try {
    const body = await request.json();
    const { email } = passwordResetRequestSchema.parse(body);

    // Kullanıcıyı kontrol et
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return createSuccessResponse(
        false,
        null,
        'USER_NOT_FOUND'
      );
    }

    // Son 24 saatteki sıfırlama isteklerini kontrol et
    const lastDay = new Date();
    lastDay.setHours(lastDay.getHours() - LAST_DAY_COUNT);

    const resetCount = await prisma.verificationCode.count({
      where: {
        email,
        type: 'PASSWORD_RESET',
        createdAt: {
          gte: lastDay
        }
      }
    });

    if (resetCount >= MAX_RESET_REQUESTS) {
      return createSuccessResponse(
        false,
        null,
        'TOO_MANY_REQUESTS'
      );
    }

    // Code oluştur
    const code = generateVerificationCode();

    // Code'u kaydet
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + RESET_REQUEST_EXPIRATION) // 15 dakika
      }
    });

    // Email gönder
    await sendVerificationEmail(email, code, 'PASSWORD_RESET');

    return createSuccessResponse(
      true,
      null,
      'PASSWORD_RESET_REQUEST_SENT'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST = withAuth(resetPasswordRequestHandler); 