import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-24">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Mairam Baidy Sow
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
          Étudiante Cloud/AWS passionnée par le développement full-stack et les solutions innovantes.
        </p>
        <div className="flex justify-center gap-4">
          <a href="#projets" 
             className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full font-medium transition-all hover:scale-105">
            Voir mes projets
          </a>
          <Link to="/contact" 
                className="border border-white hover:bg-white hover:text-slate-900 px-8 py-3 rounded-full font-medium transition-all">
            Me contacter
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;