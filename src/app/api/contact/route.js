import prisma from '@/lib/prisma';
import { handleApiError, createSuccessResponse, createErrorResponse } from '@/lib/utils/error';
import { sendVerificationEmail } from '@/lib/utils/email';
import { withAuth } from '@/lib/utils/api-wrapper';
import { contactCreateSchema, contactFilterSchema } from '@/lib/schemas/contact';

// Contact form gönderme
async function postHandler(request) {
  try {
    const body = await request.json();
    
    // Şema validasyonu
    const validatedData = contactCreateSchema.parse(body);
    const { firstName, lastName, email, companyName, phoneNumber, message } = validatedData;

    // Create contact record in database
    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        email,
        companyName: companyName || null,
        phoneNumber: phoneNumber || null,
        message,
      },
    });

    // Send email to admin
    await sendVerificationEmail(email, contact.id, 'CONTACT_FORM', {
      contactId: contact.id,
      firstName,
      lastName,
      email,
      companyName,
      phoneNumber,
      message,
    });


    return createSuccessResponse(true, {
      contactId: contact.id,
      message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.'
    }, 'CONTACT_CREATE_SUCCESS');

  } catch (error) {
    return handleApiError(error);
  }
}

async function getHandler(request) {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const search = searchParams.get('search') || '';
      const status = searchParams.get('status');
      const sortBy = searchParams.get('sortBy') || 'createdAt_desc';
      const skip = (page - 1) * limit;
  
      // Filtreleme için where koşulu
      const where = {
        ...(status && { status }),
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { companyName: { contains: search, mode: 'insensitive' } },
            { message: { contains: search, mode: 'insensitive' } }
          ]
        })
      };
  
      // Sıralama mantığı
      let orderBy = {};
      switch (sortBy) {
        case 'firstName_asc':
          orderBy = { firstName: 'asc' };
          break;
        case 'firstName_desc':
          orderBy = { firstName: 'desc' };
          break;
        case 'createdAt_asc':
          orderBy = { createdAt: 'asc' };
          break;
        case 'createdAt_desc':
        default:
          orderBy = { createdAt: 'desc' };
          break;
      }
  
      const [contacts, total] = await Promise.all([
        prisma.contact.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        prisma.contact.count({ where }),
      ]);
  
      return createSuccessResponse(true, {
        contacts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }, 'CONTACT_LIST_SUCCESS');
    } catch (error) {
      return handleApiError(error);
    }
  }
  
export const GET = withAuth(getHandler); 
export const POST = withAuth(postHandler); 