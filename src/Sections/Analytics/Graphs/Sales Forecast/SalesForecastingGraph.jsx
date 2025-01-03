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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch('https://lolos-place-backend.onrender.com/graphs/call-sales-forecast', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        if (data && data.sales_per_month && Array.isArray(data.sales_per_month)) {
          const salesByYear = data.sales_per_month.reduce((acc, item) => {
            if (!acc[item.year]) acc[item.year] = [];
            acc[item.year].push(item);
            return acc;
          }, {});
          setSalesData(salesByYear);

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
  }, []);

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
  };

  const filteredSalesData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthData = salesData[selectedYear]?.find(item => item.month === month) || { month, total_gross_sales: 0 };

    if (selectedYear === currentYear && month === currentMonth) {
      return { ...monthData, total_gross_sales: predictedSales, isPredicted: true };
    }

    return monthData;
  });

  useEffect(() => {
    const prevMonthData = filteredSalesData[currentMonth - 2];
    const currentMonthData = filteredSalesData[currentMonth - 1];

    if (prevMonthData && currentMonthData) {
      if (currentMonthData.total_gross_sales > prevMonthData.total_gross_sales) {
        setSalesTrend('up');
      } else if (currentMonthData.total_gross_sales < prevMonthData.total_gross_sales) {
        setSalesTrend('down');
      } else {
        setSalesTrend('same');
      }
    }
  }, [filteredSalesData, currentMonth]);

  const data = {
    labels: monthNames,
    datasets: [
      {
        label: 'Actual Gross Sales',
        data: filteredSalesData.map(item => item.total_gross_sales),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
      {
        label: 'Predicted Sales (Current Month)',
        data: filteredSalesData.map(item => item.isPredicted ? item.total_gross_sales : null),
        borderColor: 'green',
        backgroundColor: 'rgba(0, 255, 0, 0.4)',
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
    maintainAspectRatio: false,
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
      return <span style={{ color: 'green' }}>↑</span>;
    } else if (salesTrend === 'down') {
      return <span style={{ color: 'red' }}>↓</span>;
    } else {
      return <span>→</span>;
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
