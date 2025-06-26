import { useState } from 'react';
import './App.css';

function App() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [chartType, setChartType] = useState('auto')

  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await response.json();
      console.log(data);
      setResponse(data)
      setLoading(false)
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleChart = () => {
    const selectedChartType = chartType === 'auto' ? selectChartType() : chartType;
    
  }

  const selectChartType = () => {
    if(response.length <= 1){return 'none'}
    if(question.toLowerCase.includes('biggest') || question.toLowerCase.includes('most') || question.toLowerCase.includes('top')) {return 'bar'}
    if(question.toLowerCase.includes('trend') || question.toLowerCase.includes('time')) {return 'line'}
    if(response.length <= 7) { return 'pie'}
    return 'bar'
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Mini Nivil</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your data..."
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Asking...' : 'Ask'}
          </button>
        </form>
      </header>
    </div>
  );
}

export default App;
