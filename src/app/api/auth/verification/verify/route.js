import prisma from '@/lib/prisma';
import { handleApiError, createSuccessResponse } from '@/lib/utils/error';
import { verifyCodeSchema } from '@/lib/schemas/auth';
import { withAuth } from '@/lib/utils/api-wrapper';

async function verifyCodeHandler(request) {
  try {
    const body = await request.json();
    const validatedData = verifyCodeSchema.parse(body);

    // Doğrulama kodunu kontrol et
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        email: validatedData.email,
        code: validatedData.code,
        type: validatedData.type,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // İşlem sonucunu döndür
    return createSuccessResponse(
      !!verificationCode,
      null,
      verificationCode ? null : 'CODE_INVALID_OR_EXPIRED'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST = withAuth(verifyCodeHandler); 