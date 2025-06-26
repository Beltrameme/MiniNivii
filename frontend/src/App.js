import { useState } from 'react';
import './App.css';
import {ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Rectangle, LineChart, Line, PieChart, Pie,} from 'recharts'
import { Card, CardContent, Typography } from '@mui/material';

function App() {
  const [question, setQuestion] = useState("");
  const [responseData, setResponseData] = useState(null)
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
      console.log(data.length);
      setResponseData(data)
      setLoading(false)
      
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const selectChartType = () => {
    const lowercaseQ = question.toLowerCase()
    if(responseData.length <= 1){setChartType('none'); return}
    if(lowercaseQ.includes('biggest') || lowercaseQ.includes('most') || lowercaseQ.includes('top')) {setChartType('bar'); return}
    if(lowercaseQ.includes('trend') || lowercaseQ.includes('time')) {setChartType('line'); return}
    if(responseData.length <= 7) {setChartType('pie'); return}
    setChartType('bar'); return
  }

  const handleChart = () => {
    const selectedChartType = chartType === 'auto' ? selectChartType() : chartType;
    // const hasTotal = responseData[0]?.total !== undefined;
    // const hasQuantity = responseData[0]?.quantity !== undefined || responseData[0]?.['SUM(quantity)'] !== undefined || responseData[0]?.total_quantity !== undefined;
    // const hasProductName = responseData[0]?.product_name !== undefined;
    // const hasWaiter = responseData[0]?.waiter !== undefined;
    // const hasDate = responseData[0]?.date !== undefined;

    // // Prepare and sort data (especially important for dates)
    // const chartData = responseData
    //   .map(item => ({
    //     ...item,
    //     quantity: item.quantity || item['SUM(quantity)'],
    //     name: hasProductName ? item.product_name : 
    //           hasWaiter ? `Waiter ${item.waiter}` : 
    //           hasDate ? item.date : 
    //           'Item',
    //     // Convert date to Date object for proper sorting
    //     dateObj: hasDate ? new Date(
    //       parseInt(item.date.split('/')[2]), // year
    //       parseInt(item.date.split('/')[0]) - 1, // month (0-indexed)
    //       parseInt(item.date.split('/')[1]) // day
    //     ) : null
    //   }))
    //   .sort((a, b) => {
    //     // Sort by date if available
    //     if (hasDate) return a.dateObj - b.dateObj;
    //     // Sort by value if no date
    //     const aValue = hasTotal ? a.total : a.quantity;
    //     const bValue = hasTotal ? b.total : b.quantity;
    //     return bValue - aValue;
    //   });

    // // Determine value field
    // const valueField = hasTotal ? 'total' : 
    //                   hasQuantity ? 'quantity' : 
    //                   Object.keys(responseData[0]).find(key => key !== 'product_name' && key !== 'waiter' && key !== 'date');
    
    switch (selectedChartType) {
      case 'bar':
        return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={ hasProductName ? 'Product' : hasWaiter ? 'Waiter' : 'Date' } />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={valueField} fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
        </BarChart>
      </ResponsiveContainer>
    );
        break;
      
      case 'line':
        return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={500}
          height={300}
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={valueField} stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    );
        break;
      
      case 'pie':
        return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={400}>
          <Pie
            dataKey={chartData}
            isAnimationActive={false}
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
        break;
      
      case 'none':
        <div>
          <p>{`${valueField} de ${chartData}`}</p>
        </div>
        break;
      default:
        <div>
          <p>OCURRIO UN ERROR</p>
        </div>
        break;
    }
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
