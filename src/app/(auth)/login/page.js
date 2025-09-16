'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations/index';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/services/auth';
import { verificationService } from '@/lib/services/verification';
import { loginSchema } from '@/lib/schemas/auth';
import { Checkbox } from '@/components/ui/checkbox';
import { Countdown } from '@/components/countdown';

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const handleSendCode = async () => {
    try {
      setIsSendingCode(true);
      await verificationService.sendCode(
        { email, type: 'TWO_FACTOR' },
        {
          successMessage: t.twoFactorCodeSent,
          errorMessage: t.verificationCodeError
        }
      );
    } catch (error) {
      // Hata zaten API tarafından işlendi
    } finally {
      setIsSendingCode(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setPassword(data.password);
      const response = await authService.login(data, {
        successMessage: t.loginSuccess,
        errorMessage: t.loginError,
      });

      if (response.requires2FA) {
        setEmail(data.email);
        setShow2FA(true);
        setValue('password', '');
        setValue('code', '');
      } else {
        window.location.href = `/internetMonitoring/${response.user.id}`;
      }
    } catch (error) {
      // Hata zaten API tarafından işlendi
    } finally {
      setIsLoading(false);
    }
  };

  const onVerify2FA = async (data) => {
    try {
      setIsLoading(true);

      // login isteği at
      await authService.login(
        { email, password, code: data.code },
        {
          successMessage: t.loginSuccess,
          errorMessage: t.loginError,
          onSuccess: () => window.location.href = `/internetMonitoring/${response.user.id}`
        }
      );
    } catch (error) {
      // Hata zaten API tarafından işlendi
    } finally {
      setIsLoading(false);
    }
  };

  if (show2FA) {
    return (
      <form onSubmit={handleSubmit(onVerify2FA)} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder={t.verificationCodePlaceholder}
            {...register('code')}
            error={errors.code?.message}
          />
          <Countdown 
            onResend={handleSendCode}
            isSending={isSendingCode}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t.loading : t.verifyButton}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t.email}</label>
        <Input
          type="email"
          placeholder={t.emailPlaceholder}
          {...register('email')}
          error={errors.email?.message}
          defaultValue={''}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t.password}</label>
        <PasswordInput
          placeholder={t.passwordPlaceholder}
          {...register('password')}
          error={errors.password?.message}
          defaultValue={''}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Controller
          name="rememberMe"
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <Checkbox
              id="rememberMe"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <label
          htmlFor="rememberMe"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {t.rememberMe}
        </label>
      </div>
      <Button type="submit" className="w-full bg-perseusPrimary" disabled={isLoading}>
        {isLoading ? t.loading : t.loginButton}
      </Button>
    </form>
  );
} 