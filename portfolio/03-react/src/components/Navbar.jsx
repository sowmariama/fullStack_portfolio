import { Link, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-slate-900/90 backdrop-blur-md shadow-lg py-3' : 'bg-slate-900 py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo avec effet hover */}
        <Link to="/" className="group">
          <span className="text-2xl font-bold text-white">MBS</span>
          <span className="block text-blue-400 text-sm -mt-1 group-hover:text-amber-400 transition">
            Mairam Baidy Sow
          </span>
        </Link>

        {/* Liens avec NavLink pour l'état actif */}
        <div className="flex items-center gap-8">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `text-white font-medium transition hover:text-blue-400 ${isActive ? 'text-blue-400 border-b-2 border-blue-400' : ''}`
            }
          >
            Projets
          </NavLink>
          <NavLink 
            to="/contact" 
            className={({ isActive }) => 
              `text-white font-medium transition hover:text-blue-400 ${isActive ? 'text-blue-400 border-b-2 border-blue-400' : ''}`
            }
          >
            Contact
          </NavLink>
        </div>

        {/* Bouton Ajouter animé */}
        <Link 
          to="/ajouter" 
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full text-white font-medium transition-all hover:scale-105 hover:shadow-lg"
        >
          + Ajouter
        </Link>

      </div>
    </nav>
  );
}

export default Navbar;