'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations';
import { productService } from '@/lib/services/product';
import { productCreateSchema } from '@/lib/schemas/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, X, ArrowLeft } from 'lucide-react';

export function ProductForm({ mode = 'create', productId = null }) {
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
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      features: [''],
      isActive: true,
      infoTypes: [{ infoType: '', maxCount: 1 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "features",
    shouldUnregister: false
  });

  const { fields: infoTypeFields, append: appendInfoType, remove: removeInfoType } = useFieldArray({
    control,
    name: "infoTypes",
    shouldUnregister: false
  });

  useEffect(() => {
    if (fields.length === 0) {
      append('');
    }
    if (infoTypeFields.length === 0) {
      appendInfoType({ infoType: '', maxCount: 1 });
    }
  }, [fields.length, append, infoTypeFields.length, appendInfoType]);

  useEffect(() => {
    if (mode === 'edit' && productId) {
      const fetchProduct = async () => {
        try {
          const product = await productService.getProduct(productId);
          reset({
            name: product.name,
            description: product.description,
            features: product.features.length > 0 ? product.features : [''],
            isActive: product.isActive,
            infoTypes: product.productInfoTypes?.length > 0 ? product.productInfoTypes.map(i => ({ infoType: i.infoType, maxCount: i.maxCount })) : [{ infoType: '', maxCount: 1 }]
          });
        } catch (error) {
          router.push('/products');
        } finally {
          setIsInitialLoading(false);
        }
      };

      fetchProduct();
    }
  }, [mode, productId, reset, router]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      const features = data.features.filter(feature => feature.trim().length > 0);
      const infoTypes = data.infoTypes.filter(i => i.infoType.trim().length > 0 && i.maxCount > 0);

      if (mode === 'create') {
        await productService.createProduct({
          ...data,
          features,
          infoTypes
        });

        setTimeout(() => {
          router.push('/products');
        }, 1000);
      } else {
        const updatedProduct = await productService.updateProduct(productId, {
          ...data,
          features,
          infoTypes
        });

        reset({
          name: updatedProduct.name,
          description: updatedProduct.description,
          features: updatedProduct.features.length > 0 ? updatedProduct.features : [''],
          isActive: updatedProduct.isActive,
          infoTypes: updatedProduct.productInfoTypes?.length > 0 ? updatedProduct.productInfoTypes.map(i => ({ infoType: i.infoType, maxCount: i.maxCount })) : [{ infoType: '', maxCount: 1 }]
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
            <CardTitle>{mode === 'create' ? t.newProduct : t.editProduct}</CardTitle>
            <Button
              variant="outline"
              onClick={() => router.push('/products')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.backToProducts}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t.productName}</Label>
              <Input
                id="name"
                placeholder={t.productName}
                {...register('name')}
                error={errors.name?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t.description}</Label>
              <Textarea
                id="description"
                placeholder={t.description}
                {...register('description')}
                error={errors.description?.message}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.features}</Label>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      placeholder={`${t.feature} ${index + 1}`}
                      {...register(`features.${index}`)}
                      error={errors.features?.[index]?.message}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => append('')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t.addFeature}
                </Button>
                {errors?.features?.root && (
                  <p className="text-sm text-red-500">
                    {errors.features.root.message}
                  </p>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {t.featuresDescription}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Desteklenen Bilgi Türleri (InfoTypes)</Label>
              <div className="space-y-2">
                {infoTypeFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <Input
                      placeholder={`InfoType ör: EMAIL, PHONE, ...`}
                      {...register(`infoTypes.${index}.infoType`)}
                      error={errors.infoTypes?.[index]?.infoType?.message}
                    />
                    <Input
                      type="number"
                      min={1}
                      placeholder="maxCount"
                      {...register(`infoTypes.${index}.maxCount`, { valueAsNumber: true })}
                      error={errors.infoTypes?.[index]?.maxCount?.message}
                      className="w-24"
                    />
                    {infoTypeFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeInfoType(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => appendInfoType({ infoType: '', maxCount: 1 })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  InfoType Ekle
                </Button>
                {errors?.infoTypes?.root && (
                  <p className="text-sm text-red-500">
                    {errors.infoTypes.root.message}
                  </p>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Her bilgi türü için maksimum kaç adet eklenebileceğini belirleyin.</p>
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