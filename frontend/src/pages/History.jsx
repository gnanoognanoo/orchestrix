import React, { useEffect, useState } from 'react';
import { getSessions, deleteSession } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Trash2, Database, ExternalLink, Calendar, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const History = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (error) {
      console.error("Failed to fetch sessions: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this session?")) return;
    try {
      await deleteSession(id);
      setSessions(sessions.filter(s => s.id !== id));
    } catch (error) {
      console.error("Failed to delete session: ", error);
      alert("Error deleting session.");
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary inline-block mb-4">
          Session History
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          View your past research sessions, review stored analysis, or delete unwanted workflows to keep your space clean.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-secondary">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="animate-pulse">Loading saved sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="glass-panel p-16 text-center shadow-lg shadow-primary/5 border border-white/5">
          <Database className="w-16 h-16 text-gray-500 mx-auto mb-6 opacity-50" />
          <h3 className="text-2xl text-white mb-2 font-medium">No Sessions Found</h3>
          <p className="text-gray-400">Run a search from the Dashboard and provide a Session Name to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {sessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel p-6 border border-white/10 hover:border-primary/50 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white leading-tight break-words">
                      {session.session_name}
                    </h3>
                    <button 
                      onClick={() => handleDelete(session.id)}
                      className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-colors border border-transparent hover:border-red-400/30"
                      title="Clear History"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-secondary mb-2">
                    <Search className="w-3 h-3" /> 
                    <span className="truncate">{session.query}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(session.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
                  <button onClick={() => navigate(`/history/${session.id}`)} className="text-xs tracking-wider uppercase font-semibold text-primary hover:text-white transition-colors flex items-center gap-1 group-hover:underline">
                    View Details <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default History;
