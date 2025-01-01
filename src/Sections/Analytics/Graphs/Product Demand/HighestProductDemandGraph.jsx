import React, { useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import styles from './ProductDemandGraph.module.css';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const HighestSellingProducts = () => {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [productData, setProductData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProductData = async () => {
    if (!year || !month) {
      setError("Year and month are required");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`http://localhost:5001/highest-selling-products?year=${year}&month=${month}`);
      setProductData(response.data);
    } catch (err) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    const months = Object.keys(productData);
    const productNames = [];
    const quantitiesSold = [];

    months.forEach((month) => {
      productData[month].forEach((product) => {
        productNames.push(product.product_name);
        quantitiesSold.push(product.quantity_sold);
      });
    });

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
      <h1>Highest Selling Products Per Month</h1>

      <div className={styles.yearInput}>
        <label htmlFor="year">Enter Year:</label>
        <input
          type="number"
          id="year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Enter Year (e.g., 2020)"
          min="2019"
          max={new Date().getFullYear()} // Limit to the current year
        />
        <label htmlFor="month">Enter Month:</label>
        <input
          type="number"
          id="month"
          value={month}
          onChange={(e) => setMonth(e.target.value.padStart(2, '0'))} // Ensure two-digit month format
          placeholder="Enter Month (01 to 12)"
          min="1"
          max="12"
        />
        <button onClick={fetchProductData} disabled={!year || !month}>Fetch Data</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {Object.keys(productData).length > 0 && (
        <div className={styles.productData}>
          <Bar data={getChartData()} options={{ responsive: true, plugins: { title: { display: true, text: `Product Demand for ${month}/${year}` } } }} />
        </div>
      )}
    </div>
  );
};

export default HighestSellingProducts;
