import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleApiError, createSuccessResponse } from '@/lib/utils/error';
import { registerSchema } from '@/lib/schemas/auth';
import { hashPassword } from '@/lib/utils/auth';
import { withAuth } from '@/lib/utils/api-wrapper';

async function registerHandler(request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // E-posta adresi kullanımda mı kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return createSuccessResponse(
        false,
        null,
        'EMAIL_IN_USE'
      );
    }

    // E-posta doğrulama kodunu kontrol et
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        email: validatedData.email,
        code: validatedData.verificationCode,
        type: 'EMAIL_VERIFY',
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!verificationCode) {
      return createSuccessResponse(
        false,
        null,
        'CODE_INVALID_OR_EXPIRED'
      );
    }

    // Şifreyi hashle
    const hashedPassword = await hashPassword(validatedData.password);

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role,
      }
    });

    // Doğrulama kodunu kullanıldı olarak işaretle
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });

    // Hassas bilgileri çıkar
    const { password, ...userWithoutPassword } = user;

    return createSuccessResponse(
      true,
      userWithoutPassword,
      'REGISTER_SUCCESS'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST = withAuth(registerHandler); 