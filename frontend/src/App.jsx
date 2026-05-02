import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import UploadPage from './pages/UploadPage';
import ResultPage from './pages/ResultPage';

// Wrapper for page transitions
const PageWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex-1 flex flex-col items-center justify-center"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-textPrimary flex flex-col font-sans relative overflow-hidden">
        {/* Film grain overlay for cinematic feel */}
        <div className="grain-overlay"></div>
        
        {/* Subtle background glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-white/[0.02] blur-[100px] rounded-full pointer-events-none"></div>

        {/* Minimalist Navbar */}
        <nav className="w-full border-b border-white/[0.08] bg-background/50 backdrop-blur-3xl p-6 sticky top-0 z-50 transition-all duration-300">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-2 h-2 rounded-full bg-white group-hover:scale-150 transition-transform duration-500"></div>
              <h1 className="text-sm tracking-[0.2em] uppercase font-light text-textSecondary group-hover:text-white transition-colors duration-500">
                Aether<span className="font-semibold text-white">Diagnostics</span>
              </h1>
            </Link>
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-mono">
              v2.0 Neural Engine
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-6xl mx-auto relative z-10">
          <PageWrapper>
            <Routes>
              <Route path="/" element={<UploadPage />} />
              <Route path="/result/:scanId" element={<ResultPage />} />
            </Routes>
          </PageWrapper>
        </main>
        
        {/* Footer */}
        <footer className="py-8 text-center text-zinc-600 text-xs tracking-widest uppercase font-mono border-t border-white/[0.05] mt-auto relative z-10">
          &copy; {new Date().getFullYear()} Aether Diagnostics. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}

export default App;
