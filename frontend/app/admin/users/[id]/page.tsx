// app/(admin)/users/[id]/page.tsx

'use client';

import { UserDetail } from '@/components/admin/UserDetail';

interface UserDetailPageProps {
  params: {
    id: string;
  };
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  return <UserDetail userId={params.id} />;
}