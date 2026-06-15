from fastapi import APIRouter
from pydantic import BaseModel
import pandas as pd
import duckdb
import os
import json
import re
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

router = APIRouter()
DATA_FILE = "supply_chain_data.csv"

def get_df():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    file_path = os.path.join(base_dir, DATA_FILE)
    return pd.read_csv(file_path)

# Load once at startup
DF = get_df()
COLUMNS = list(DF.columns)
SAMPLE = DF.head(3).to_markdown()

class ChatRequest(BaseModel):
    query: str
    history: list = []

def build_sql_prompt(query, error_context=None):
    base = f"""You are a SQL analyst. Write a DuckDB SQL query to answer the question.

The table is called `df`. Use double quotes for column names.

Columns: {COLUMNS}

Sample rows:
{SAMPLE}

Question: {query}

RULES:
- Write ONLY the SQL query inside a ```sql ``` block. No explanation.
- Use double-quoted column names: "Revenue generated", "Supplier name", etc.
- There is NO "Total Profit" column. Calculate profit as: "Revenue generated" - "Costs" - "Manufacturing costs" - "Shipping costs"
- Defect rates are stored as numbers like 1.8, 2.5 (NOT 0.018). So "below 3%" means WHERE value < 3.
- Always use aggregation (SUM, AVG, COUNT) with GROUP BY when comparing entities.
- Use ROUND() on numeric results.
- IMPORTANT: Read the question carefully. "revenue" means SUM("Revenue generated"). "profit" means SUM("Revenue generated" - "Costs" - "Manufacturing costs" - "Shipping costs"). Do NOT confuse them.

EXAMPLE SQL PATTERNS:

-- Total revenue by supplier:
SELECT "Supplier name", ROUND(SUM("Revenue generated")) AS Total_Revenue FROM df GROUP BY "Supplier name" ORDER BY Total_Revenue DESC

-- Profit by location for a product type:
SELECT "Location", ROUND(SUM("Revenue generated" - "Costs" - "Manufacturing costs" - "Shipping costs")) AS Total_Profit FROM df WHERE "Product type" = 'cosmetics' GROUP BY "Location" ORDER BY Total_Profit DESC

-- Suppliers with avg defect rate below X% and their revenue:
SELECT "Supplier name", ROUND(SUM("Revenue generated")) AS Total_Revenue FROM df WHERE "Supplier name" IN (SELECT "Supplier name" FROM df GROUP BY "Supplier name" HAVING AVG("Defect rates") < 3) GROUP BY "Supplier name" ORDER BY Total_Revenue DESC LIMIT 1
"""
    if error_context:
        base += f"""
YOUR PREVIOUS SQL FAILED with this error:
{error_context}
Fix the SQL query.
"""
    base += "\n```sql\nSELECT ...\n```"
    return base

@router.post("/")
def chat_with_data(req: ChatRequest):
    llm = ChatOpenAI(
        model="minimaxai/minimax-m3",
        temperature=0.0,
        max_tokens=2048,
        api_key=os.environ.get("NVIDIA_API_KEY", ""),
        base_url="https://integrate.api.nvidia.com/v1"
    )

    max_retries = 3
    last_error = None
    df = DF.copy()

    for attempt in range(max_retries):
        try:
            # Step 1: Generate SQL
            prompt = build_sql_prompt(req.query, last_error)
            sql_res = llm.invoke([HumanMessage(content=prompt)])
            sql_match = re.search(r"```sql\n(.*?)\n```", sql_res.content, re.DOTALL)

            if not sql_match:
                last_error = "No SQL code block found in response."
                continue

            sql_query = sql_match.group(1).strip()
            print(f"--- ATTEMPT {attempt + 1} SQL ---")
            print(sql_query)
            print("---")

            # Step 2: Execute via DuckDB
            result_df = duckdb.sql(sql_query).df()
            raw_answer = result_df.to_markdown(index=False)

            print(f"--- RESULT ---")
            print(raw_answer)
            print("---")

            # Step 3: Format into JSON for the UI
            # Convert result to supporting_data
            supporting_data = result_df.head(5).to_dict(orient="records")
            # Round numbers in supporting data
            for row in supporting_data:
                for k, v in row.items():
                    if isinstance(v, float):
                        row[k] = round(v, 2)

            format_prompt = f"""Convert this SQL result into a JSON answer. No markdown, just raw JSON.

User Question: {req.query}
SQL Result:
{raw_answer}

{{
    "answer": "A clear, engaging explanation of the result. Format numbers as integers with commas and $ where appropriate (e.g. $157,528). Explain the result, not just the number.",
    "methodology": "Executed a SQL query against the supply chain dataset using DuckDB to calculate the exact answer.",
    "confidence": "High"
}}"""

            format_res = llm.invoke([
                SystemMessage(content="Return ONLY a raw JSON object. No markdown."),
                HumanMessage(content=format_prompt)
            ])
            output_str = format_res.content.strip()

            # Clean markdown
            for prefix in ["```json", "```"]:
                if output_str.startswith(prefix):
                    output_str = output_str[len(prefix):]
            if output_str.endswith("```"):
                output_str = output_str[:-3]
            output_str = output_str.strip()

            start_idx = output_str.find('{')
            end_idx = output_str.rfind('}')

            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                try:
                    parsed = json.loads(output_str[start_idx:end_idx + 1])
                    parsed["supporting_data"] = supporting_data
                    return parsed
                except json.JSONDecodeError:
                    pass

            return {
                "answer": raw_answer,
                "supporting_data": supporting_data,
                "methodology": "Executed SQL via DuckDB.",
                "confidence": "High"
            }

        except Exception as e:
            last_error = str(e)
            print(f"--- ATTEMPT {attempt + 1} FAILED: {last_error} ---")
            continue

    return {
        "answer": f"Failed after {max_retries} attempts. Last error: {last_error}",
        "supporting_data": [],
        "methodology": "The SQL agent could not produce a working query.",
        "confidence": "Low",
        "error": last_error
    }
