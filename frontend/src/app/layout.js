import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import BottomNavigation from '@/components/BottomNavigation';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'WeaveStudio — Handcrafted Crochet & Artisan Boutique',
  description: 'Discover handmade crochet flowers, everlasting roses, hair accessories & pooja garlands. Woven with care, made uniquely for you.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1A1713] antialiased selection:bg-[#EFCEBF] selection:text-[#3D2A1C]">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 2500,
            style: {
              background: '#261F1A',
              color: '#FAF8F5',
              borderRadius: '9999px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            },
            success: {
              iconTheme: {
                primary: '#C86D51',
                secondary: '#FAF8F5',
              },
            },
          }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <BottomNavigation />
        <WhatsAppButton />
      </body>
    </html>
  );
}
