import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, CircleDashed, Loader2, PlayCircle, Layers, AlertTriangle, Database } from 'lucide-react';

const AgentStatusTimeline = ({ trace = [] }) => {
  const getIcon = (status) => {
    const s = status.toLowerCase();
    if (s.includes('completed') || s.includes('analyzed')) return <CheckCircle2 className="w-5 h-5 text-success" />;
    if (s.includes('running') || s.includes('generating')) return <Loader2 className="w-5 h-5 text-secondary animate-spin" />;
    if (s.includes('chunk')) return <Layers className="w-5 h-5 text-amber-400" />;
    if (s.includes('failed')) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (s.includes('cache')) return <Database className="w-5 h-5 text-blue-400" />;
    return <CircleDashed className="w-5 h-5 text-gray-500" />;
  };

  const getBorderColor = (status) => {
    const s = status.toLowerCase();
    if (s.includes('completed') || s.includes('analyzed')) return 'border-success shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    if (s.includes('running') || s.includes('generating')) return 'border-secondary shadow-[0_0_15px_rgba(0,229,255,0.4)]';
    if (s.includes('chunk')) return 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]';
    if (s.includes('failed')) return 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]';
    if (s.includes('cache')) return 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.4)]';
    return 'border-gray-600';
  };

  return (
    <div className="glass-panel p-6 mb-8 w-full border border-white/10">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <PlayCircle className="text-primary w-6 h-6" /> 
        Orchestration Trace
      </h3>
      
      <div className="flex flex-wrap gap-4">
        <AnimatePresence mode="popLayout">
          {trace.map((step, idx) => (
            <motion.div 
              key={`${step.agent}-${idx}`}
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2 ${getBorderColor(step.status).split(' ')[0]}`}
            >
              <div className="flex items-center justify-center">
                {getIcon(step.status)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white whitespace-nowrap">{step.agent}</span>
                <span className="text-[10px] text-gray-400 leading-none">{step.status}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {trace.length === 0 && (
          <div className="text-gray-500 text-sm italic">Waiting for agents to begin...</div>
        )}
      </div>
    </div>
  );
};

export default AgentStatusTimeline;
