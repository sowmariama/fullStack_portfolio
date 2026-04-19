// App.jsx — Le composant principal
// React Router gère la navigation entre les pages
// BrowserRouter : active le système de navigation
// Routes : conteneur de toutes nos routes
// Route : associe une URL à un composant

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ListeProjets from './pages/ListeProjets';
import DetailProjet from './pages/DetailProjet';
import AjouterProjet from './pages/AjouterProjet';
import ModifierProjet from './pages/ModifierProjet';
import Contact from './pages/Contact';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        {/* pt-20 compense la navbar fixed pour que le contenu ne se cache pas dessous */}
        <main className="flex-1 pt-20">
          <Routes>
            <Route path="/" element={<ListeProjets />} />
            <Route path="/projet/:id" element={<DetailProjet />} />
            <Route path="/ajouter" element={<AjouterProjet />} />
            <Route path="/modifier/:id" element={<ModifierProjet />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;