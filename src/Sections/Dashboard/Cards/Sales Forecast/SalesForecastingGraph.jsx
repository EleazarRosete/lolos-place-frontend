import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import styles from './SalesForecastingInsightsGraph.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const SalesForecastGraph = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch('https://lolos-place-backend-1.onrender.com/sales-forecast', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        if (data && data.predicted_sales_current_year) {
          setSalesData(data.predicted_sales_current_year);
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

  const salesValues = salesData.map((item) => item.predicted_sales);
  const minSales = Math.min(...salesValues);
  const maxSales = Math.max(...salesValues);

  // Adjusting the y-axis range dynamically
  const rangePadding = 1000; // Padding for the range
  const yAxisMin = Math.floor((minSales - rangePadding) / 500) * 500; // Round down to the nearest 500
  const yAxisMax = Math.ceil((maxSales + rangePadding) / 500) * 500; // Round up to the nearest 500
  const yAxisStep = (yAxisMax - yAxisMin) <= 5000 ? 500 : 1000; // Adjust step size based on range

  const data = {
    labels: monthNames,
    datasets: [
      {
        label: 'Predicted Sales (₱)',
        data: salesValues,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            return null;
          }

          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(75, 192, 192, 0.2)');
          gradient.addColorStop(1, 'rgba(75, 192, 192, 0.5)');

          return gradient;
        },
        fill: true,
        borderWidth: 2,
        tension: 0.3,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
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
        labels: {
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `Sales: ₱${context.raw.toLocaleString()}`,
        },
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 16 },
        bodyFont: { size: 14 },
        cornerRadius: 6,
      },
      title: {
        display: true,
        text: 'Predicted Sales for the Current Year (₱)',
        font: {
          size: 18,
        },
        color: 'rgba(0, 0, 0, 0.8)',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
          font: {
            size: 14,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Sales (₱)',
          font: {
            size: 14,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        beginAtZero: false,
        min: yAxisMin,
        max: yAxisMax,
        ticks: {
          stepSize: yAxisStep,
          callback: (value) => `₱${value.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className={styles.section}>
      <h2>Sales Forecast</h2>
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
