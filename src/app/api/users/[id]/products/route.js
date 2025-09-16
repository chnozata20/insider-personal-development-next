import prisma from '@/lib/prisma';
import { handleApiError, createSuccessResponse } from '@/lib/utils/error';
import { withAuth } from '@/lib/utils/api-wrapper';

// Kullanıcının ürünlerini getirme
async function getHandler(request, context) {
  try {
    const { id: userId } = await context.params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Kullanıcının var olup olmadığını kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return createSuccessResponse(false, null, 'USER_NOT_FOUND');
    }

    // Kullanıcıya atanan ürünleri getir
    const [userProducts, total] = await Promise.all([
      prisma.userProduct.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              description: true,
              features: true,
              isActive: true,
              createdAt: true,
              productInfoTypes: {
                select: {
                  infoType: true,
                  maxCount: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.userProduct.count({
        where: { userId },
      }),
    ]);

    const products = userProducts.map(up => up.product);

    return createSuccessResponse(true, {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }, 'USER_PRODUCTS_LIST_SUCCESS');
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withAuth(getHandler); 