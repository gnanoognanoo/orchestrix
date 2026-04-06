import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionDetails } from '../services/api';
import { TrendChart, KeywordChart } from '../components/Charts';
import { ArrowLeft, FileText, Users, Calendar, ExternalLink, BookOpen, Star, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await getSessionDetails(id);
        setDetail(data);
      } catch (err) {
        setError('Failed to load session details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 text-secondary">
      <Loader2 className="w-12 h-12 animate-spin mb-4" />
      <p className="animate-pulse">Loading session data...</p>
    </div>
  );

  if (error) return (
    <div className="container mx-auto p-8 text-center text-red-400">{error}</div>
  );

  const papers = detail?.papers || [];
  const analysis = detail?.analysis;
  const chartData = analysis?.chart_data || {};
  const trendData = chartData.trend || [];
  const keywordData = chartData.keywords || [];

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <button
        onClick={() => navigate('/history')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to History
      </button>

      <div className="mb-10">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary inline-block mb-2">
          Session Details
        </h2>
        <p className="text-gray-400">{papers.length} papers discovered in this session</p>
      </div>

      {/* Analysis Charts */}
      {(trendData.length > 0 || keywordData.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {trendData.length > 0 && <TrendChart data={trendData} />}
          {keywordData.length > 0 && <KeywordChart data={keywordData} />}
        </div>
      )}

      {/* Papers List */}
      {papers.length === 0 ? (
        <div className="glass-panel p-16 text-center">
          <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400">No papers stored for this session.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {papers.map((paper, i) => (
            <motion.div
              key={paper.id || i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel p-6 border border-white/10 hover:border-primary/40 transition-all"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2 leading-snug">
                    {paper.title || 'Untitled Paper'}
                  </h3>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                    {paper.authors && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-primary" />
                        {paper.authors}
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
                        {paper.citation_count} citations
                      </span>
                    )}
                  </div>

                  {paper.abstract && (
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                      {paper.abstract}
                    </p>
                  )}

                  {paper.notes && (
                    <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary-light">
                      <FileText className="w-3 h-3 inline mr-1" /> {paper.notes}
                    </div>
                  )}
                </div>

                {paper.source_url && (
                  <a
                    href={paper.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:text-white transition-colors p-2 border border-secondary/30 hover:border-secondary rounded-lg"
                    title="Open paper"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionDetail;
