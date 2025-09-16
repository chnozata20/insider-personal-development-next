'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { passwordResetSchema } from '@/lib/schemas/auth';
import { authService } from '@/lib/services/auth';
import { translations } from '@/translations/index';
import { PasswordInput } from '@/components/ui/password-input';
import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidCode, setIsValidCode] = useState(true);

  const code = searchParams.get('code');

  useEffect(() => {
    if (!code) {
      setIsValidCode(false);
    }
  }, [code]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      code
    }
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await authService.resetPassword(data, {
        successMessage: t.passwordResetSuccess,
        errorMessage: t.passwordResetError,
        onSuccess: () => {
          // Başarılı olduğunda login sayfasına yönlendir
          router.push('/login');
        }
      });
    } catch (error) {
      // Hata zaten API tarafından işlendi
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidCode) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="text-destructive text-center">
          <h2 className="text-2xl font-semibold">{t.resetPasswordInvalidCode}</h2>
          <p className="mt-2">{t.resetPasswordInvalidCodeDescription}</p>
        </div>
        <Link
          href="/forgot-password"
          className="text-primary hover:underline"
        >
          {t.resetPasswordRequestNewCode}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <PasswordInput
          {...register('password')}
          placeholder={t.newPasswordPlaceholder}
          error={errors.password?.message}
        />
        <PasswordInput
          {...register('confirmPassword')}
          placeholder={t.confirmPasswordPlaceholder}
          error={errors.confirmPassword?.message}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? t.loading : t.resetPasswordSubmit}
      </Button>
    </form>
  );
} 