import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import styles from './SalesForecastingInsightsGraph.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SalesForecastGraph = () => {
  const [salesData, setSalesData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availableYears, setAvailableYears] = useState([]);
  const [predictedSales, setPredictedSales] = useState(0);
  const [salesTrend, setSalesTrend] = useState(null); 

  // Define month names for the x-axis outside of hooks
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch('http://localhost:5001/sales-forecast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ year: selectedYear }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        if (data && data.sales_per_month && Array.isArray(data.sales_per_month)) {
          setSalesData(data.sales_per_month);
          setPredictedSales(data.predicted_sales_current_month.predicted_sales);

          const years = [...new Set(data.sales_per_month.map(item => item.year))];
          setAvailableYears(years);
        } else {
          throw new Error('Invalid data format');
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [selectedYear]);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const currentMonth = new Date().getMonth() + 1;

  // Filter sales data for the selected year
  const filteredSalesData = salesData.filter(item => item.year === parseInt(selectedYear));

  // Complete sales data for each month, including zero sales where no data is present
  const fullSalesData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthData = filteredSalesData.find(item => item.month === month);
    return monthData || { month, total_gross_sales: 0 };
  });

  // Update sales data for the current month to reflect predicted sales
  const updatedSalesData = fullSalesData.map(item => {
    if (item.month === currentMonth && selectedYear === new Date().getFullYear()) {
      return { ...item, total_gross_sales: predictedSales, isPredicted: true };
    }
    return item;
  });

  // Determine sales trend (up or down)
  useEffect(() => {
    const prevMonthData = updatedSalesData[currentMonth - 2]; // Current month - 1 for previous month
    const currentMonthData = updatedSalesData[currentMonth - 1];

    if (prevMonthData && currentMonthData) {
      if (currentMonthData.total_gross_sales > prevMonthData.total_gross_sales) {
        setSalesTrend('up');
      } else if (currentMonthData.total_gross_sales < prevMonthData.total_gross_sales) {
        setSalesTrend('down');
      } else {
        setSalesTrend('same');
      }
    }
  }, [updatedSalesData, currentMonth]);

  // Data for the chart: separating actual and predicted sales

  const currentMonthInGraph = new Date().getMonth() + 1;

  const data = {
    labels: updatedSalesData.map(item => monthNames[item.month - 1]), // Map month numbers to month names
    datasets: [
      {
        label: 'Actual Gross Sales',
        data: updatedSalesData.map(item => item.total_gross_sales),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
      {
        label: 'Predicted Sales (Current Month)',
        data: updatedSalesData.map(item => {
          if (item.month === currentMonthInGraph) {
            // If it's the current month, show both actual and predicted sales
            return item.isPredicted ? item.total_gross_sales : null;
          }
          return null; // For other months, show nothing
        }),
        borderColor: 'green',
        backgroundColor: 'rgba(0, 255, 0, 0.4)', // Increased transparency for better visibility
        fill: true,
        borderWidth: 4,
        pointBackgroundColor: 'green',
        pointBorderColor: 'green',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };
  
  
  

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow the chart to scale freely
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Sales Forecast for ${selectedYear}`,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Sales ($)',
        },
        beginAtZero: true,
      },
    },
  };

  const renderTrendArrow = () => {
    if (salesTrend === 'up') {
      return <span style={{ color: 'green' }}>↑</span>; // Green up arrow for increase
    } else if (salesTrend === 'down') {
      return <span style={{ color: 'red' }}>↓</span>; // Red down arrow for decrease
    } else {
      return <span>→</span>; // Neutral arrow for no change
    }
  };

  return (
    <div className={styles.section}>
      <h2>Sales Forecast</h2>
      <div className={styles.filterContainer}>
  <h3 className={styles.yearFilterTitle}>Select Year</h3>
  <div className={styles.selectContainer1}>
    <select value={selectedYear} onChange={handleYearChange} className={styles.yearSelect1}>
      {availableYears.length > 0 ? (
        availableYears.map(year => (
          <option key={year} value={year}>
            {year}
          </option>
        ))
      ) : (
        <option>No available years</option>
      )}
    </select>
  </div>
</div>


      {loading && <p>Loading data...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && (
        <div className={styles.graphContainer}>
          <Line data={data} options={options} />
        </div>
      )}
    </div>
  );
};

export default SalesForecastGraph;