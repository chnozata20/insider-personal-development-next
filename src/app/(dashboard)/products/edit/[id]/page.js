'use client';

import { useParams } from 'next/navigation';
import { ProductForm } from '@/components/products/ProductForm';

export default function EditProductPage() {
  const params = useParams();
  return <ProductForm mode="edit" productId={params.id} />;
} 