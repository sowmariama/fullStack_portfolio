// Hero.jsx – Version vivante avec photo + animation
import { Link } from 'react-router-dom';
import maPhoto from '../assets/moi.jpg'; // ← adapte le chemin et le nom

function Hero() {
  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row items-center gap-12">
          
          {/* Photo – cercle avec effet lumineux */}
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-amber-500 shadow-xl shadow-amber-500/20 animate-pulse-slow">
            <img 
              src={maPhoto} 
              alt="Mairam Baidy Sow"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Texte */}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Mairam Baidy Sow
            </h1>
            <p className="text-xl md:text-2xl text-amber-400 font-medium mb-4">
              Développeur Full-Stack & Cloud
            </p>
            <p className="text-slate-300 max-w-2xl mx-auto md:mx-0 mb-8">
              Je crée des applications web modernes et des solutions cloud innovantes. 
              Passionné par React, Node.js, AWS et le design élégant.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <a 
                href="#projets" 
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-3 rounded-full font-semibold transition transform hover:scale-105"
              >
                Voir mes projets
              </a>
              <Link 
                to="/contact" 
                className="border border-white hover:bg-white hover:text-slate-900 px-6 py-3 rounded-full font-semibold transition"
              >
                Me contacter
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;