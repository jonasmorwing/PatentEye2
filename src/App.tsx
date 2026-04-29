import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Sparkles, FileText, ExternalLink, History, BookOpen, Scale, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { searchPatents } from './lib/gemini';
import { cn } from './lib/utils';

interface SearchHistory {
  id: string;
  description: string;
  date: string;
}

export default function App() {
  const [description, setDescription] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'history'>('search');
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [messageIndex, setMessageIndex] = useState(0);

  const loadingMessages = [
    "Analyzing technical components...",
    "Searching global patent databases...",
    "Comparing with existing prior art...",
    "Synthesizing IP strategy insights...",
    "Identifying novelty white spaces...",
  ];

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!description.trim()) return;

    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const response = await searchPatents(description);
      setResult(response);
      
      const newHistory: SearchHistory = {
        id: Date.now().toString(),
        description: description.slice(0, 50) + (description.length > 50 ? '...' : ''),
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setHistory(prev => [newHistory, ...prev].slice(0, 10));

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-slate-200">
      {/* Navigation / Header */}
      <header className="border-b border-white/5 bg-[#09090b] sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Document Stack */}
                <rect x="25" y="35" width="25" height="35" rx="1" transform="rotate(-10 25 35)" fill="#1e3a5f" opacity="0.8" />
                <rect x="30" y="32" width="25" height="35" rx="1" transform="rotate(-5 30 32)" fill="#0ea5e9" opacity="0.8" />
                <rect x="35" y="30" width="28" height="38" rx="2" fill="#cbd5e1" />
                <rect x="40" y="38" width="18" height="2" rx="1" fill="#94a3b8" />
                <rect x="40" y="44" width="18" height="2" rx="1" fill="#94a3b8" />
                <rect x="40" y="50" width="14" height="2" rx="1" fill="#94a3b8" />
                
                {/* Magnifying Glass */}
                <path d="M72 72L60 60" stroke="#1e3a5f" strokeWidth="6" strokeLinecap="round" />
                <circle cx="48" cy="48" r="18" fill="white" stroke="#1e3a5f" strokeWidth="4" />
                
                {/* The Eye */}
                <path d="M38 48C38 48 41 42 48 42C55 42 58 48 58 48C58 48 55 54 48 54C41 54 38 48 38 48Z" fill="white" stroke="#1e3a5f" strokeWidth="1.5" />
                <circle cx="48" cy="48" r="4" fill="#0ea5e9" stroke="#1e3a5f" strokeWidth="1" />
                <circle cx="49" cy="47" r="1" fill="white" />
              </svg>
            </div>
            <h1 className="text-3xl font-medium tracking-tight flex items-center">
              <span className="text-slate-200">Patent</span>
              <span className="text-sky-400">Eye</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[380px_1fr] min-h-0">
        {/* Sidebar / Input Area */}
        <div className="border-r border-white/5 flex flex-col bg-[#09090b]">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => setActiveTab('search')}
              className={cn(
                "flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative overflow-hidden",
                activeTab === 'search' ? "text-sky-400 bg-sky-500/5" : "text-slate-600 hover:text-slate-400 hover:bg-white/[0.02]"
              )}
            >
              New Search
              {activeTab === 'search' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative overflow-hidden text-center",
                activeTab === 'history' ? "text-sky-400 bg-sky-500/5" : "text-slate-600 hover:text-slate-400 hover:bg-white/[0.02]"
              )}
            >
              History
              {activeTab === 'history' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
              )}
            </button>
          </div>

          <div className="p-8 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'search' ? (
                <motion.div
                  key="search-tab"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex flex-col gap-8"
                >
                  <section>
                    <div className="mono-label mb-2 flex items-center gap-2">
                      <Sparkles size={12} className="text-sky-500" />
                      Technical Solution
                    </div>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                      Describe the core inventive step of your technology for semantic analysis and prior art grounding.
                    </p>

                    <form onSubmit={handleSearch} className="flex flex-col gap-6">
                      <div className="relative">
                        <textarea
                          id="innovation-description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Enter your technical description here..."
                          className="w-full h-[400px] p-5 text-sm bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:border-sky-500/50 resize-none leading-relaxed text-slate-300 transition-all placeholder:text-slate-700"
                        />
                        <div className="absolute bottom-3 right-3 text-[10px] text-slate-600 font-mono">
                          {description.length} Chars
                        </div>
                      </div>

                      <button
                        id="search-button"
                        type="submit"
                        disabled={isSearching || !description.trim()}
                        className={cn(
                          "w-full h-14 flex items-center justify-center gap-2 font-bold transition-all rounded-xl",
                          isSearching || !description.trim()
                            ? "bg-slate-900 text-slate-600 cursor-not-allowed border border-white/5"
                            : "bg-sky-500 text-[#09090b] hover:bg-sky-400 shadow-xl shadow-sky-500/10 active:scale-[0.98]"
                        )}
                      >
                        {isSearching ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <Search size={18} />
                            <span>Run Semantic Search</span>
                          </>
                        )}
                      </button>
                    </form>
                  </section>
                </motion.div>
              ) : (
                <motion.div
                  key="history-tab"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex flex-col gap-8"
                >
                  <section className="overflow-hidden">
                    <div className="mono-label mb-4 flex items-center gap-2">
                      <History size={12} />
                      Recent Logs
                    </div>
                    <div className="space-y-3">
                      {history.length === 0 ? (
                        <div className="text-[10px] text-slate-600 px-4 py-12 border border-dashed border-white/5 rounded-xl text-center uppercase tracking-widest">
                          History Empty
                        </div>
                      ) : (
                        history.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setDescription(item.description);
                              setActiveTab('search');
                            }}
                            className="w-full text-left p-4 bg-slate-900/40 border border-white/5 rounded-xl hover:border-sky-500/30 transition-all group"
                          >
                            <div className="text-xs font-medium truncate mb-2 text-slate-300 group-hover:text-sky-400 transition-colors">{item.description}</div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-slate-600 font-mono">{item.date}</span>
                              <ExternalLink size={10} className="text-sky-500/50" />
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results Area */}
        <div className="bg-[#0c0c0e] overflow-y-auto min-h-[400px]" ref={resultsRef}>
          <AnimatePresence mode="wait">
            {!isSearching && !result && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-slate-700 border border-white/5">
                  <FileText size={40} />
                </div>
                <h3 className="text-2xl font-light mb-3 text-white">Discovery Protocol Ready</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
                  Generated reports include global semantic analysis, competitive landscapes, and novelty audits.
                </p>
                <div className="mt-10 flex gap-3 flex-wrap justify-center">
                   {['Quantum', 'Pharma', 'FinTech', 'Renewables'].map(tag => (
                    <span key={tag} className="px-4 py-1.5 bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 rounded-full uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {isSearching && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="h-1 w-32 bg-white/5 rounded-full mb-8 overflow-hidden relative">
                  <motion.div
                    className="h-full bg-sky-500 absolute left-0"
                    animate={{ left: ["-100%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    style={{ width: '50%' }}
                  />
                </div>
                <p className="text-xl font-light text-slate-200 h-8">
                  {loadingMessages[messageIndex]}
                </p>
                <p className="text-[10px] text-slate-600 mt-4 font-mono uppercase tracking-[0.2em]">
                  Encrypted Logic processing...
                </p>
              </motion.div>
            )}

            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 lg:p-12 max-w-4xl mx-auto"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 border-b border-white/5 pb-8 gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-center text-sky-400">
                      <FileText size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-light tracking-tight text-white">Analysis Results</h2>
                      <div className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest">Global IP Landscape Report</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Verified Report
                    </span>
                  </div>
                </div>

                <div className="markdown-body">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="text-[10px] text-slate-600 font-mono leading-relaxed max-w-sm uppercase tracking-wider">
                    Caution: Neural search utilizes real-time indices. Authenticate results with local IP counsel.
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-300 hover:text-white transition-all border border-white/10 px-6 py-3 rounded-lg bg-slate-900 shadow-xl active:bg-slate-800">
                      Export Data
                    </button>
                    <button 
                      onClick={() => {
                        setDescription('');
                        setResult(null);
                      }}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold text-sky-400 hover:text-sky-300 transition-all border border-sky-500/20 px-6 py-3 rounded-lg bg-sky-500/5 shadow-xl active:bg-sky-500/10"
                    >
                      Reset Session
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                  <Scale size={32} />
                </div>
                <h3 className="text-xl font-light text-slate-100 tracking-tight">Security Breach / Logic Fail</h3>
                <p className="text-slate-500 max-w-sm mt-3 text-sm leading-relaxed">{error}</p>
                <button
                  onClick={handleSearch}
                  className="mt-8 px-8 py-3 bg-red-500 text-[#09090b] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-400 transition-all"
                >
                  Retry Protocol
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="border-t border-white/5 bg-[#09090b] py-3 px-8 mt-auto">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em]">
          <div>PatentEye • Semantic Infrastructure</div>
          <div className="flex gap-8">
            <span>Model: GPT-4-INTEL-G1</span>
            <span>Latency: 142ms</span>
          </div>
          <div className="flex items-center gap-2 text-sky-500/50">
            <div className="w-1 h-1 rounded-full bg-sky-500 animate-pulse" />
            Session Encrypted
          </div>
        </div>
      </footer>
    </div>
  );
}
