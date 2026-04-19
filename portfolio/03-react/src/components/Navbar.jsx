// Navbar.jsx – Version finale avec accent amber
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
        
        {/* Logo avec hover accent */}
        <Link to="/" className="group">
          <span className="text-2xl font-bold text-white">MBS</span>
          <span className="block text-blue-400 text-sm -mt-1 group-hover:text-amber-400 transition-colors duration-300">
            Mairam Baidy Sow
          </span>
        </Link>

        {/* Liens de navigation */}
        <div className="flex items-center gap-8">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `text-white font-medium transition-all duration-300 hover:text-amber-500 ${
                isActive ? 'text-amber-500 border-b-2 border-amber-500' : ''
              }`
            }
          >
            Projets
          </NavLink>
          <NavLink 
            to="/contact" 
            className={({ isActive }) => 
              `text-white font-medium transition-all duration-300 hover:text-amber-500 ${
                isActive ? 'text-amber-500 border-b-2 border-amber-500' : ''
              }`
            }
          >
            Contact
          </NavLink>
        </div>

        {/* Bouton Ajouter – reste bleu pour l'action principale */}
        <Link 
          to="/ajouter" 
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-full text-white font-medium transition-all hover:scale-105 hover:shadow-lg"
        >
          + Ajouter
        </Link>

      </div>
    </nav>
  );
}

export default Navbar;