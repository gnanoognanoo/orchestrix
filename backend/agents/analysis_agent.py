import collections
from typing import List, Dict, Any

class AnalysisAgent:
    def analyze_papers(self, papers: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not papers:
            return {}

        return {
            "publication_trend": self._get_publication_trend(papers),
            "top_authors": self._get_top_authors(papers),
            "keyword_frequency": self._get_keyword_frequency(papers),
            "citation_distribution": self._get_citation_distribution(papers),
            "emerging_topics": self._get_emerging_topics(papers)
        }

    def _get_publication_trend(self, papers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        year_counts = collections.Counter()

        for paper in papers:
            year = paper.get("year")
            if year:
                year_counts[year] += 1

        trend = [
            {"year": year, "count": count}
            for year, count in sorted(year_counts.items())
        ]

        return trend

    def _get_top_authors(self, papers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        author_counts = collections.Counter()
        for p in papers:
            authors_str = p.get("authors", "")
            if authors_str and authors_str != "Unknown":
                authors_list = [a.strip() for a in authors_str.split(",")]
                for a in authors_list:
                    author_counts[a] += 1
        
        top = [{"author": k, "count": v} for k, v in author_counts.most_common(5)]
        return top

    def _get_keyword_frequency(self, papers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Extremely basic stop words
        stop_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "by", "of", "from", "is", "are", "was", "were", "this", "that", "it", "as", "be"}
        word_counts = collections.Counter()
        
        for p in papers:
            text = f"{p.get('title', '')} {p.get('abstract', '')}".lower()
            words = "".join(c if c.isalnum() else " " for c in text).split()
            filtered_words = [w for w in words if w not in stop_words and len(w) > 3]
            word_counts.update(filtered_words)
            
        freq = [{"keyword": k, "count": v} for k, v in word_counts.most_common(10)]
        return freq

    def _get_citation_distribution(self, papers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Bucket citations
        buckets = {"0-10": 0, "11-50": 0, "51-100": 0, "100+": 0}
        for p in papers:
            c = p.get("citation_count", 0)
            if c <= 10: buckets["0-10"] += 1
            elif c <= 50: buckets["11-50"] += 1
            elif c <= 100: buckets["51-100"] += 1
            else: buckets["100+"] += 1
            
        dist = [{"range": k, "count": v} for k, v in buckets.items()]
        return dist

    def _get_emerging_topics(self, papers: List[Dict[str, Any]]) -> List[str]:
        # Simple heuristic: heavily frequent words in the last 2-3 years out of the set
        recent_year = max([p.get("year") or 0 for p in papers] or [0])
        recent_papers = [p for p in papers if p.get("year", 0) >= recent_year - 2]
        
        if not recent_papers:
            return []
            
        freq_recent = self._get_keyword_frequency(recent_papers)
        # return top 3 emerging keywords as topics
        return [item["keyword"] for item in freq_recent[:3]]
