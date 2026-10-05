'use client';

import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919999999999';
  const url = `https://wa.me/${phone}?text=Hi%20WeaveStudio!%20I'm%20interested%20in%20your%20handmade%20crochet%20creations.`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-6 right-5 z-40 group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white py-2.5 px-3.5 sm:px-4 rounded-full shadow-boutique hover:shadow-elevated transition-all duration-300 hover:scale-105 active:scale-95"
      aria-label="Chat with the artisan on WhatsApp"
    >
      <div className="relative">
        <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping opacity-75" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-[11px] font-bold leading-tight">Ask the Artisan</span>
        <span className="text-[9px] opacity-90 leading-tight hidden sm:inline">Custom orders & chat</span>
      </div>
    </a>
  );
}
