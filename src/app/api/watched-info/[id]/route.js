import prisma from '@/lib/prisma';
import { handleApiError, createSuccessResponse } from '@/lib/utils/error';
import { withAuth } from '@/lib/utils/api-wrapper';
import { watchedInfoUpdateSchema } from '@/lib/schemas/watchedInfo';

// İzlenen bilgi güncelleme
async function patchHandler(request, context) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    const validatedData = watchedInfoUpdateSchema.parse(data);

    const watchedInfo = await prisma.watchedInfo.findFirst({
      where: {
        id,
        isActive: true
      }
    });

    if (!watchedInfo) {
      return createSuccessResponse(false, null, 'WATCHED_INFO_NOT_FOUND');
    }

    const updatedWatchedInfo = await prisma.watchedInfo.update({
      where: { id },
      data: validatedData,
      include: {
        product: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return createSuccessResponse(true, updatedWatchedInfo, 'WATCHED_INFO_UPDATE_SUCCESS');
  } catch (error) {
    return handleApiError(error);
  }
}

// İzlenen bilgi silme (soft delete)
async function deleteHandler(request, context) {
  try {
    const { id } = await context.params;

    const watchedInfo = await prisma.watchedInfo.findFirst({
      where: {
        id,
        isActive: true
      }
    });

    if (!watchedInfo) {
      return createSuccessResponse(false, null, 'WATCHED_INFO_NOT_FOUND');
    }

    await prisma.watchedInfo.update({
      where: { id },
      data: { isActive: false }
    });

    return createSuccessResponse(true, null, 'WATCHED_INFO_DELETE_SUCCESS');
  } catch (error) {
    return handleApiError(error);
  }
}

export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler); 