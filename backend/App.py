from flask import Flask, request,jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/ask', methods=['POST'])
def echo():
    data = request.get_json()

    if not data:
        return jsonify({"error": "no question" }), 400
    
    question = data['question']
    return jsonify({
        "question": question,
        "answer": "recieved"
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')