// Footer.jsx – Version finale avec accent amber
function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-8 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © 2026 Mairam Baidy Sow - Groupe 1 AWS re/Start
          </p>
          <div className="flex gap-6">
            <a 
              href="https://github.com/sowmariama/fullStack_portfolio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-amber-500 transition-colors duration-300"
            >
              GitHub
            </a>
            <a 
              href="https://www.linkedin.com/in/mairam-baidy-sow-94918025a" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-amber-500 transition-colors duration-300"
            >
              LinkedIn
            </a>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800/50 text-center">
          <p className="text-slate-500 text-xs">
            Portfolio full-stack — React • Tailwind • Express • MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;