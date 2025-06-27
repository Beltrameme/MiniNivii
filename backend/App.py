from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from Database import query
import json
from LLMhandler import generate_query

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
    print(llmQuery)
    results = query(llmQuery)
    print(json.dumps(results))
    return results

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)