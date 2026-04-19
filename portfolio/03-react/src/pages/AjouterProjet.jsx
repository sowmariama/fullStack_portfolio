import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ajouterProjet } from '../services/projetService';

function AjouterProjet() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    titre: '',
    description: '',
    image: '',
    technologies: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  // Gestion upload image depuis la machine
  // FileReader convertit l'image en base64 pour la stocker dans json-server
  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
      setForm({ ...form, image: event.target.result });
    };
    reader.readAsDataURL(file);
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
      const nouveauProjet = {
        id: String(Date.now()),
        titre: form.titre.trim(),
        description: form.description.trim(),
        image: form.image.trim() || 'https://placehold.co/600x400/1e40af/white?text=Projet',
        technologies: form.technologies
          ? form.technologies.split(',').map(t => t.trim()).filter(t => t)
          : []
      };

      await ajouterProjet(nouveauProjet);
      navigate('/');
    } catch (error) {
      console.error("Erreur ajout projet :", error);
      alert("Vérifiez que json-server tourne sur le port 3000 !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      {/* Fil d'Ariane */}
      <nav className="text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Accueil</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800 font-medium">Ajouter un projet</span>
      </nav>

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
          Ajouter un projet
        </h1>
        <div className="w-20 h-1 bg-blue-600 rounded-full mt-2"></div>
        <p className="text-slate-500 mt-4">
          Complétez les informations ci-dessous pour ajouter une nouvelle réalisation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
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
              placeholder="Ex: CI/CD avec GitHub Actions"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
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
              placeholder="Décrivez le projet, ses fonctionnalités..."
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.description ? 'border-red-500 bg-red-50' : 'border-slate-300'
              }`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Image — deux options */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Image du projet
            </label>

            {/* Option 1 : Upload depuis la machine */}
            <div className="mb-3">
              <label className="block text-xs text-slate-500 mb-1">
                Option 1 — Choisir une image depuis votre ordinateur
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              />
            </div>

            {/* Option 2 : URL */}
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Option 2 — Ou entrez une URL d'image
              </label>
              <input
                type="text"
                name="image"
                value={typeof form.image === 'string' && !form.image.startsWith('data:') ? form.image : ''}
                onChange={handleChange}
                placeholder="https://exemple.com/image.jpg"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Aperçu image */}
            {(imagePreview || form.image) && (
              <div className="mt-3">
                <img
                  src={imagePreview || form.image}
                  alt="Aperçu"
                  className="w-full h-48 object-cover rounded-xl border border-slate-200 shadow-sm"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/600x400/1e40af/white?text=Image+invalide';
                  }}
                />
              </div>
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
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {/* Aperçu badges technologies */}
            {form.technologies && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.technologies.split(',').map((tech, idx) => {
                  const cleanTech = tech.trim();
                  if (!cleanTech) return null;
                  return (
                    <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">
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
          <Link
            to="/"
            className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-xl text-center font-medium hover:bg-slate-100 transition"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Ajout en cours...
              </span>
            ) : 'Ajouter le projet'}
          </button>
        </div>

      </form>
    </div>
  );
}

export default AjouterProjet;