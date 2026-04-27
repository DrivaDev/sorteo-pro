import { Trophy } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white/70 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Trophy size={16} className="text-brand-orange" />
          Sorteo Pro
        </div>
        <p>Sorteos de Instagram transparentes y verificables</p>
        <p>Desarrollado por <a href="https://drivadev.com" target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:text-white transition-colors">Driva Dev</a></p>
      </div>
    </footer>
  );
}
