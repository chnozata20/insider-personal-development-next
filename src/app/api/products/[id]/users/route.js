import prisma from '@/lib/prisma';
import { handleApiError, createSuccessResponse } from '@/lib/utils/error';
import { withAuth } from '@/lib/utils/api-wrapper';

// Ürünün kullanıcılarını getirme
async function getHandler(request, context) {
  try {
    const { id: productId } = await context.params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Ürünün var olup olmadığını kontrol et
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return createSuccessResponse(false, null, 'PRODUCT_NOT_FOUND');
    }

    // Ürüne atanan kullanıcıları getir
    const [userProducts, total] = await Promise.all([
      prisma.userProduct.findMany({
        where: { productId },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.userProduct.count({
        where: { productId },
      }),
    ]);

    const users = userProducts.map(up => up.user);

    return createSuccessResponse(true, {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }, 'PRODUCT_USERS_LIST_SUCCESS');
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withAuth(getHandler); 