// DetailProjet.jsx – Version design premium
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProjet, supprimerProjet } from '../services/projetService';

function DetailProjet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projet, setProjet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerProjet();
  }, [id]);

  const chargerProjet = async () => {
    try {
      const response = await getProjet(id);
      setProjet(response.data);
    } catch (error) {
      console.error("Erreur chargement projet :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimer = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce projet ?")) return;
    try {
      await supprimerProjet(id);
      navigate('/');
    } catch (error) {
      console.error("Erreur suppression :", error);
    }
  };

  if (loading) return (
    <div className="text-center py-20">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="text-slate-500 mt-4">Chargement du projet...</p>
    </div>
  );

  if (!projet) return (
    <div className="text-center py-20">
      <p className="text-red-500 text-xl">Projet introuvable.</p>
      <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
        ← Retour à la liste
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      
      {/* Fil d'Ariane (breadcrumb) */}
      <nav className="text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Accueil</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800 font-medium">{projet.titre}</span>
      </nav>

      {/* En-tête avec image et titre côte à côte sur desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden shadow-lg bg-slate-100">
          <img 
            src={projet.image} 
            alt={projet.titre}
            onError={(e) => e.target.src = 'https://placehold.co/600x400/1e40af/white?text=Image+non+disponible'}
            className="w-full h-64 lg:h-full object-cover"
          />
        </div>

        {/* Infos principales */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">
            {projet.titre}
          </h1>
          <div className="flex items-center gap-3 text-sm text-slate-500 mb-6">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Projet</span>
            <span>•</span>
            <span>Mairam Baidy Sow</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {projet.description}
          </p>
        </div>
      </div>

      {/* Section Technologies */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-0.5 bg-blue-600 rounded-full"></span>
          Technologies utilisées
        </h2>
        <div className="flex flex-wrap gap-3">
          {projet.technologies.map((tech, index) => (
            <span 
              key={index}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-50 hover:text-blue-600 transition"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Boutons d'action – sans icônes */}
      <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-200 pt-10">
        <Link 
          to="/"
          className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-xl text-center font-medium hover:bg-slate-50 transition shadow-sm"
        >
          Retour à la liste
        </Link>
        <Link 
          to={`/modifier/${projet.id}`}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-center font-medium transition shadow-md hover:shadow-lg"
        >
          Modifier le projet
        </Link>
        <button 
          onClick={handleSupprimer}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition shadow-md hover:shadow-lg"
        >
          Supprimer le projet
        </button>
      </div>

    </div>
  );
}

export default DetailProjet;