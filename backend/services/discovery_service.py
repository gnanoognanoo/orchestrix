import requests
from datetime import datetime
from typing import List, Dict, Any

def search_research_papers(query: str, page: int = 1, limit: int = 10):
    """
    UPGRADED DISCOVERY SERVICE: High-quality research metadata extraction.
    Implements primary Semantic Scholar search with OpenAlex fallback.
    """
    offset = (page - 1) * limit
    
    # 1. Fetch from Semantic Scholar
    print(f"DEBUG: Fetching Semantic Scholar (offset={offset}, limit={limit})...")
    raw_results = _fetch_semantic_scholar(query, limit, offset)
    print(f"DEBUG: Raw API result count: {len(raw_results)}")
    
    # 3. & 4. Normalize and Filter Weak Papers
    valid_papers = _filter_and_normalize(raw_results, query)
    print(f"DEBUG: Filtered result count (after length checks): {len(valid_papers)}")

    # 7. Fallback Mechanism
    if len(valid_papers) < 5:
        print(f"DEBUG: Fallback to OpenAlex triggered (less than 5 strong papers).")
        alex_raw = _fetch_openalex(query, limit)
        valid_papers.extend(_filter_and_normalize(alex_raw, query))
        
        # De-duplicate logic
        seen = set()
        deduped = []
        for p in valid_papers:
            if p['title'].lower() not in seen:
                seen.add(p['title'].lower())
                deduped.append(p)
        valid_papers = deduped

    # 5. Relevance Ranking Logic (Citations*0.4 + Recency*0.3 + Keywords*0.3)
    scored_papers = _rank_papers(valid_papers, query)
    
    # 9. Log count of short abstracts
    short_count = sum(1 for p in scored_papers if p.get('is_short_abstract'))
    print(f"DEBUG: Final discovery count: {len(scored_papers)} (Short abstracts: {short_count})")

    # 8. Return Pagination Metadata
    return {
        "papers": scored_papers[:limit],
        "totalResults": len(scored_papers),
        "currentPage": page,
        "hasMore": len(scored_papers) >= limit
    }

def _fetch_semantic_scholar(query: str, limit: int, offset: int) -> List[Dict]:
    url = "https://api.semanticscholar.org/graph/v1/paper/search"
    params = {
        "query": query,
        "limit": limit,
        "offset": offset,
        "fields": "paperId,title,abstract,authors,year,url,citationCount,venue"
    }
    try:
        resp = requests.get(url, params=params, timeout=12)
        if resp.status_code == 200:
            return resp.json().get('data', [])
        return []
    except:
        return []

def _fetch_openalex(query: str, limit: int) -> List[Dict]:
    url = "https://api.openalex.org/works"
    params = {
        "search": query,
        "per_page": limit,
        "select": "id,display_name,abstract_inverted_index,publication_year,cited_by_count,authorships,doi"
    }
    try:
        resp = requests.get(url, params=params, timeout=12)
        if resp.status_code == 200:
            return resp.json().get('results', [])
        return []
    except:
        return []

def _filter_and_normalize(raw_papers: List[Dict], query: str) -> List[Dict]:
    normalized = []
    for p in raw_papers:
        # Title handling (Semantic Scholar vs OpenAlex)
        title = p.get('title') or p.get('display_name')
        if not title: continue
        
        # Abstract reconstruction / handling
        abstract = p.get('abstract') or ""
        if isinstance(abstract, dict) and 'abstract_inverted_index' in p:
            abstract = _rebuild_alex_abstract(p.get('abstract_inverted_index'))
        elif not abstract and 'abstract_inverted_index' in p:
            abstract = _rebuild_alex_abstract(p.get('abstract_inverted_index'))

        # 4. Filter Weak Papers (abstract < 150)
        if not abstract or len(abstract) < 150:
            continue
            
        # Author Extraction
        authors = []
        authors_raw = p.get('authors', []) or p.get('authorships', [])
        for a in authors_raw:
            name = a.get('name') or a.get('author', {}).get('display_name')
            if name: authors.append(name)

        # 6. Abstract Enrichment
        is_short = len(abstract) < 300
        
        normalized.append({
            "id": p.get('paperId') or p.get('id'),
            "title": title,
            "authors": ", ".join(authors),
            "year": p.get('year') or p.get('publication_year') or 0,
            "abstract": abstract,
            "citation_count": p.get('citationCount') or p.get('cited_by_count') or 0,
            "source_url": p.get('url') or p.get('doi') or "",
            "venue": (p.get('venue') if isinstance(p.get('venue'), str) else None) or p.get('host_venue', {}).get('display_name') or "",
            "is_short_abstract": is_short
        })
    return normalized

def _rank_papers(papers: List[Dict], query: str) -> List[Dict]:
    now = datetime.now().year
    keywords = query.lower().split()
    
    for p in papers:
        # Citation Score (0.4)
        cits = p.get('citation_count', 0)
        cit_score = min(100, cits * 2) # Weighted normalization
        
        # Recency Score (0.3)
        year = p.get('year', 0)
        rec_score = 0
        if year > 0:
            diff = now - year
            if diff <= 5: rec_score = 100
            elif diff <= 10: rec_score = 70
            else: rec_score = 40
            
        # Keyword Score (0.3)
        text = f"{p['title']} {p['abstract']}".lower()
        matches = sum(1 for kw in keywords if kw in text)
        key_score = min(100, (matches / (len(keywords) or 1)) * 100)
        
        p['score'] = (cit_score * 0.4) + (rec_score * 0.3) + (key_score * 0.3)
        
    return sorted(papers, key=lambda x: x['score'], reverse=True)

def _rebuild_alex_abstract(index):
    if not index: return ""
    try:
        max_idx = 0
        for pos_list in index.values():
            if pos_list:
                m = max(pos_list)
                if m > max_idx: max_idx = m
        
        words = [None] * (max_idx + 1)
        for word, positions in index.items():
            for pos in positions:
                words[pos] = word
        return " ".join([w for w in words if w is not None])
    except: return ""
