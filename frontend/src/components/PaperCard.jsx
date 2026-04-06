import React, { useState } from 'react';
import { ExternalLink, Quote, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const PaperCard = ({ paper, onSelect, selected }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`glass-panel p-5 transition-all w-full text-left ${selected ? 'border-primary shadow-[0_0_20px_rgba(107,70,193,0.3)]' : 'hover:border-white/20'}`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-lg font-semibold text-white pr-4">{paper.title}</h4>
        <div className="flex items-center gap-2">
          {paper.source_url && (
            <a href={paper.source_url} target="_blank" rel="noreferrer" className="text-secondary hover:text-white transition-colors" title="View Source">
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
          <input 
            type="checkbox" 
            checked={selected}
            onChange={(e) => onSelect(paper, e.target.checked)}
            className="w-5 h-5 accent-primary cursor-pointer border-white/20 bg-panel rounded"
            title="Select for Synthesis/Citation"
          />
        </div>
      </div>
      
      <div className="text-sm text-gray-400 mb-3 flex flex-wrap gap-4 items-center">
        <span>{paper.authors}</span>
        <span className="bg-white/10 px-2 py-0.5 rounded text-white">{paper.year}</span>
        <span className="flex items-center gap-1 text-primary"><Quote className="w-4 h-4"/> {paper.citation_count} Citations</span>
      </div>
      
      <div className="relative">
        <p className={`text-sm text-gray-300 ${expanded ? 'line-clamp-none' : 'line-clamp-3'}`}>
          {paper.abstract}
        </p>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-secondary text-xs flex items-center gap-1 mt-2 hover:underline"
        >
          {expanded ? <><ChevronUp className="w-3 h-3"/> Show Less</> : <><ChevronDown className="w-3 h-3"/> Read Full Abstract</>}
        </button>
      </div>
    </div>
  );
};

export default PaperCard;
