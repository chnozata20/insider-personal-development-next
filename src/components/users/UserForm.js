'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { userCreateSchema, userUpdateSchema } from '@/lib/schemas/user';
import { userService } from '@/lib/services/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { PasswordInput } from '@/components/ui/password-input';

export function UserForm({ mode = 'create', userId = null }) {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(mode === 'edit');

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset
  } = useForm({
    resolver: zodResolver(mode === 'create' ? userCreateSchema : userUpdateSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      newPassword: '',
      role: 'USER',
      isActive: true,
      twoFactorEnabled: false
    }
  });

  useEffect(() => {
    if (mode === 'edit' && userId) {
      const fetchUser = async () => {
        try {
          const data = await userService.getUser(userId);
          reset({
            name: data.name,
            email: data.email,
            role: data.role,
            isActive: data.isActive,
            twoFactorEnabled: data.twoFactorEnabled
          });
        } catch (error) {
          router.push('/users');
        } finally {
          setIsInitialLoading(false);
        }
      };

      fetchUser();
    }
  }, [mode, userId, reset, router]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      if (mode === 'create') {
        await userService.createUser(data);
        setTimeout(() => {
          router.push('/users');
        }, 1000);
      } else {
        const updatedUser = await userService.updateUser(userId, data);
        reset({
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
          twoFactorEnabled: updatedUser.twoFactorEnabled
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p>{t.loading}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{mode === 'create' ? t.newUser : t.editUser}</CardTitle>
            <Button
              variant="outline"
              onClick={() => router.push('/users')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.backToUsers}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                placeholder={t.name}
                {...register('name')}
                error={errors.name?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t.email}
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {mode === 'create' ? t.password : t.newPassword}
              </Label>
              <PasswordInput
                id={mode === 'create' ? 'password' : 'newPassword'}
                placeholder={mode === 'create' ? t.password : t.newPassword}
                {...register(mode === 'create' ? 'password' : 'newPassword')}
                error={errors[mode === 'create' ? 'password' : 'newPassword']?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">{t.role}</Label>
              <Controller
                name="role"
                control={control}
                defaultValue="USER"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectRole} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">{t.admin}</SelectItem>
                      <SelectItem value="USER">{t.user}</SelectItem>
                      <SelectItem value="DEMO_USER">{t.demoUser}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="isActive"
                control={control}
                defaultValue={true}
                render={({ field }) => (
                  <Switch
                    id="isActive"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isActive">{t.status}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="twoFactorEnabled"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <Switch
                    id="twoFactorEnabled"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="twoFactorEnabled">{t.twoFactorTitle}</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                {t.cancel}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t.loading : t.save}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 