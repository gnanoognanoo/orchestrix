import React, { useState } from 'react';
import { Search, Download, FileText, Save, BrainCircuit, AlertCircle } from 'lucide-react';
import AgentStatusTimeline from '../components/AgentStatusTimeline';
import PaperCard from '../components/PaperCard';
import { TrendChart, KeywordChart } from '../components/Charts';
import { searchPapers, synthesizePapers, citePapers } from '../services/api';

const Home = () => {
  const [query, setQuery] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const [results, setResults] = useState(null); // { papers: [], analysis: {}, trace: [], session_id: '...' }
  const [selectedPapers, setSelectedPapers] = useState([]);
  
  const [synthesisState, setSynthesisState] = useState({ loading: false, data: null });
  const [citationState, setCitationState] = useState({ loading: false, data: null, format: 'txt', style: 'APA' });
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setError(null);
    setResults(null);
    setSelectedPapers([]);
    setSynthesisState({ loading: false, data: null });
    setCitationState({ loading: false, data: null, ...citationState });

    try {
      const data = await searchPapers(query, sessionName || undefined);
      setResults(data);
    } catch (err) {
      setError(err.message || 'An error occurred during search.');
    } finally {
      setIsSearching(false);
    }
  };

  const togglePaperSelection = (paper, isSelected) => {
    if (isSelected) {
      setSelectedPapers(prev => [...prev, paper]);
    } else {
      setSelectedPapers(prev => prev.filter(p => p.id !== paper.id));
    }
  };

  const handleSynthesize = async () => {
    if (selectedPapers.length === 0) return;
    setSynthesisState({ ...synthesisState, loading: true, data: null });
    
    // Update local trace to show synthesis running
    if (results && results.trace) {
      const newTrace = [...results.trace, { agent: 'Synthesis', status: 'running' }];
      setResults({ ...results, trace: newTrace });
    }

    try {
      const response = await synthesizePapers(selectedPapers);
      setSynthesisState({ loading: false, data: response.synthesis });
      
      // Update local trace to show synthesis completed
      if (results && results.trace) {
        setResults({ ...results, trace: [...results.trace.filter(t => t.agent !== 'Synthesis'), { agent: 'Synthesis', status: 'completed' }]});
      }
    } catch (err) {
      setSynthesisState({ loading: false, data: { error: err.message } });
    }
  };

  const handleCite = async () => {
    if (selectedPapers.length === 0) return;
    setCitationState({ ...citationState, loading: true });
    
     // Update local trace
     if (results && results.trace) {
      setResults({ ...results, trace: [...results.trace.filter(t => t.agent !== 'Citation'), { agent: 'Citation', status: 'running' }] });
    }

    try {
      const response = await citePapers(selectedPapers, citationState.format, citationState.style);
      setCitationState({ ...citationState, loading: false, data: response.citations });
      
      if (results && results.trace) {
        setResults({ ...results, trace: [...results.trace.filter(t => t.agent !== 'Citation'), { agent: 'Citation', status: 'completed' }]});
      }
    } catch (err) {
      setCitationState({ ...citationState, loading: false, data: err.message });
    }
  };

  const downloadCitations = () => {
    if (!citationState.data) return;
    const blob = new Blob([citationState.data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citations.${citationState.format === 'bib' ? 'bib' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Search Header section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 tracking-tight"><span className="gradient-text">Orchestrix</span> Intelligence</h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">Multi-agent architecture for automated academic discovery, analysis, and synthesis.</p>
        
        <form onSubmit={handleSearch} className="mt-8 max-w-3xl mx-auto relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative glass-panel rounded-full flex items-center p-2 pl-6">
            <Search className="w-6 h-6 text-gray-400" />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter research topic (e.g., Quantum Machine Learning)"
              className="flex-1 bg-transparent border-none outline-none text-white px-4 text-lg placeholder-gray-500"
            />
            <input 
              type="text" 
              placeholder="Session Name (opt)" 
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="w-40 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none hidden md:block mr-2"
            />
            <button 
              type="submit" 
              disabled={isSearching}
              className="bg-primary hover:bg-primary/80 transition-colors text-white rounded-full px-6 py-3 font-medium flex items-center gap-2"
            >
              {isSearching ? <span className="animate-pulse">Orchestrating...</span> : 'Research'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center justify-center gap-3 mb-8">
          <AlertCircle /> {error}
        </div>
      )}

      {/* Results View */}
      {results && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <AgentStatusTimeline trace={results.trace} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Papers List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-2xl font-semibold">Discovered Papers <span className="text-lg text-primary bg-primary/10 px-2 py-1 rounded-md">{results.papers?.length || 0}</span></h3>
              </div>
              
              <div className="space-y-4 h-[800px] overflow-y-auto pr-2 pb-10">
                {results.papers && results.papers.map((paper, idx) => (
                  <PaperCard 
                    key={paper.id || idx} 
                    paper={paper} 
                    selected={selectedPapers.some(p => p.id === paper.id)}
                    onSelect={togglePaperSelection}
                  />
                ))}
                {results.papers?.length === 0 && (
                  <div className="text-center p-10 glass-panel">
                    <p className="text-gray-400">No papers found for this query.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Analysis, Synthesis, Citation */}
            <div className="space-y-8">
              
              {/* Analysis Charts */}
              {results.analysis && Object.keys(results.analysis).length > 0 && (
                <div className="space-y-4">
                  <TrendChart data={results.analysis.publication_trend} />
                  <KeywordChart data={results.analysis.keyword_frequency} />
                </div>
              )}

              {/* Synthesis Panel */}
              <div className="glass-panel p-5">
                <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                  <BrainCircuit className="text-secondary" />
                  Synthesis Agent
                </h3>
                <p className="text-sm text-gray-400 mb-4">Select papers from the list to synthesize their findings, contradictions, and gaps.</p>
                
                <button 
                  onClick={handleSynthesize}
                  disabled={selectedPapers.length === 0 || synthesisState.loading}
                  className="w-full bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 rounded-lg py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {synthesisState.loading ? 'Synthesizing...' : `Synthesize Selected (${selectedPapers.length})`}
                </button>

                {synthesisState.data && typeof synthesisState.data === 'string' && (
                  <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg max-h-[500px] overflow-y-auto">
                    <div className="prose prose-invert prose-sm">
                      <div className="whitespace-pre-wrap text-gray-300 font-sans leading-relaxed">
                        {synthesisState.data}
                      </div>
                    </div>
                  </div>
                )}

                {synthesisState.data && typeof synthesisState.data === 'object' && !synthesisState.data.error && (
                  <div className="mt-4 space-y-3 text-sm">
                    {synthesisState.data.common_themes && (
                      <div className="bg-white/5 p-3 rounded border border-white/10">
                        <strong className="text-white block mb-1">Common Themes</strong>
                        <p className="text-gray-300">{synthesisState.data.common_themes}</p>
                      </div>
                    )}
                    {synthesisState.data.contradictions && (
                      <div className="bg-white/5 p-3 rounded border border-white/10">
                        <strong className="text-white block mb-1">Contradictions</strong>
                        <p className="text-gray-300">{synthesisState.data.contradictions}</p>
                      </div>
                    )}
                    {synthesisState.data.research_gaps && (
                      <div className="bg-white/5 p-3 rounded border border-white/10">
                        <strong className="text-white block mb-1">Research Gaps</strong>
                        <p className="text-gray-300">{synthesisState.data.research_gaps}</p>
                      </div>
                    )}
                  </div>
                )}
                {synthesisState.data?.error && (
                  <div className="mt-4 text-red-400 text-sm p-3 bg-red-400/5 border border-red-400/20 rounded-md">
                    {synthesisState.data.error}
                  </div>
                )}
              </div>

              {/* Citation Panel */}
              <div className="glass-panel p-5">
                <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                  <FileText className="text-amber-400" />
                  Citation Agent
                </h3>
                
                <div className="flex gap-2 mb-4">
                  <select 
                    className="bg-panel border border-white/10 rounded px-2 py-1 text-sm outline-none w-1/2"
                    value={citationState.style}
                    onChange={(e) => setCitationState({...citationState, style: e.target.value})}
                  >
                    <option value="APA">APA Style</option>
                    <option value="IEEE">IEEE Style</option>
                    <option value="MLA">MLA Style</option>
                  </select>
                  <select 
                    className="bg-panel border border-white/10 rounded px-2 py-1 text-sm outline-none w-1/2"
                    value={citationState.format}
                    onChange={(e) => setCitationState({...citationState, format: e.target.value})}
                  >
                    <option value="txt">Text (.txt)</option>
                    <option value="bib">BibTeX (.bib)</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleCite}
                    disabled={selectedPapers.length === 0 || citationState.loading}
                    className="flex-1 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-lg py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {citationState.loading ? 'Generating...' : 'Generate Citations'}
                  </button>
                  <button 
                    onClick={downloadCitations}
                    disabled={!citationState.data}
                    className="glass-button px-3 disabled:opacity-50"
                    title="Download Citations"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                
                {citationState.data && typeof citationState.data === 'string' && (
                  <div className="mt-4 bg-black/40 border border-white/5 rounded p-3 text-xs text-gray-400 h-32 overflow-y-auto whitespace-pre-wrap font-mono">
                    {citationState.data}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
