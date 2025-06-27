from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.Database import query, load_csv
import json
from app.LLMhandler import generate_query

load_csv('/app/data/data.csv')

app = FastAPI()
# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
async def health_check():
    return {"status": "healthy"}

@app.post("/ask")
async def echo(request: Request):
    data = await request.json()
    
    if not data:
        raise HTTPException(status_code=400, detail="no question")
    
    question = data.get('question')
    if not question:
        raise HTTPException(status_code=400, detail="question field is required")
    
    llmQuery = generate_query(question)
    if(llmQuery == 'UNABLE TO MAKE QUERY'):
        raise HTTPException(status_code=400, detail="Unable to make Query")
    print(llmQuery)
    results = query(llmQuery)
    print(json.dumps(results))
    return results
