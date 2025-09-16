import prisma from '@/lib/prisma';
import { handleApiError, createSuccessResponse } from '@/lib/utils/error';
import { productCreateSchema } from '@/lib/schemas/product';
import { withAuth } from '@/lib/utils/api-wrapper';

// Ürün listesi
async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('status') === 'active' ? true : 
                    searchParams.get('status') === 'inactive' ? false : 
                    undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt_desc';
    const skip = (page - 1) * limit;

    // Arama ve durum filtresi için where koşulu
    const where = {
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Sıralama mantığını düzelt
    let orderBy = {};
    switch (sortBy) {
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
      case 'createdAt_asc':
        orderBy = { createdAt: 'asc' };
        break;
      case 'createdAt_desc':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          productInfoTypes: {
            where: { isActive: true },
            select: {
              infoType: true,
              maxCount: true
            }
          }
        }
      }),
      prisma.product.count({ where }),
    ]);

    return createSuccessResponse(true, {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }, 'PRODUCT_LIST_SUCCESS');
  } catch (error) {
    return handleApiError(error);
  }
}


// Yeni ürün ekleme
async function postHandler(request) {
  try {
    const body = await request.json();
    const validatedData = productCreateSchema.parse(body);

    const { infoTypes, ...productData } = validatedData;

    const product = await prisma.product.create({
      data: productData,
      include: {
        productInfoTypes: {
          where: { isActive: true },
          select: {
            infoType: true,
            maxCount: true
          }
        }
      }
    });

    // InfoTypes varsa ProductInfoType kayıtlarını oluştur
    if (infoTypes && infoTypes.length > 0) {
      await prisma.productInfoType.createMany({
        data: infoTypes.map(infoType => ({
          productId: product.id,
          infoType: infoType.infoType,
          maxCount: infoType.maxCount,
          isActive: true
        }))
      });

      // Güncellenmiş product'ı tekrar getir
      const updatedProduct = await prisma.product.findUnique({
        where: { id: product.id },
        include: {
          productInfoTypes: {
            where: { isActive: true },
            select: {
              infoType: true,
              maxCount: true
            }
          }
        }
      });

      return createSuccessResponse(true, updatedProduct, 'PRODUCT_CREATE_SUCCESS');
    }

    return createSuccessResponse(true, product, 'PRODUCT_CREATE_SUCCESS');
  } catch (error) {
    return handleApiError(error);
  }
} 

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);