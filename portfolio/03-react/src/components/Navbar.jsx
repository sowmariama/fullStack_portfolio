// Navbar.jsx — Composant réutilisable
// Link de react-router-dom remplace <a href>
// Pourquoi ? Link ne recharge pas la page, il demande à React Router
// d'afficher le bon composant

import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-gray-900 border-b-4 border-blue-600 py-5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo — clique ramène à la liste des projets */}
        <Link to="/" className="flex flex-col">
          <span className="text-2xl font-bold text-white">MBS</span>
          <span className="text-blue-400 text-sm -mt-1">Mairam Baidy Sow</span>
        </Link>

        {/* Liens de navigation */}
        <div className="flex items-center gap-8 text-white font-medium">
          <Link to="/" className="hover:text-blue-400 transition">Projets</Link>
          <Link to="/contact" className="hover:text-blue-400 transition">Contact</Link>
        </div>

        {/* Bouton Ajouter */}
        <Link to="/ajouter" 
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl text-white font-medium transition">
          + Ajouter un projet
        </Link>

      </div>
    </nav>
  );
}

export default Navbar;