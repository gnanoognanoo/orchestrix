from typing import List, Dict, Any

class CitationAgent:
    def generate_citation(self, paper: Dict[str, Any], style: str = 'APA') -> str:
        # Expected paper keys: title, authors, year, source_url
        authors = paper.get('authors', 'Unknown')
        year = paper.get('year', 'n.d.')
        title = paper.get('title', 'Untitled')
        url = paper.get('source_url', '')

        if style.upper() == 'APA':
            return f"{authors}. ({year}). {title}. Retrieved from {url}"
        elif style.upper() == 'IEEE':
            return f"{authors}, \"{title},\" {year}. [Online]. Available: {url}."
        elif style.upper() == 'MLA':
            return f"{authors}. \"{title}.\" {year}. Web. {url}."
        else:
            return f"{authors} ({year}). {title}."

    def export_bulk_citations(self, papers: List[Dict[str, Any]], format: str = 'txt', style: str = 'APA') -> str:
        if format.lower() == 'bib':
            return self._generate_bibtex(papers)
        else:
            citations = [self.generate_citation(p, style) for p in papers]
            return "\n\n".join(citations)

    def _generate_bibtex(self, papers: List[Dict[str, Any]]) -> str:
        bib_entries = []
        for i, p in enumerate(papers):
            author_str = p.get('authors', 'Unknown').replace(", ", " and ")
            bib = f"""@article{{paper{i},
  title={{{p.get('title', 'Untitled')}}},
  author={{{author_str}}},
  year={{{p.get('year', 'Unknown')}}},
  url={{{p.get('source_url', '')}}}
}}"""
            bib_entries.append(bib)
        return "\n\n".join(bib_entries)
