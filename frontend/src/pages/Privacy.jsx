import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import Footer from '../components/layout/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <header className="bg-white border-b border-brand-accent">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-brand-dark text-lg">
            <Trophy size={22} className="text-brand-orange" />
            Sorteo Pro
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <h1 className="text-3xl font-bold text-brand-dark mb-2">Política de Privacidad</h1>
        <p className="text-sm text-brand-text/50 mb-8">Última actualización: abril de 2025</p>

        <div className="prose prose-sm max-w-none space-y-8 text-brand-text/80">

          <section>
            <h2 className="text-lg font-bold text-brand-dark mb-2">1. Información que recopilamos</h2>
            <p>Sorteo Pro recopila la siguiente información para brindar el servicio:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Datos de cuenta:</strong> dirección de email y contraseña (almacenada de forma encriptada).</li>
              <li><strong>Datos de Instagram:</strong> cuando conectás tu cuenta de Instagram, accedemos a tu nombre de usuario y a los comentarios de tus publicaciones para realizar sorteos. No almacenamos contraseñas de Instagram.</li>
              <li><strong>Datos de sorteos:</strong> historial de sorteos realizados, incluyendo participantes y ganadores.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-dark mb-2">2. Cómo usamos la información</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Para ejecutar sorteos justos y transparentes a partir de los comentarios de tus publicaciones de Instagram.</li>
              <li>Para generar certificados PDF descargables de cada sorteo.</li>
              <li>Para enviarte correos de verificación de cuenta.</li>
              <li>Para mantener el historial de tus sorteos.</li>
            </ul>
            <p className="mt-2">No vendemos, compartimos ni utilizamos tus datos para publicidad.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-dark mb-2">3. Datos de Instagram</h2>
            <p>Sorteo Pro utiliza la API de Instagram (Meta) para:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Acceder a los comentarios de tus publicaciones.</li>
              <li>Obtener tu nombre de usuario de Instagram.</li>
            </ul>
            <p className="mt-2">El token de acceso de Instagram se almacena de forma segura y se usa exclusivamente para obtener los comentarios de tus publicaciones cuando realizás un sorteo. Podés desconectar tu cuenta de Instagram en cualquier momento desde Configuración.</p>
            <p className="mt-2">No accedemos a tus mensajes privados, datos de seguidores, ni información financiera.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-dark mb-2">4. Retención de datos</h2>
            <p>Conservamos tus datos mientras tu cuenta esté activa. Podés solicitar la eliminación de tu cuenta y todos tus datos en cualquier momento escribiendo a <strong>drivadev@gmail.com</strong>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-dark mb-2">5. Seguridad</h2>
            <p>Usamos encriptación para proteger tus datos. Las contraseñas se almacenan con hash bcrypt y los tokens de acceso se transmiten únicamente por HTTPS.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-dark mb-2">6. Cookies</h2>
            <p>Sorteo Pro no utiliza cookies de seguimiento. Solo usamos el almacenamiento local del navegador para mantener tu sesión activa.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-dark mb-2">7. Cambios a esta política</h2>
            <p>Podemos actualizar esta política ocasionalmente. Te notificaremos por email si hay cambios significativos.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-brand-dark mb-2">8. Contacto</h2>
            <p>Para consultas sobre privacidad, escribinos a <strong>drivadev@gmail.com</strong>.</p>
            <p className="mt-1">Desarrollado por <strong>Driva Dev</strong> — <a href="https://drivadev.com" target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:underline">drivadev.com</a></p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
