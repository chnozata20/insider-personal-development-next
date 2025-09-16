import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleApiError, createSuccessResponse } from '@/lib/utils/error';
import { userUpdateSchema } from '@/lib/schemas/user';
import { withAuth } from '@/lib/utils/api-wrapper';
import { hashPassword } from '@/lib/utils/auth';

// Kullanıcı detayı
async function getHandler(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    console.log('Kullanıcı detayı isteği:', { id });

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log('Bulunan kullanıcı:', user);

    if (!user) {
      return createSuccessResponse(false, null, 'USER_NOT_FOUND');
    }

    return createSuccessResponse(true, user, 'USER_DETAIL_SUCCESS');
  } catch (error) {
    console.error('Kullanıcı detayı hatası:', error);
    return handleApiError(error);
  }
}

// Kullanıcı güncelleme
async function patchHandler(request, context) {
  try {
    const params = await context.params;
    const body = await request.json();
    const validatedData = userUpdateSchema.parse(body);

    // Güncelleme verilerini hazırla
    const updateData = {
      name: validatedData.name,
      email: validatedData.email,
      role: validatedData.role,
      isActive: validatedData.isActive,
      twoFactorEnabled: validatedData.role === 'DEMO_USER' ? false : validatedData.twoFactorEnabled
    };

    // Eğer yeni şifre varsa ekle
    if (validatedData.newPassword) {
      updateData.password = await hashPassword(validatedData.newPassword);
    }

    // Kullanıcıyı güncelle
    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        twoFactorEnabled: true,
        failedLoginAttempts: true,
        lastFailedLogin: true,
        lockedUntil: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return createSuccessResponse(true, user, 'USER_UPDATE_SUCCESS');
  } catch (error) {
    return handleApiError(error);
  }
}

// Kullanıcı silme
async function deleteHandler(request, context) {
  try {
    await prisma.user.delete({
      where: { id: context.params.id }
    });

    return createSuccessResponse(true, null, 'USER_DELETE_SUCCESS');
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withAuth(getHandler);
export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler); 