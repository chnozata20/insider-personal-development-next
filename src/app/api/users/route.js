import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/utils/api-wrapper';
import { handleApiError, createSuccessResponse } from '@/lib/utils/error';
import { userCreateSchema } from '@/lib/schemas/user';
import { hashPassword } from '@/lib/utils/auth';

// Kullanıcı listesi
async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt_desc';
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(role && { role }),
      ...(status && { isActive: status === 'active' })
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortBy ? {
          [sortBy.split('_')[0]]: sortBy.split('_')[1]
        } : { createdAt: 'desc' },
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
      }),
      prisma.user.count({ where })
    ]);

    return createSuccessResponse(true, {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }, 'USER_LIST_SUCCESS');
  } catch (error) {
    return handleApiError(error);
  }
}

// Yeni kullanıcı ekleme
async function postHandler(request) {
  try {
    const data = await request.json();
    const validatedData = userCreateSchema.parse(data);
    const hashedPassword = await hashPassword(validatedData.password);

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role,
        isActive: validatedData.isActive,
        twoFactorEnabled: validatedData.twoFactorEnabled
      },
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

    return createSuccessResponse(true, user, 'USER_CREATE_SUCCESS');
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler); 