export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">WeaveStudio</h3>
            <p className="text-sm text-gray-500 mt-1">Handcrafted crochet creations, made with love.</p>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="mailto:contact@weavestudio.com" className="hover:text-black">
              contact@weavestudio.com
            </a>
          </div>
        </div>
        <div className="mt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} WeaveStudio. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
