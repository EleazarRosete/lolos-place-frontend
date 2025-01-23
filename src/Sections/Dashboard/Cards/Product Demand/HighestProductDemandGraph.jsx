import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import styles from './ProductDemandGraph.module.css';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const HighestSellingProducts = () => {
  const today = new Date().toISOString().split('T')[0];
  const startOfYear = new Date(
    Date.UTC(new Date().getFullYear(), 0, 1)
  ).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

  const [startDate, setStartDate] = useState(startOfYear);
  const [endDate, setEndDate] = useState(today);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProductData = async () => {
    if (!startDate || !endDate) {
      setError('Start date and end date are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get('https://lolos-place-backend.onrender.com/graphs/highest-selling-products', {
        params: { startDate, endDate },
      });
      setProductData(response.data);
    } catch (err) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  const getChartData = () => {
    // Sort products by quantity_sold in descending order and take the top 10
    const filteredData = productData
      .filter((product) => product.quantity_sold > 0)
      .sort((a, b) => b.quantity_sold - a.quantity_sold)
      .slice(0, 10);

    const productNames = filteredData.map((product) => product.product_name);
    const quantitiesSold = filteredData.map((product) => product.quantity_sold);

    return {
      labels: productNames,
      datasets: [
        {
          label: 'Quantity Sold',
          data: quantitiesSold,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className={styles.highestSellingProducts}>
      <h1>Highest Selling Products</h1>

      <div className={styles.dateInputs}>
        <label htmlFor="startDate">Start Date:</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          max={today}
        />

        <label htmlFor="endDate">End Date:</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          max={today}
        />

        <button onClick={fetchProductData} disabled={!startDate || !endDate}>
          Fetch Data
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {productData.length > 0 && (
        <div className={styles.productData}>
          <Bar
            data={getChartData()}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: `Top 10 Highest Selling Products from ${startDate} to ${endDate}`,
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default HighestSellingProducts;
