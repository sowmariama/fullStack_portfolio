// Contact.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

function Contact() {
  const [form, setForm] = useState({ nom: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [envoye, setEnvoye] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!form.email.trim()) newErrors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Email invalide';
    if (!form.message.trim()) newErrors.message = 'Le message est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Ouvre le client mail avec les informations pré-remplies
    const subject = encodeURIComponent(`Message de ${form.nom} — Portfolio`);
    const body = encodeURIComponent(
      `Nom : ${form.nom}\nEmail : ${form.email}\n\nMessage :\n${form.message}`
    );
    window.location.href = `mailto:mairosow91@gmail.com?subject=${subject}&body=${body}`;
    setEnvoye(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      {/* Fil d'Ariane */}
      <nav className="text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-amber-600 transition">Accueil</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800 font-medium">Contact</span>
      </nav>

      {/* En-tête */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
          Me contacter
        </h1>
        <div className="w-20 h-1 bg-amber-500 rounded-full mt-2"></div>
        <p className="text-slate-500 mt-4 text-lg">
          Une question, une opportunité ou un projet ? Écrivez-moi.
        </p>
      </div>

      {envoye ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-green-700 mb-3">
            Message préparé
          </h2>
          <p className="text-green-600 mb-6">
            Votre client mail s'est ouvert avec le message pré-rempli.
            Si rien ne s'est ouvert, écrivez directement à{' '}
            <a
              href="mailto:mairosow91@gmail.com"
              className="underline hover:text-green-800"
            >
              mairosow91@gmail.com
            </a>
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition shadow-md"
          >
            Retour aux projets
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">

            {/* Nom */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                placeholder="Votre nom"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                  errors.nom ? 'border-red-400 bg-red-50' : 'border-slate-300'
                }`}
              />
              {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="votre.email@exemple.com"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-slate-300'
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="5"
                placeholder="Bonjour, je souhaite vous contacter pour..."
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                  errors.message ? 'border-red-400 bg-red-50' : 'border-slate-300'
                }`}
              />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
            </div>

            {/* Coordonnées directes */}
            <div className="bg-slate-50 rounded-xl p-5 space-y-2 border border-slate-100">
              <p className="text-sm font-semibold text-slate-700 mb-3">
                Me trouver directement :
              </p>
              <a
                href="mailto:mairosow91@gmail.com"
                className="block text-sm text-slate-600 hover:text-amber-600 transition"
              >
                Email — mairosow91@gmail.com
              </a>
              <a
                href="https://github.com/sowmariama"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-slate-600 hover:text-amber-600 transition"
              >
                GitHub — sowmariama
              </a>
              <a
                href="https://www.linkedin.com/in/mairam-baidy-sow-94918025a"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-slate-600 hover:text-amber-600 transition"
              >
                LinkedIn — Mairam Baidy Sow
              </a>
            </div>
          </div>

          {/* Boutons */}
          <div className="bg-slate-50 px-6 sm:px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-xl text-center font-medium hover:bg-slate-100 transition shadow-sm"
            >
              Annuler
            </Link>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition shadow-md hover:shadow-lg"
            >
              Envoyer le message
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Contact;
