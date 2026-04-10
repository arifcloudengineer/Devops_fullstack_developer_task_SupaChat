from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Any
import os
import httpx
from supabase import create_client, Client
from prometheus_fastapi_instrumentator import Instrumentator
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SupaChat API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

SCHEMA_CONTEXT = """
You have access to a Supabase PostgreSQL database with these tables:

Table: articles
- id (int, primary key)
- title (text)
- topic (text) - values: 'AI', 'DevOps', 'Cloud', 'Security', 'Web Dev'
- views (int)
- likes (int)
- comments (int)
- published_at (date)
- author (text)

Table: daily_stats
- id (int)
- article_id (int, foreign key -> articles.id)
- date (date)
- views (int)
- unique_visitors (int)

Convert the user's natural language question into a valid PostgreSQL SELECT query.
Rules:
- Return ONLY the SQL query, nothing else
- No markdown, no explanation, no backticks
- Always use proper table names and column names from above
- Use date_trunc, interval for date operations
- LIMIT results to 50 rows max
"""

class QueryRequest(BaseModel):
    question: str
    history: Optional[List[dict]] = []

class QueryResponse(BaseModel):
    answer: str
    sql: str
    data: Optional[List[Any]] = []
    chart_type: Optional[str] = None
    columns: Optional[List[str]] = []

async def call_groq(system: str, user: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": GROQ_MODEL,
                "max_tokens": 500,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user}
                ]
            },
            timeout=30.0
        )
        data = response.json()
        if "choices" not in data:
            logger.error(f"Groq error: {data}")
            raise Exception(f"Groq API error: {data.get('error', {}).get('message', str(data))}")
        return data["choices"][0]["message"]["content"].strip()

async def nl_to_sql(question: str) -> str:
    return await call_groq(SCHEMA_CONTEXT, question)

async def generate_answer(question: str, data: list, sql: str) -> dict:
    data_preview = str(data[:5]) if data else "No data found"
    prompt = f"""User asked: "{question}"
SQL executed: {sql}
Results (first 5 rows): {data_preview}
Total rows: {len(data)}

Write a short friendly answer (2-3 sentences) and suggest chart type.

Respond in this exact format:
ANSWER: <your answer here>
CHART: <bar|line|pie|table>"""

    text = await call_groq("You are a helpful data analyst. Be concise.", prompt)
    answer = ""
    chart_type = "table"
    for line in text.split("\n"):
        if line.startswith("ANSWER:"):
            answer = line.replace("ANSWER:", "").strip()
        elif line.startswith("CHART:"):
            chart_type = line.replace("CHART:", "").strip().lower()
    return {"answer": answer, "chart_type": chart_type}

@app.get("/health")
def health():
    return {"status": "ok", "service": "supachat-api", "model": GROQ_MODEL}

@app.post("/query", response_model=QueryResponse)
async def query(req: QueryRequest):
    try:
        logger.info(f"Query: {req.question}")
        sql = await nl_to_sql(req.question)
        logger.info(f"SQL: {sql}")

        if not supabase:
            data, columns = [], []
        else:
            result  = supabase.rpc("execute_query", {"query_text": sql}).execute()
            data    = result.data if result.data else []
            columns = list(data[0].keys()) if data else []

        ai_response = await generate_answer(req.question, data, sql)

        return QueryResponse(
            answer     = ai_response["answer"] or f"Results for: {req.question}",
            sql        = sql,
            data       = data,
            chart_type = ai_response["chart_type"],
            columns    = columns
        )
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sample-data")
async def get_sample_data():
    return {
        "articles": [
            {"topic": "AI",       "views": 4500, "likes": 320, "comments": 45},
            {"topic": "DevOps",   "views": 3200, "likes": 210, "comments": 38},
            {"topic": "Cloud",    "views": 2800, "likes": 190, "comments": 29},
            {"topic": "Security", "views": 2100, "likes": 145, "comments": 22},
            {"topic": "Web Dev",  "views": 1800, "likes": 130, "comments": 18},
        ]
    }