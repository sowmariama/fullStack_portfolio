// Hero.jsx
import { Link } from 'react-router-dom';
import maPhoto from '../assets/moi.jpg';

function Hero() {
  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex flex-col md:flex-row items-center gap-12">

          {/* Photo */}
          <div className="w-44 h-44 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-amber-500 shadow-xl shadow-amber-500/20 animate-pulse-slow flex-shrink-0">
            <img
              src={maPhoto}
              alt="Mairam Baidy Sow"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Texte */}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
              Mairam Baidy Sow
            </h1>
            <p className="text-lg md:text-xl text-amber-400 font-medium mb-5">
              Développeuse Full-Stack — Cloud AWS &amp; DevOps
            </p>
            <p className="text-slate-300 max-w-xl mx-auto md:mx-0 mb-8 leading-relaxed">
              Je conçois des applications web et des pipelines CI/CD sur AWS.
              Mon stack : <span className="text-amber-300">React, Node.js, Docker, Jenkins, Kubernetes</span>.
              Actuellement en formation <span className="text-amber-300">AWS re/Start</span> à Orange Digital Center Dakar.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <a
                href="#projets"
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105"
              >
                Voir mes projets
              </a>
              <Link
                to="/contact"
                className="border border-white/70 hover:border-white hover:bg-white hover:text-slate-900 px-6 py-3 rounded-full font-semibold transition-all duration-200"
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
