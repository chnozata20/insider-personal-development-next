import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleApiError, createSuccessResponse } from '@/lib/utils/error';
import { productUpdateSchema } from '@/lib/schemas/product';
import { withAuth } from '@/lib/utils/api-wrapper';

// Ürün detayı
async function getHandler(request, context) {
  try {
    const { id } = await context.params;
    console.log('Ürün detayı isteği:', { id });

    const product = await prisma.product.findUnique({
      where: { id },
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

    console.log('Bulunan ürün:', product);

    if (!product) {
      return createSuccessResponse(false, null, 'PRODUCT_NOT_FOUND');
    }

    return createSuccessResponse(true, product, 'PRODUCT_DETAIL_SUCCESS');
  } catch (error) {
    console.error('Ürün detayı hatası:', error);
    return handleApiError(error);
  }
}


// Ürün güncelleme
async function patchHandler(request, context) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validatedData = productUpdateSchema.parse(body);

    const { infoTypes, ...productData } = validatedData;

    const product = await prisma.product.update({
      where: { id },
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

    // InfoTypes güncellenmişse ProductInfoType kayıtlarını güncelle
    if (infoTypes !== undefined) {
      // Mevcut ProductInfoType kayıtlarını sil
      await prisma.productInfoType.deleteMany({
        where: { productId: id }
      });

      // Yeni ProductInfoType kayıtlarını oluştur
      if (infoTypes && infoTypes.length > 0) {
        await prisma.productInfoType.createMany({
          data: infoTypes.map(infoType => ({
            productId: id,
            infoType: infoType.infoType,
            maxCount: infoType.maxCount,
            isActive: true
          }))
        });
      }

      // Güncellenmiş product'ı tekrar getir
      const updatedProduct = await prisma.product.findUnique({
        where: { id },
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

      return createSuccessResponse(true, updatedProduct, 'PRODUCT_UPDATE_SUCCESS');
    }

    return createSuccessResponse(true, product, 'PRODUCT_UPDATE_SUCCESS');
  } catch (error) {
    return handleApiError(error);
  }
}

// Ürün silme
async function deleteHandler(request, context) {
  try {
    const { id } = await context.params;

    // Ürünün var olup olmadığını kontrol et
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return createSuccessResponse(false, null, 'PRODUCT_NOT_FOUND');
    }

    // Ürünün kullanıcılara atanıp atanmadığını kontrol et
    const userProductCount = await prisma.userProduct.count({
      where: { productId: id }
    });

    if (userProductCount > 0) {
      return createSuccessResponse(false, null, 'PRODUCT_HAS_ASSIGNED_USERS');
    }

    // Ürünün WatchedInfo kayıtları olup olmadığını kontrol et
    const watchedInfoCount = await prisma.watchedInfo.count({
      where: { productId: id }
    });

    if (watchedInfoCount > 0) {
      return createSuccessResponse(false, null, 'PRODUCT_HAS_WATCHED_INFO');
    }

    // Ürünün ProductInfoType kayıtlarını sil
    await prisma.productInfoType.deleteMany({
      where: { productId: id }
    });

    // Ürünü sil
    await prisma.product.delete({
      where: { id },
    });

    return createSuccessResponse(true, null, 'PRODUCT_DELETE_SUCCESS');
  } catch (error) {
    return handleApiError(error);
  }
}

export const DELETE = withAuth(deleteHandler);
export const GET = withAuth(getHandler);
export const PATCH = withAuth(patchHandler);