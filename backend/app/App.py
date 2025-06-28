from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from Database import query, load_csv
import json
from LLMhandler import generate_query

#load db
load_csv('../data/data.csv')

#standard CORS and FastAPI start
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

#api health check
@app.get("/")
async def health_check():
    return {"status": "healthy"}

#ask endpoint
@app.post("/ask")
async def echo(request: Request):
    data = await request.json()
    
    #error handling
    if not data:
        raise HTTPException(status_code=400, detail="no question")
    
    question = data.get('question')
    if not question:
        raise HTTPException(status_code=400, detail="question field is required")
    
    #llm to query
    llmQuery = generate_query(question)
    if(llmQuery == 'UNABLE TO MAKE QUERY'):
        raise HTTPException(status_code=400, detail="Unable to make Query") #error in case of unmakable query
    print(llmQuery)
    results = query(llmQuery)
    print(json.dumps(results))
    return results
