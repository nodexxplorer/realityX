// app/(admin)/chats/[chatId]/page.tsx

'use client';

import { ChatDetail } from '@/components/admin/ChatDetail';

interface ChatDetailPageProps {
  params: {
    chatid: string;
  };
}

export default function ChatDetailPage({ params }: ChatDetailPageProps) {
  return <ChatDetail chatId={params.chatid} />;
}