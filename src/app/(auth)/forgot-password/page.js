'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { forgotPasswordSchema } from '@/lib/schemas/auth';
import { authService } from '@/lib/services/auth';
import { translations } from '@/translations/index';

export default function ForgotPasswordPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await authService.requestPasswordReset(data.email, {
        successMessage: t.passwordResetRequestSent,
        errorMessage: t.passwordResetRequestError,
        onSuccess: () => {
          // Başarılı olduğunda login sayfasına yönlendir
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      });
    } catch (error) {
      // Hata zaten API tarafından işlendi
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      <div className="space-y-2">
        <Input
          {...register('email')}
          type="email"
          placeholder={t.emailPlaceholder}
          error={errors.email?.message}
          defaultValue={'chnozata5@gmail.com'}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? t.loading : t.forgotPasswordSubmit}
      </Button>
    </form>
  );
} 