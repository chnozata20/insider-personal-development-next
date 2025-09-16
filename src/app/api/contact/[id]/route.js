import prisma from '@/lib/prisma';
import { handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/utils/error';
import { withAuth } from '@/lib/utils/api-wrapper';
import { contactUpdateSchema } from '@/lib/schemas/contact';

// Contact detayı getir (Admin)
async function getHandler(request, { params }) {
  try {
    const { id } = params;

    const contact = await prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      return createErrorResponse('Contact mesajı bulunamadı', 404);
    }

    return createSuccessResponse(true, contact, 'CONTACT_GET_SUCCESS');
  } catch (error) {
    return handleApiError(error);
  }
}

// Contact güncelle (Admin)
async function patchHandler(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    // Şema validasyonu
    const validatedData = contactUpdateSchema.parse(body);

    const contact = await prisma.contact.update({
      where: { id },
      data: validatedData,
    });

    return createSuccessResponse(true, contact, 'CONTACT_UPDATE_SUCCESS');
  } catch (error) {
    return handleApiError(error);
  }
}

// Contact sil (Admin)
async function deleteHandler(request, { params }) {
  try {
    const { id } = params;

    const contact = await prisma.contact.delete({
      where: { id },
    });

    return createSuccessResponse(true, contact, 'CONTACT_DELETE_SUCCESS');
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withAuth(getHandler);
export const PATCH = withAuth(patchHandler);
export const DELETE = withAuth(deleteHandler); 