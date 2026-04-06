from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from orchestrator.orchestrator import Orchestrator
from services.synthesis_service import synthesize_papers
from database.supabase_client import SupabaseDB

router = APIRouter()
orchestrator = Orchestrator()
db = SupabaseDB()

class SearchRequest(BaseModel):
    query: str
    session_name: Optional[str] = None

class SynthesisRequest(BaseModel):
    papers: List[Dict[str, Any]]

class CitationRequest(BaseModel):
    papers: List[Dict[str, Any]]
    format: str = 'txt'
    style: str = 'APA'

@router.post("/search")
async def search(req: SearchRequest):
    try:
        result = orchestrator.execute_search_workflow(req.query)
        
        # Save to DB if requested
        if req.session_name:
            # We skip DB insertion errors if no keys provided yet, just warn
            try:
                session_res = db.save_session(req.session_name, req.query)
                if session_res and session_res.data:
                    session_id = session_res.data[0]['id']
                    result['session_id'] = session_id
                    db.save_papers(session_id, result['papers'])
                    if result.get('analysis'):
                        db.save_analysis(session_id, result['analysis'])
            except Exception as db_e:
                print(f"DB Error: {db_e}")

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/synthesize")
async def synthesize(req: SynthesisRequest):
    """
    POST /synthesize
    Directly calls the Groq-powered synthesis service.
    """
    print(f"DEBUG: /synthesize endpoint hit with {len(req.papers)} papers")
    try:
        # Orchestrator requirements: Only call Synthesis Agent if selected papers >= 2
        if len(req.papers) < 2:
            return {"result": "Please select at least 2 papers for synthesis."}

        print("Synthesis Agent Invoked") # Requested log
        synthesis_text = synthesize_papers(req.papers)
        
        # Return: { result: synthesisText } AND { synthesis: synthesisText } for frontend compatibility
        return {
            "result": synthesis_text,
            "synthesis": synthesis_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cite")
async def cite(req: CitationRequest):
    try:
        result = orchestrator.execute_citation_workflow(req.papers, req.format, req.style)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions")
async def get_sessions():
    try:
        res = db.get_sessions()
        return res.data if hasattr(res, 'data') else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}")
async def get_session_details(session_id: str):
    try:
        return db.get_session_details(session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    try:
        db.delete_session(session_id)
        return {"status": "success", "message": "Session deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
