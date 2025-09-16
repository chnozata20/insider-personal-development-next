'use client';

import { useParams } from 'next/navigation';
import { UserForm } from '@/components/users/UserForm';

export default function EditUserPage() {
  const params = useParams();
  return <UserForm mode="edit" userId={params.id} />;
} 