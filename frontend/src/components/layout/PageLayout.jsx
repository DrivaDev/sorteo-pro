import Navbar from './Navbar';
import Footer from './Footer';

export default function PageLayout({ children, className = '' }) {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <Navbar />
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
