import prisma from '@/lib/prisma';
import { handleApiError, createSuccessResponse } from '@/lib/utils/error';
import { withAuth } from '@/lib/utils/api-wrapper';
import { watchedInfoCreateSchema } from '@/lib/schemas/watchedInfo';

// Kullanıcının tüm izlenen bilgilerini getirme
async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');

    if (!userId) {
      return createSuccessResponse(false, null, 'USER_ID_REQUIRED');
    }

    const where = {
      userId,
      isActive: true
    };

    // Eğer productId belirtilmişse, sadece o ürün için olanları getir
    if (productId) {
      where.productId = productId;
    }

    const watchedInfos = await prisma.watchedInfo.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return createSuccessResponse(true, watchedInfos, 'WATCHED_INFO_LIST_SUCCESS');
  } catch (error) {
    return handleApiError(error);
  }
}

// Yeni izlenen bilgi ekleme
async function postHandler(request) {
  try {
    const body = await request.json();
    const validatedData = watchedInfoCreateSchema.parse(body);

    const { userId, productId, type } = validatedData;

    // Kullanıcının bu ürüne erişimi olup olmadığını kontrol et
    const userProduct = await prisma.userProduct.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (!userProduct || !userProduct.isActive) {
      return createSuccessResponse(false, null, 'USER_NOT_ASSIGNED_TO_PRODUCT');
    }

    // Ürünün bu InfoType'ı destekleyip desteklemediğini kontrol et
    const productInfoType = await prisma.productInfoType.findUnique({
      where: {
        productId_infoType: {
          productId,
          infoType: type
        }
      }
    });

    if (!productInfoType || !productInfoType.isActive) {
      return createSuccessResponse(false, null, 'INFO_TYPE_NOT_SUPPORTED');
    }

    // Aynı ürün için aynı türde maksimum kayıt kontrolü
    const count = await prisma.watchedInfo.count({
      where: {
        userId,
        productId,
        type,
        isActive: true
      }
    });

    if (count >= productInfoType.maxCount) {
      return createSuccessResponse(false, null, 'MAX_LIMIT_REACHED');
    }

    const watchedInfo = await prisma.watchedInfo.create({
      data: {
        ...validatedData,
        userId,
        productId
      },
      include: {
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return createSuccessResponse(true, watchedInfo, 'WATCHED_INFO_CREATE_SUCCESS');
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);