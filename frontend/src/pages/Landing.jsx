import { Link } from 'react-router-dom';
import { Trophy, Instagram, Users, Download, Shield, Zap, CheckCircle } from 'lucide-react';
import Footer from '../components/layout/Footer';

const features = [
  { icon: Instagram,    title: 'Sorteos de Instagram', desc: 'Conectá tu cuenta y seleccioná ganadores de los comentarios de cualquier publicación.' },
  { icon: Users,        title: 'Sorteos manuales',     desc: 'Cargá tu lista de participantes y realizá sorteos rápidos sin necesidad de Instagram.' },
  { icon: Shield,       title: 'Resultados verificables', desc: 'Cada sorteo genera un acta descargable en PDF que podés compartir con tu audiencia.' },
  { icon: Zap,          title: 'Filtros avanzados',    desc: 'Filtrá por menciones, palabras clave, excluí cuentas y eliminá duplicados fácilmente.' },
  { icon: Download,     title: 'Certificado PDF',      desc: 'Descargá el acta oficial del sorteo con todos los participantes y ganadores.' },
  { icon: CheckCircle,  title: 'Transparente y justo', desc: 'Algoritmo Fisher-Yates auditado. Cada participante tiene las mismas probabilidades.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg font-sans">
      {/* Navbar */}
      <header className="bg-white border-b border-brand-accent sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-brand-dark text-lg">
            <Trophy size={22} className="text-brand-orange" />
            Sorteo Pro
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/login"    className="btn btn-ghost text-sm">Ingresar</Link>
            <Link to="/register" className="btn btn-primary text-sm">Crear cuenta gratis</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 py-20 text-center">
          <span className="badge badge-orange mb-4">Gratis durante el lanzamiento</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-brand-dark leading-tight mb-4">
            Sorteos de Instagram<br />
            <span className="text-brand-orange">transparentes y automatizados</span>
          </h1>
          <p className="text-lg text-brand-text/70 max-w-2xl mx-auto mb-8">
            Realizá sorteos justos a partir de los comentarios de tus publicaciones, aplicá filtros avanzados y generá un acta certificada en PDF para compartir con tu audiencia.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="btn btn-primary text-base px-8 py-3">
              Empezar ahora — es gratis
            </Link>
            <Link to="/login" className="btn btn-secondary text-base px-8 py-3">
              Ya tengo cuenta
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-brand-dark text-center mb-10">Todo lo que necesitás para un sorteo profesional</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="card p-6">
                  <div className="w-10 h-10 rounded-lg bg-brand-bg flex items-center justify-center mb-4">
                    <Icon size={20} className="text-brand-orange" />
                  </div>
                  <h3 className="font-bold text-brand-dark mb-2">{title}</h3>
                  <p className="text-sm text-brand-text/70">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-brand-dark mb-4">¿Listo para tu próximo sorteo?</h2>
            <p className="text-brand-text/70 mb-8">Creá tu cuenta gratis y realizá tu primer sorteo en menos de 2 minutos.</p>
            <Link to="/register" className="btn btn-primary text-base px-10 py-3">
              Crear cuenta gratis
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
