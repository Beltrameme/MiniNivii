import { useState, useEffect, useRef } from 'react';
import './App.css';
import { Chart, registerables } from 'chart.js';
import { Card, CardContent, Typography } from '@mui/material';

// Register all Chart.js components at once
Chart.register(...registerables);

function App() {
  const [question, setQuestion] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('auto');
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (responseData) {
      renderChart();
    }
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [responseData, chartType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null)
    try {
      const response = await fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      if (!response.ok) { // Check for HTTP error statuses
      throw new Error(`Server responded with status ${response.status}`);
      }
      const data = await response.json();
      setResponseData(data);
      determineChartType(data);
      
    } catch (err) {
      setError(err.message);
      
    } finally {
      setLoading(false);
    }
  };

  const determineChartType = (data) => {
    console.log(data);
    console.log(data.length);
    
    
    if (!data?.length || data.length === 0) return setChartType('none');
    if (data.length === 1) return setChartType('text');
    

    const lowercaseQ = question.toLowerCase();
    const timeKeywords = ['trend', 'time', 'date', 'year', 'change over'];
    const comparisonKeywords = ['compare', 'versus', 'vs', 'difference', 'ranking'];

    if (timeKeywords.some(k => lowercaseQ.includes(k))) return setChartType('line');
    if (comparisonKeywords.some(k => lowercaseQ.includes(k))) return setChartType('bar');
    if (data.length <= 7) return setChartType('pie');
    
    setChartType('bar');
  };

  const getChartData = () => {
    if (!responseData?.length) return { labels: [], values: [] };

    const valueField = responseData.total ? 'total' : responseData.quantity ? 'quantity' : responseData.sum_total ? 'sum_total' : responseData.sum_quantity ? 'sum_quantity' :  Object.keys(responseData[0]).find(k => typeof responseData[0][k] === 'number');//alto
    const nameField = Object.keys(responseData[0]).find(k => typeof responseData[0][k] === 'string'); //dif puntos

    const sortedData = [...responseData].sort((a, b) => 
      a.date && b.date ? new Date(a.date) - new Date(b.date) : 0
    );

    return {
      labels: sortedData.map(item => item[nameField] || 'Item'),
      values: sortedData.map(item => valueField ? item[valueField] : 0),
      valueField,
      nameField
    };
  };

  const renderChart = () => {

    const ctx = document.getElementById('chartCanvas');
    if (!ctx || !responseData?.length) return;

    const { labels, values, valueField } = getChartData();

    if (chartRef.current) chartRef.current.destroy();

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}`
          }
        }
      },
      animation: { duration: 1000 }
    };

    switch (chartType) {
      case 'bar':
        chartRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: valueField,
              data: values,
              backgroundColor: '#00C49F',
              borderColor: '#000',
              borderWidth: 1
            }]
          },
          options: {
            ...commonOptions,
            scales: { y: { beginAtZero: true } }
          }
        });
        break;

      case 'line':
        chartRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: valueField,
              data: values,
              borderColor: '#FF8042',
              borderWidth: 3,
              pointRadius: 5,
              fill: false
            }]
          },
          options: {
            ...commonOptions,
            scales: { y: { beginAtZero: true } }
          }
        });
        break;

      case 'pie':
        chartRef.current = new Chart(ctx, {
          type: 'pie',
          data: {
            labels,
            datasets: [{
              data: values,
              backgroundColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']
            }]
          },
          options: {
            ...commonOptions,
            plugins: {
              ...commonOptions.plugins,
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                    const percent = Math.round((ctx.raw / total) * 100);
                    return `${ctx.label}: ${ctx.raw} (${percent}%)`;
                  }
                }
              }
            }
          }
        });
        break;

      default:
        return (
          <Card>
            <CardContent>
              <Typography>No data to display</Typography>
              <pre>{JSON.stringify(responseData, null, 2)}</pre>
            </CardContent>
          </Card>
        );
    }
  };

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
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Asking...' : 'Ask'}
          </button>
        </form>
        
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>Error: {JSON.stringify(error)}</p>}

        {responseData && !error && (
          <div style={{ width: '90%', maxWidth: '900px', margin: '20px auto', height: '400px' }}>
            {['text'].includes(chartType) ? (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Query Result</Typography>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {responseData && responseData.length > 0 && Object.entries(responseData[0]).map(([key, value]) => (
                        <tr key={key}>
                          <td style={{ fontWeight: 'bold', padding: '4px 8px', border: '1px solid #ccc' }}>{key}</td>
                          <td style={{ padding: '4px 8px', border: '1px solid #ccc' }}>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ) : ['none'].includes(chartType) ? (
              <Card>
            <CardContent>
              <Typography>No data to display</Typography>
              <pre>{JSON.stringify(responseData, null, 2)}</pre>
            </CardContent>
          </Card>) : (
              <canvas id="chartCanvas" style={{ width: '100%', height: '100%' }} />
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;