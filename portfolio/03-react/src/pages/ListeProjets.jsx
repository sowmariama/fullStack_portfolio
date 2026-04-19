// ListeProjets.jsx
// useState : stocke la liste des projets dans la mémoire du composant
// useEffect : exécute du code au chargement de la page (comme un "onload")
// Link : navigation sans rechargement vers la page détail

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import { getProjets, supprimerProjet } from '../services/projetService';

function ListeProjets() {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Au chargement de la page, on récupère les projets depuis json-server
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
      // Met à jour la liste sans recharger la page
      setProjets(projets.filter(p => p.id !== id));
    } catch (error) {
      console.error("Erreur suppression :", error);
    }
  };

  return (
    <>
      <Hero />

      <section id="projets" className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Titre section */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-slate-800">Mes projets</h2>
          <Link to="/ajouter"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-all hover:scale-105">
            + Ajouter un projet
          </Link>
        </div>

        {/* Chargement */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 mt-4">Chargement des projets...</p>
          </div>
        )}

        {/* Aucun projet */}
        {!loading && projets.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500 text-xl">Aucun projet pour l'instant.</p>
            <Link to="/ajouter" className="text-blue-600 hover:underline mt-4 inline-block">
              Ajouter votre premier projet
            </Link>
          </div>
        )}

        {/* Grille des projets */}
        {!loading && projets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projets.map(projet => (
              <div key={projet.id}
                   className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                
                {/* Image */}
                <div className="overflow-hidden h-48">
                  <img src={projet.image}
                       alt={projet.titre}
                       onError={(e) => e.target.src = 'https://placehold.co/400x200/1e40af/white?text=Projet'}
                       className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                </div>

                {/* Contenu carte */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {projet.titre}
                  </h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                    {projet.description}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {projet.technologies.map((tech, index) => (
                      <span key={index}
                            className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Boutons */}
                  <div className="flex items-center justify-between">
                    <Link to={`/projet/${projet.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 hover:underline">
                      Voir le détail →
                    </Link>
                    <div className="flex gap-2">
                      <Link to={`/modifier/${projet.id}`}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg text-sm transition">
                          Modifier
                      </Link>
                      <button onClick={() => handleSupprimer(projet.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-500 px-3 py-2 rounded-lg text-sm transition">
                          Supprimer
                      </button>
                    </div>
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