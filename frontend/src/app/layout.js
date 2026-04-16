import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'WeaveStudio - Handcrafted Crochet Creations',
  description: 'Shop handmade crochet garlands, hair accessories, brooches & more from WeaveStudio. Each piece is crafted with love.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
