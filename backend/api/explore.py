from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional, Any
import pandas as pd
import os
import json
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

router = APIRouter()
DATA_FILE = "supply_chain_data.csv"

def get_df():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    file_path = os.path.join(base_dir, DATA_FILE)
    return pd.read_csv(file_path)

class ExploreRequest(BaseModel):
    metric: str
    dimension: str
    suppliers: Optional[List[str]] = None
    regions: Optional[List[str]] = None
    products: Optional[List[str]] = None

@router.post("/query")
def explore_query(req: ExploreRequest):
    df = get_df()
    
    if req.suppliers and "All" not in req.suppliers:
        df = df[df['Supplier name'].isin(req.suppliers)]
    if req.regions and "All" not in req.regions:
        df = df[df['Location'].isin(req.regions)]
    if req.products and "All" not in req.products:
        df = df[df['Product type'].isin(req.products)]
        
    if df.empty:
        return {"data": []}
        
    agg_func = "sum"
    if req.metric in ['Shipping times', 'Lead times', 'Defect rates', 'Manufacturing lead time']:
        agg_func = "mean"
        
    if req.dimension not in df.columns or req.metric not in df.columns:
        return {"error": "Invalid dimension or metric"}
        
    grouped = df.groupby(req.dimension)[req.metric].agg(agg_func).reset_index()
    grouped = grouped.sort_values(by=req.metric, ascending=False)
    
    return {"data": grouped.to_dict(orient="records")}

@router.post("/story")
def generate_story(req: ExploreRequest):
    df = get_df()
    
    if req.suppliers and "All" not in req.suppliers:
        df = df[df['Supplier name'].isin(req.suppliers)]
    if req.regions and "All" not in req.regions:
        df = df[df['Location'].isin(req.regions)]
    if req.products and "All" not in req.products:
        df = df[df['Product type'].isin(req.products)]
        
    if df.empty:
        return {"story": {"headline": "No Data", "error": "There is no data available for the selected filters to generate a story."}}
        
    agg_func = "sum"
    if req.metric in ['Shipping times', 'Lead times', 'Defect rates', 'Manufacturing lead time']:
        agg_func = "mean"
        
    grouped = df.groupby(req.dimension)[req.metric].agg(agg_func).reset_index()
    grouped = grouped.sort_values(by=req.metric, ascending=False)
    context_data = grouped.to_csv(index=False)
    
    llm = ChatOpenAI(
        model="meta/llama-3.1-70b-instruct",
        temperature=0.3,
        max_tokens=1024,
        api_key=os.environ.get("NVIDIA_API_KEY", ""),
        base_url="https://integrate.api.nvidia.com/v1"
    )
    
    prompt = f"""
    You are a Senior Data Analyst presenting to executives.
    Analyze the following aggregated data and extract the key insights for a KPI dashboard.
    
    Metric being analyzed: {req.metric}
    Dimension (Grouping): {req.dimension}
    Filters Applied:
    - Suppliers: {req.suppliers or 'All'}
    - Regions: {req.regions or 'All'}
    - Products: {req.products or 'All'}
    
    Aggregated Data (CSV Format):
    {context_data}
    
    CRITICAL RULES:
    1. Identify the Top Performer and Worst Performer based on the metric. (Note: For some metrics like 'Defect rates', lower is better, so the Top Performer has the lowest value).
    2. Calculate the "Gap" between the top and worst performer.
    3. Calculate the "Average" of the metric.
    4. Format all numbers cleanly (e.g., $1,000,000 or 4.5%).
    5. Formulate a single Recommended Action based on the data.
    6. Output your response EXACTLY as a raw JSON string matching this structure:
    {{
      "headline": "A punchy 2-line executive summary insight.",
      "best_performer": {{"name": "Name", "value": "Formatted Value"}},
      "worst_performer": {{"name": "Name", "value": "Formatted Value"}},
      "gap": "Formatted gap difference",
      "average": "Formatted average",
      "action": "A single sentence recommending an actionable step."
    }}
    """
    
    try:
        messages = [
            SystemMessage(content="You are an expert data storyteller. Return ONLY valid JSON. No markdown. No conversational text."),
            HumanMessage(content=prompt)
        ]
        response = llm.invoke(messages)
        output_str = response.content.strip()
        
        # Clean markdown
        if output_str.startswith("```json"):
            output_str = output_str[7:]
        if output_str.startswith("```"):
            output_str = output_str[3:]
        if output_str.endswith("```"):
            output_str = output_str[:-3]
            
        import re
        start_idx = output_str.find('{')
        end_idx = output_str.rfind('}')
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            json_str = output_str[start_idx:end_idx+1]
            try:
                parsed = json.loads(json_str)
                return {"story": parsed}
            except json.JSONDecodeError:
                pass
                
        return {"story": {"headline": "Parsing Failed", "error": "The model provided an answer but did not format it as JSON correctly."}}
    except Exception as e:
        return {"story": {"headline": "API Error", "error": f"Failed to generate story. Error: {str(e)}"}}

@router.get("/filters")
def get_filters():
    df = get_df()
    return {
        "suppliers": df['Supplier name'].dropna().unique().tolist(),
        "regions": df['Location'].dropna().unique().tolist(),
        "products": df['Product type'].dropna().unique().tolist(),
        "metrics": ['Revenue generated', 'Costs', 'Number of products sold', 'Shipping times', 'Defect rates', 'Order quantities', 'Total Profit'],
        "dimensions": ['Supplier name', 'Location', 'Product type', 'Transportation modes', 'Routes', 'Customer demographics']
    }
