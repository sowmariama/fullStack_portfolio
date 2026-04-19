import Hero from '../components/Hero';

function ListeProjets() {
  return (
    <>
      <Hero />
      <div id="projets" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-800 mb-8">Mes projets</h2>
      </div>
    </>
  );
}

export default ListeProjets;