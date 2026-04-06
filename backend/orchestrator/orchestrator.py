from typing import List, Dict, Any
from services.discovery_service import search_research_papers
from agents.analysis_agent import AnalysisAgent
from agents.citation_agent import CitationAgent
from services.synthesis_service import synthesize_papers
from database.supabase_client import SupabaseDB


class Orchestrator:
    def __init__(self):
        self.analysis = AnalysisAgent()
        self.citation = CitationAgent()
        self.db = SupabaseDB()

    def execute_search_workflow(self, query: str, page: int = 1) -> Dict[str, Any]:
        """
        UPGRADED Orchestration: 10 results, pagination, and fallback protection.
        """
        trace = []

        # 2. Invoke Search Research Papers Service (10 results, pagination support)
        discovery_data = search_research_papers(query, page=page, limit=10)
        papers = discovery_data.get("papers", [])
        trace.append({"agent": "Discovery Agent", "status": "Completed (Multi-Source)"})

        analysis = None
        if len(papers) > 0:
            analysis = self.analysis.analyze_papers(papers)
            trace.append({"agent": "Analysis Agent", "status": f"Analyzed {len(papers)} papers"})

        # Initial Synthesis (Preview)
        synthesis_text = ""
        if len(papers) >= 2:
            synthesis_data = self.execute_synthesis_workflow(papers[:5])
            synthesis_text = synthesis_data.get("synthesis")
            trace.extend(synthesis_data.get("trace", []))

        # Citations (Preview)
        citations = self.citation.export_bulk_citations(papers[:3], format="txt", style="APA")
        trace.append({"agent": "Citation Agent", "status": "Completed"})

        return {
            "query": query,
            "papers": papers,
            "analysis": analysis,
            "synthesis": synthesis_text,
            "citations": citations,
            "trace": trace,
            "pagination": {
                "totalResults": discovery_data["totalResults"],
                "currentPage": discovery_data["currentPage"],
                "hasMore": discovery_data["hasMore"]
            }
        }

    def execute_synthesis_workflow(self, papers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Refactored Groq-based Synthesis Workflow.
        """
        trace = []
        if len(papers) < 2:
            return {"synthesis": "Please select at least 2 papers for synthesis.", "trace": trace}

        # Determine paper IDs and session_id for caching
        paper_ids = [p.get('id') for p in papers if p.get('id')]
        session_id = papers[0].get('session_id') if papers else None
        
        # 1. Check Cache
        if session_id and paper_ids:
            cached = self.db.get_synthesis(session_id, paper_ids)
            if cached:
                trace.append({"agent": "Synthesis Agent", "status": "Result Loaded from Cache"})
                return {"synthesis": cached, "trace": trace}

        # 2. Invoke Synthesis Agent (Groq)
        print("Synthesis Agent Invoked") # Requested Log
        synthesis_result = synthesize_papers(papers)
        
        # 3. Trace and Cache
        if "Synthesis service temporarily unavailable" in str(synthesis_result):
             trace.append({"agent": "Synthesis Agent", "status": "Failed"})
        else:
             trace.append({"agent": "Synthesis Agent", "status": "Completed"})
             # Store Cache
             if session_id and paper_ids:
                 try:
                     self.db.save_synthesis(session_id, paper_ids, synthesis_result)
                 except: pass

        return {
            "synthesis": synthesis_result,
            "trace": trace,
        }

    def execute_citation_workflow(
        self, papers: List[Dict[str, Any]], format: str, style: str
    ) -> Dict[str, Any]:
        trace = []
        trace.append({"agent": "Citation", "status": "running"})
        citations = self.citation.export_bulk_citations(papers, format, style)
        trace[-1]["status"] = "completed"
        return {
            "citations": citations,
            "trace": trace,
        }
