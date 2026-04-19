// Contact.jsx – Version design premium sans émojis
import { useState } from 'react';
import { Link } from 'react-router-dom';

function Contact() {
  const [form, setForm] = useState({ nom: '', email: '', message: '' });
  const [envoye, setEnvoye] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nom || !form.email || !form.message) {
      alert("Tous les champs sont obligatoires !");
      return;
    }
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
        // Message de succès sans émoji
        <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            Message envoyé !
          </h2>
          <p className="text-green-600 mb-6">
            Merci pour votre message. Je vous répondrai dans les plus brefs délais.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition shadow-md"
          >
            Retour aux projets
          </Link>
        </div>
      ) : (
        <form className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
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
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
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
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
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
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>

            {/* Coordonnées directes – sans émojis */}
            <div className="bg-slate-50 rounded-xl p-5 space-y-3">
              <p className="text-sm font-semibold text-slate-700">
                Me trouver ailleurs :
              </p>
              <div className="space-y-2">
                <a
                  href="https://github.com/sowmariama/fullStack_portfolio"
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
          </div>

          {/* Boutons */}
          <div className="bg-slate-50 px-6 sm:px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-xl text-center font-medium hover:bg-slate-100 hover:border-slate-400 transition shadow-sm"
            >
              Annuler
            </Link>
            <button
              type="submit"
              onClick={handleSubmit}
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