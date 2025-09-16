import prisma from '@/lib/prisma';
import { handleApiError, createSuccessResponse } from '@/lib/utils/error';
import { passwordResetSchema } from '@/lib/schemas/auth';
import { hashPassword } from '@/lib/utils/auth';
import { withAuth } from '@/lib/utils/api-wrapper';

async function resetPasswordHandler(request) {
  try {
    const body = await request.json();
    const { code, password } = passwordResetSchema.parse(body);

    // Token'ı kontrol et
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        code,
        type: 'PASSWORD_RESET',
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!verificationCode) {
      return createSuccessResponse(
        false,
        null,
        'LINK_INVALID_OR_EXPIRED'
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: verificationCode.email }
    });

    if (!user) {
      return createSuccessResponse(
        false,
        null,
        'USER_NOT_FOUND'
      );
    }

    // Şifreyi güncelle
    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Code'u kullanıldı olarak işaretle
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true }
    });

    return createSuccessResponse(
      true,
      null,
      'PASSWORD_RESET_SUCCESS'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST = withAuth(resetPasswordHandler); 