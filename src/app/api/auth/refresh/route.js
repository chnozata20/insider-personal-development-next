import { handleApiError, createSuccessResponse } from '@/lib/utils/error';
import { verifyToken, generateAccessToken } from '@/lib/utils/token';
import prisma from '@/lib/prisma';
import { withAuth } from '@/lib/utils/api-wrapper';

async function refreshHandler(request) {
  try {
    // Refresh token'ı header'dan al
    const refreshToken = request.headers.get('x-refresh-token');
    const decoded = verifyToken(refreshToken);

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: decoded.email }
    });

    // Yeni access token oluştur
    const accessToken = generateAccessToken(user);

    return createSuccessResponse(
      true,
      { accessToken },
      'TOKEN_REFRESHED'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST = withAuth(refreshHandler); 