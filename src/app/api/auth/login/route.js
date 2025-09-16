import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { handleApiError, createSuccessResponse } from '@/lib/utils/error';
import { createSessionData } from '@/lib/utils/session';
import { loginSchema } from '@/lib/schemas/auth';
import { generateVerificationCode } from '@/lib/utils/verification';
import { sendVerificationEmail } from '@/lib/utils/email';
import { withAuth } from '@/lib/utils/api-wrapper';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION = 24 * 60 * 60 * 1000; // 24 saat
const RESET_ATTEMPTS_AFTER = 15 * 60 * 1000; // 15 dakika

// Başarısız giriş denemesini kaydet
async function handleFailedLogin(user) {
  const newAttempts = user.failedLoginAttempts + 1;
  const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: newAttempts,
      lastFailedLogin: new Date(),
      lockedUntil: shouldLock ? new Date(Date.now() + LOCK_DURATION) : null
    }
  });

  return shouldLock;
}

// Başarılı girişi kaydet
async function handleSuccessfulLogin(user) {
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lastFailedLogin: null,
      lockedUntil: null
    }
  });
}

// Hesap kilitli mi kontrol et
async function checkAccountLock(user) {
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return true;
  }

  // Son başarısız girişten bu yana 15 dakika geçtiyse deneme sayısını sıfırla
  if (user.lastFailedLogin && 
      (new Date().getTime() - user.lastFailedLogin.getTime() > RESET_ATTEMPTS_AFTER)) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lastFailedLogin: null
      }
    });
  }

  return false;
}

async function loginHandler(request) {
  try {
    const body = await request.json();
    console.log('bodybodybodybodybody');
    console.log(body);
    const validatedData = loginSchema.parse(body);

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      return createSuccessResponse(
        false,
        null,
        'INVALID_EMAIL'
      );
    }

    // Hesap kilitli mi kontrol et
    if (await checkAccountLock(user)) {
      return createSuccessResponse(
        false,
        null,
        'ACCOUNT_LOCKED'
      );
    }

    // 2FA kodu ile giriş yapılıyorsa
    if (validatedData.code) {
      // Doğrulama kodunu kontrol et
      const verificationCode = await prisma.verificationCode.findFirst({
        where: {
          email: validatedData.email,
          code: validatedData.code,
          type: 'TWO_FACTOR',
          used: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!verificationCode) {
        // Başarısız 2FA denemesi
        await handleFailedLogin(user);
        return createSuccessResponse(
          false,
          null,
          'INVALID_CODE'
        );
      }

      // Kodu kullanıldı olarak işaretle
      await prisma.verificationCode.update({
        where: { id: verificationCode.id },
        data: { used: true },
      });

      // Başarılı giriş
      await handleSuccessfulLogin(user);

      // Oturum bilgilerini oluştur
      const sessionData = createSessionData(user, validatedData.rememberMe);

      return createSuccessResponse(
        true,
        sessionData,
        '2FA_LOGIN_SUCCESS'
      );
    }

    // Normal giriş için şifreyi kontrol et
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);

    if (!isValidPassword) {
      // Başarısız giriş denemesi
      await handleFailedLogin(user);
      return createSuccessResponse(
        false,
        null,
        'INVALID_PASSWORD'
      );
    }

    // 2FA aktif mi kontrol et
    if (user.twoFactorEnabled) {
      // 2FA kodu gönder
      const code = generateVerificationCode();
      await prisma.verificationCode.create({
        data: {
          email: user.email,
          code,
          type: 'TWO_FACTOR',
          expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 dakika geçerli
        },
      });

      // 2FA kodu e-postası gönder
      await sendVerificationEmail(user.email, code, 'TWO_FACTOR');

      return createSuccessResponse(
        true,
        {
          requires2FA: true,
          email: user.email
        },
        '2FA_LOGIN_CODE_SENT'
      );
    }

    // Başarılı giriş
    await handleSuccessfulLogin(user);

    // Normal giriş işlemi
    const sessionData = createSessionData(user, validatedData.rememberMe);

    return createSuccessResponse(
      true,
      sessionData,
      'LOGIN_SUCCESS'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST = withAuth(loginHandler); 