'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations/index';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { Countdown } from '@/components/countdown';
import { authService } from '@/lib/services/auth';
import { verificationService } from '@/lib/services/verification';
import { registerSchema } from '@/lib/schemas/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const email = watch('email');

  const handleSendCode = async () => {
    try {
      setIsSendingCode(true);
      await verificationService.sendCode(
        { email, type: 'EMAIL_VERIFY' },
        {
          successMessage: t.verificationCodeSent,
          errorMessage: t.verificationCodeError
        }
      );
      setShowCountdown(true);
    } catch (error) {
      // Hata zaten API tarafından işlendi
    } finally {
      setIsSendingCode(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      // Doğrulama başarılıysa kayıt işlemini gerçekleştir
      await authService.register(data, {
        successMessage: t.registerSuccess,
        onSuccess: () => router.push('/login')
      });
    } catch (error) {
      // Hata zaten API tarafından işlendi
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder={t.namePlaceholder}
          {...register('name')}
          error={errors.name?.message}
          defaultValue={'cihan'}
        />
      </div>
      <div className="space-y-2">
        <Input
          type="email"
          placeholder={t.emailPlaceholder}
          {...register('email')}
          error={errors.email?.message}
          defaultValue={'chnozata5@gmail.com'}
        />
      </div>
      <div className="space-y-2">
        <PasswordInput
          placeholder={t.passwordPlaceholder}
          {...register('password')}
          error={errors.password?.message}
          defaultValue={'Gala-1905'}
        />
      </div>
      <div className="space-y-2">
        <PasswordInput
          placeholder={t.confirmPasswordPlaceholder}
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          defaultValue={'Gala-1905'}
        />
      </div>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={t.verificationCodePlaceholder}
            {...register('verificationCode')}
            error={errors.verificationCode?.message}
          />
          <Button
            type="button"
            onClick={handleSendCode}
            disabled={isSendingCode || showCountdown}
            className="whitespace-nowrap"
          >
            {isSendingCode ? t.sending : t.sendCode}
          </Button>
        </div>
        {showCountdown && (
          <Countdown 
            onResend={handleSendCode}
            isSending={isSendingCode}
          />
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? t.loading : t.registerButton}
      </Button>
    </form>
  );
}