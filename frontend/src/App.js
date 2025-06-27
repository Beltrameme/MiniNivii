import { useState, useEffect, useRef } from 'react';
import './App.css';
import { Chart, BarController, LineController, PieController, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, Typography } from '@mui/material';

// Register Chart.js components
Chart.register(
  BarController, LineController, PieController, 
  CategoryScale, LinearScale, 
  BarElement, LineElement, PointElement, ArcElement, 
  Tooltip, Legend
);

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function App() {
  const [question, setQuestion] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('auto');
  const chartRef = useRef(null);

  useEffect(() => {
    if (responseData) {
      renderChart();
    }
    return () => {
      // Clean up chart instance when component unmounts or data changes
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [responseData, chartType]);

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await response.json();
      setResponseData(data);
      determineChartType(question, data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const determineChartType = (question, data) => {
    if (!data) {
      setChartType(null);
      return;
    }
    if(data.length <= 1){
      setChartType('none')
      return;
    }
    const lowercaseQ = question.toLowerCase();
    if (lowercaseQ.includes('trend') || lowercaseQ.includes('time') || lowercaseQ.includes('date')) {
      setChartType('line');
      return
    } else if (lowercaseQ.includes('biggest') || lowercaseQ.includes('most') || lowercaseQ.includes('top')) {
      setChartType('bar');
      return
    } else if (data.length <= 7) {
      setChartType('pie');
      return;
    } else {
      setChartType('bar');
    }
  };

  const getValueField = (data) => {
    if (!data || !data[0]) return null;
    
    const valueFields = ['total', 'quantity', 'sum_total', 'sum_quantity'];
    
    for (const field of valueFields) {
      if (data[0][field] !== undefined) {
        return field;
      }
    }
    
    const categoryFields = ['product_name', 'waiter', 'date', 'week_day', 'hour', 'ticket_number'];
    for (const key in data[0]) {
      if (!categoryFields.includes(key) && typeof data[0][key] === 'number') {
        return key;
      }
    }
    
    return null;
  };

  const getNameField = (data) => {
    if (!data || !data[0]) return null;
    
    const nameFields = ['product_name', 'waiter', 'date', 'week_day', 'hour'];
    for (const field of nameFields) {
      if (data[0][field] !== undefined) {
        return field;
      }
    }
    
    for (const key in data[0]) {
      if (typeof data[0][key] === 'string') {
        return key;
      }
    }
    
    return null;
  };

  const prepareChartData = () => {
    if (!responseData || !responseData.length) return [];

    const valueField = getValueField(responseData);
    const nameField = getNameField(responseData);

    return responseData.map(item => ({
      name: nameField ? item[nameField] : 'Item',
      value: valueField ? item[valueField] : 0,
      ...item
    }));
  };

  const renderChart = () => {
    if (!responseData || !responseData.length) return null;

    const chartData = prepareChartData();
    const valueField = getValueField(responseData);
    const nameField = getNameField(responseData);
    
    if (!valueField) {
      return (
        <Card>
          <CardContent>
            <Typography>No numeric data found to display</Typography>
            <pre>{JSON.stringify(responseData, null, 2)}</pre>
          </CardContent>
        </Card>
      );
    }

    // Destroy previous chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = document.getElementById('chartCanvas');
    if (!ctx) return;

    const labels = chartData.map(item => item.name);
    const dataValues = chartData.map(item => item.value);

    const barFill = '#00C49F';  // Bright teal
    const lineStroke = '#FF8042'; // Bright orange

    switch (chartType) {
      case 'bar':
        chartRef.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: valueField,
              data: dataValues,
              backgroundColor: barFill,
              borderColor: '#000',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true
              }
            },
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.dataset.label}: ${context.raw}`;
                  }
                }
              }
            },
            animation: {
              duration: 1500
            }
          }
        });
        break;
      
      case 'line':
        chartRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: valueField,
              data: dataValues,
              borderColor: lineStroke,
              backgroundColor: lineStroke,
              borderWidth: 3,
              pointBackgroundColor: lineStroke,
              pointRadius: 5,
              pointHoverRadius: 8,
              fill: false
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true
              }
            },
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.dataset.label}: ${context.raw}`;
                  }
                }
              }
            },
            animation: {
              duration: 1500
            }
          }
        });
        break;
      
      case 'pie':
        chartRef.current = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              data: dataValues,
              backgroundColor: COLORS.slice(0, chartData.length),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            },
            animation: {
              duration: 1500
            }
          }
        });
        break;
      
      case 'none':
        return (
          <Card>
            <CardContent>
              <Typography>Single Value Result</Typography>
              <Typography variant="h5">
                {responseData[0][valueField]}
              </Typography>
            </CardContent>
          </Card>
        );
      
      default:
        return (
          <Card>
            <CardContent>
              <Typography>Unable to determine chart type</Typography>
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
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Asking...' : 'Ask'}
          </button>
        </form>
        
        {loading && <p>Loading...</p>}
        
        {responseData && (
          <div style={{ width: '90%', maxWidth: '900px', margin: '20px auto', height: '400px' }}>
            {chartType === 'none' ? (
              <Card>
                <CardContent>
                  <Typography>Single Value Result</Typography>
                  <Typography variant="h5">
                    {responseData[0][getValueField(responseData)]}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <canvas id="chartCanvas" style={{ width: '100%', height: '100%' }}></canvas>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;