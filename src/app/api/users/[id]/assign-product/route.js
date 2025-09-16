import prisma from '@/lib/prisma';
import { handleApiError, createSuccessResponse } from '@/lib/utils/error';
import { withAuth } from '@/lib/utils/api-wrapper';

// Kullanıcıya ürün atama
async function postHandler(request, context) {
  try {
    const { id: userId } = await context.params;
    const { productId } = await request.json();

    if (!productId) {
      return createSuccessResponse(false, null, 'PRODUCT_ID_REQUIRED');
    }

    // Kullanıcı ve ürünün var olup olmadığını kontrol et
    const [user, product] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.product.findUnique({ where: { id: productId } }),
    ]);

    if (!user) {
      return createSuccessResponse(false, null, 'USER_NOT_FOUND');
    }

    if (!product) {
      return createSuccessResponse(false, null, 'PRODUCT_NOT_FOUND');
    }

    // Zaten atanmış mı kontrol et
    const existingAssignment = await prisma.userProduct.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingAssignment) {
      return createSuccessResponse(false, null, 'USER_ALREADY_ASSIGNED_TO_PRODUCT');
    }

    // Ürünü kullanıcıya ata
    const userProduct = await prisma.userProduct.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return createSuccessResponse(true, userProduct, 'USER_PRODUCT_ASSIGNED_SUCCESS');
  } catch (error) {
    return handleApiError(error);
  }
}

// Kullanıcıdan ürün kaldırma
async function deleteHandler(request, context) {
  try {
    const { id: userId } = await context.params;
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return createSuccessResponse(false, null, 'PRODUCT_ID_REQUIRED');
    }

    // Kullanıcının bu ürüne atanıp atanmadığını kontrol et
    const userProduct = await prisma.userProduct.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (!userProduct) {
      return createSuccessResponse(false, null, 'USER_NOT_ASSIGNED_TO_PRODUCT');
    }

    // Kullanıcının bu ürün için tüm WatchedInfo'larını sil
    await prisma.watchedInfo.deleteMany({
      where: {
        userId,
        productId
      }
    });

    // UserProduct kaydını sil
    await prisma.userProduct.delete({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    return createSuccessResponse(true, null, 'USER_PRODUCT_REMOVED_SUCCESS');
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST = withAuth(postHandler);
export const DELETE = withAuth(deleteHandler); 