// ListeProjets.jsx – Version finale avec accent amber
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import { getProjets, supprimerProjet } from '../services/projetService';

function ListeProjets() {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerProjets();
  }, []);

  const chargerProjets = async () => {
    try {
      const response = await getProjets();
      setProjets(response.data);
    } catch (error) {
      console.error("Erreur chargement projets :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce projet ?")) return;
    try {
      await supprimerProjet(id);
      setProjets(projets.filter(p => p.id !== id));
    } catch (error) {
      console.error("Erreur suppression :", error);
    }
  };

  return (
    <>
      <Hero />

      <section id="projets" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        
        {/* En-tête avec accent */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
              Mes projets
            </h2>
            <div className="w-20 h-1 bg-amber-500 rounded-full mt-2"></div>
          </div>
          <Link
            to="/ajouter"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-all hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span> Ajouter un projet
          </Link>
        </div>

        {/* Chargement */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 mt-4">Chargement des créations...</p>
          </div>
        )}

        {/* Aucun projet */}
        {!loading && projets.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-xl mb-2">Aucun projet pour l'instant.</p>
            <Link
              to="/ajouter"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition"
            >
              + Ajouter un projet
            </Link>
          </div>
        )}

        {/* Grille des projets */}
        {!loading && projets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projets.map(projet => (
              <div
                key={projet.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
              >
                {/* Image avec overlay */}
                <div className="relative overflow-hidden h-56 bg-slate-200">
                  <img
                    src={projet.image}
                    alt={projet.titre}
                    onError={(e) => e.target.src = 'https://placehold.co/600x400/1e40af/white?text=Image+non+disponible'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <Link
                    to={`/projet/${projet.id}`}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  >
                    <span className="bg-white text-slate-800 px-4 py-2 rounded-full text-sm font-semibold">
                      Voir le projet →
                    </span>
                  </Link>
                </div>

                {/* Corps */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">
                    {projet.titre}
                  </h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">
                    {projet.description}
                  </p>

                  {/* Technologies avec accent amber */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {projet.technologies.slice(0, 3).map((tech, index) => (
                      <span
                        key={index}
                        className="bg-amber-50 text-amber-700 text-xs px-3 py-1 rounded-full font-medium border border-amber-200"
                      >
                        {tech}
                      </span>
                    ))}
                    {projet.technologies.length > 3 && (
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                        +{projet.technologies.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex gap-2">
                      <Link
                        to={`/modifier/${projet.id}`}
                        className="text-slate-500 hover:text-amber-600 p-2 rounded-full hover:bg-amber-50 transition"
                        title="Modifier"
                      >
                        
                      </Link>
                      <button
                        onClick={() => handleSupprimer(projet.id)}
                        className="text-slate-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition"
                        title="Supprimer"
                      >
                        
                      </button>
                    </div>
                    <Link
                      to={`/projet/${projet.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-amber-600 transition flex items-center gap-1"
                    >
                      Détails →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default ListeProjets;