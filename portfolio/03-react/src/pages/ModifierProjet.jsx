// ModifierProjet.jsx – Version finale avec accent amber
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProjet, modifierProjet } from '../services/projetService';

function ModifierProjet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    titre: '',
    description: '',
    image: '',
    technologies: ''
  });

  useEffect(() => {
    chargerProjet();
  }, [id]);

  const chargerProjet = async () => {
    try {
      const response = await getProjet(id);
      const projet = response.data;
      setForm({
        titre: projet.titre,
        description: projet.description,
        image: projet.image,
        technologies: projet.technologies.join(', ')
      });
      setImagePreview(projet.image);
    } catch (error) {
      console.error("Erreur chargement projet :", error);
    } finally {
      setChargement(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'image') setImagePreview(value);
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.titre.trim()) newErrors.titre = 'Le titre est requis';
    if (!form.description.trim()) newErrors.description = 'La description est requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const projetModifie = {
        titre: form.titre.trim(),
        description: form.description.trim(),
        image: form.image || 'https://placehold.co/600x400/1e40af/white?text=Projet',
        technologies: form.technologies
          ? form.technologies.split(',').map(t => t.trim()).filter(t => t)
          : []
      };

      await modifierProjet(id, projetModifie);
      navigate(`/projet/${id}`);
    } catch (error) {
      console.error("Erreur modification :", error);
      alert("Vérifiez que json-server tourne sur le port 3000 !");
    } finally {
      setLoading(false);
    }
  };

  if (chargement) return (
    <div className="text-center py-20">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="text-slate-500 mt-4">Chargement du projet...</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      {/* Fil d'Ariane avec accent */}
      <nav className="text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-amber-600 transition">Accueil</Link>
        <span className="mx-2">/</span>
        <Link to={`/projet/${id}`} className="hover:text-amber-600 transition">Détail</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800 font-medium">Modifier</span>
      </nav>

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
          Modifier le projet
        </h1>
        <div className="w-20 h-1 bg-amber-500 rounded-full mt-2"></div>
        <p className="text-slate-500 mt-4">
          Modifiez les informations de votre projet ci-dessous.
        </p>
      </div>

      <form onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">

          {/* Titre */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Titre du projet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="titre"
              value={form.titre}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                errors.titre ? 'border-red-500 bg-red-50' : 'border-slate-300'
              }`}
            />
            {errors.titre && <p className="text-red-500 text-xs mt-1">{errors.titre}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                errors.description ? 'border-red-500 bg-red-50' : 'border-slate-300'
              }`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              URL de l'image
            </label>
            <input
              type="text"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://exemple.com/image.jpg ou /images/photo.jpg"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
            <p className="text-xs text-slate-400 mt-1">
              Mettez votre image dans public/images/ et écrivez /images/nom.jpg
            </p>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Aperçu"
                className="mt-3 w-full h-48 object-cover rounded-xl border border-slate-200"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/600x400/1e40af/white?text=Apercu';
                }}
              />
            )}
          </div>

          {/* Technologies */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Technologies (séparées par des virgules)
            </label>
            <input
              type="text"
              name="technologies"
              value={form.technologies}
              onChange={handleChange}
              placeholder="React, Tailwind CSS, Node.js..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
            {form.technologies && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.technologies.split(',').map((tech, idx) => {
                  const cleanTech = tech.trim();
                  if (!cleanTech) return null;
                  return (
                    <span key={idx}
                          className="bg-amber-50 text-amber-700 text-xs px-3 py-1 rounded-full font-medium border border-amber-200">
                      {cleanTech}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Boutons */}
        <div className="bg-slate-50 px-6 sm:px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <Link to={`/projet/${id}`}
                className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-xl text-center font-medium hover:bg-slate-100 transition">
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition disabled:opacity-60 shadow-md hover:shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Modification en cours...
              </span>
            ) : 'Enregistrer les modifications'}
          </button>
        </div>

      </form>
    </div>
  );
}

export default ModifierProjet;