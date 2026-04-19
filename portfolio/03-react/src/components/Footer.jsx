function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-8 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © 2026 Mairam Baidy Sow - Groupe 1 AWS re/Start
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-blue-400 transition">GitHub</a>
            <a href="#" className="text-slate-400 hover:text-blue-400 transition">LinkedIn</a>
            <a href="#" className="text-slate-400 hover:text-blue-400 transition">Twitter</a>
          </div>
        </div>
        <p className="text-slate-500 text-xs text-center mt-4">
          Portfolio full-stack — React • Express • MongoDB
        </p>
      </div>
    </footer>
  );
}

export default Footer;