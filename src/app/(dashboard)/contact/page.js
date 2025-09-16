'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { contactService } from '@/lib/services/contact';
import { contactCreateSchema } from '@/lib/schemas/contact';

export default function ContactPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(contactCreateSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      await contactService.create(data);

      reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-foreground">
              {t.contactTitle}
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {t.contactDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                    {t.firstName} *
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder={t.firstNamePlaceholder}
                    {...register('firstName')}
                    error={errors.firstName?.message}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                    {t.lastName} *
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder={t.lastNamePlaceholder}
                    {...register('lastName')}
                    error={errors.lastName?.message}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  {t.email} *
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  {...register('email')}
                  error={errors.email?.message}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-2">
                    {t.companyName}
                  </label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder={t.companyNamePlaceholder}
                    {...register('companyName')}
                    error={errors.companyName?.message}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-foreground mb-2">
                    {t.phoneNumber}
                  </label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder={t.phoneNumberPlaceholder}
                    {...register('phoneNumber')}
                    error={errors.phoneNumber?.message}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  {t.message} *
                </label>
                <Textarea
                  id="message"
                  placeholder={t.messagePlaceholder}
                  {...register('message')}
                  error={errors.message?.message}
                  rows={6}
                  className="w-full resize-none"
                />
              </div>

              <div className="text-center">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto px-8 py-3 text-lg"
                >
                  {isLoading ? t.sendingMessage : t.sendMessage}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}