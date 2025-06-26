from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from Database import query
import json
from LLMhandler import generate_query

app = FastAPI()
schema = "sales(date TEXT NOT NULL,week_day TEXT NOT NULL,hour TEXT NOT NULL,ticket_number TEXT NOT NULL,waiter INT NOT NULL,product_name TEXT NOT NULL,quantity INT NOT NULL,unitary_price INT NOT NULL,total INT NOT NULL)"
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
    
    llmQuery = generate_query(question,schema)
    print(llmQuery)
    results = query(llmQuery)
    print(results)
    return {
        "question": question,
        "answer": json.dumps(results)
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)