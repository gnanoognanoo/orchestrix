import React, { useEffect, useState } from 'react';
import { getSessions, getSessionDetails } from '../services/api';
import { GitCompare, Loader2, CheckSquare, Square, BookOpen, Users, Calendar, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Compare = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [comparing, setComparing] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getSessions();
        setSessions(data);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  const toggleSelect = (session) => {
    if (selected.find(s => s.id === session.id)) {
      setSelected(selected.filter(s => s.id !== session.id));
    } else if (selected.length < 3) {
      setSelected([...selected, session]);
    }
  };

  const handleCompare = async () => {
    if (selected.length < 2) return;
    setComparing(true);
    setResults([]);
    try {
      const details = await Promise.all(selected.map(s => getSessionDetails(s.id)));
      setResults(details.map((d, i) => ({ ...selected[i], ...d })));
    } catch {
      alert('Failed to load comparison data.');
    }
    setComparing(false);
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary inline-block mb-4">
          Compare Sessions
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Select 2–3 sessions to compare papers, research depth, and cross-session insights side by side.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-secondary">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="animate-pulse">Loading sessions...</p>
        </div>
      ) : sessions.length < 2 ? (
        <div className="glass-panel p-16 text-center">
          <GitCompare className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400">You need at least 2 saved sessions to compare. Run more searches with session names!</p>
        </div>
      ) : (
        <>
          {/* Session Selection */}
          <div className="glass-panel p-6 mb-8 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Select Sessions to Compare 
                <span className="ml-2 text-sm text-gray-400 font-normal">({selected.length}/3 selected)</span>
              </h3>
              <button
                onClick={handleCompare}
                disabled={selected.length < 2 || comparing}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/30 transition-all"
              >
                {comparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
                {comparing ? 'Comparing...' : 'Compare'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sessions.map(session => {
                const isSelected = !!selected.find(s => s.id === session.id);
                const isDisabled = !isSelected && selected.length >= 3;
                return (
                  <button
                    key={session.id}
                    onClick={() => !isDisabled && toggleSelect(session)}
                    disabled={isDisabled}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/20 text-white shadow-lg shadow-primary/20'
                        : isDisabled
                        ? 'border-white/5 bg-white/2 text-gray-600 cursor-not-allowed'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-primary/50 hover:bg-primary/10'
                    }`}
                  >
                    {isSelected
                      ? <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" />
                      : <Square className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                    <div className="overflow-hidden">
                      <p className="font-semibold truncate text-sm">{session.session_name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.query}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comparison Grid */}
          <AnimatePresence>
            {results.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-6"
                style={{ gridTemplateColumns: `repeat(${results.length}, minmax(0, 1fr))` }}
              >
                {results.map((r, ci) => (
                  <div key={r.id} className="flex flex-col gap-4">
                    {/* Session Header */}
                    <div className={`glass-panel p-5 border-t-4 ${ci === 0 ? 'border-t-primary' : ci === 1 ? 'border-t-secondary' : 'border-t-amber-400'}`}>
                      <h3 className="text-xl font-bold text-white mb-1">{r.session_name}</h3>
                      <p className="text-sm text-gray-400 mb-3">Query: <span className="text-secondary">{r.query}</span></p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-white">{(r.papers || []).length}</p>
                          <p className="text-xs text-gray-400 mt-1">Papers</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-white">
                            {(r.papers || []).reduce((sum, p) => sum + (p.citation_count || 0), 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">Total Citations</p>
                        </div>
                      </div>
                    </div>

                    {/* Papers */}
                    <div className="flex flex-col gap-3">
                      {(r.papers || []).length === 0 ? (
                        <div className="glass-panel p-6 text-center text-gray-500 text-sm">
                          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          No papers stored
                        </div>
                      ) : (r.papers || []).map((paper, pi) => (
                        <div key={pi} className="glass-panel p-4 border border-white/10 hover:border-white/20 transition-all">
                          <p className="text-sm font-semibold text-white mb-2 line-clamp-2">{paper.title}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                            {paper.authors && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-primary" />
                                <span className="truncate max-w-[120px]">{paper.authors}</span>
                              </span>
                            )}
                            {paper.year && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-secondary" />
                                {paper.year}
                              </span>
                            )}
                            {paper.citation_count != null && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-400" />
                                {paper.citation_count}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default Compare;
