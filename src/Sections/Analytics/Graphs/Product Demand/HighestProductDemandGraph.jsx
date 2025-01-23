import React, { useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import styles from './ProductDemandGraph.module.css';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const HighestSellingProducts = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProductData = async () => {
    if (!startDate || !endDate) {
      setError("Start date and end date are required");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get('http://localhost:10000/graphs/highest-selling-products', {
        params: { startDate, endDate }, // Send startDate and endDate as query parameters
      });
      setProductData(response.data); // Assuming the response contains product data
    } catch (err) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    const productNames = productData.map((product) => product.product_name);
    const quantitiesSold = productData.map((product) => product.quantity_sold);

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
          max={new Date().toISOString().split('T')[0]} // Limit to the current date
        />

        <label htmlFor="endDate">End Date:</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]} // Limit to the current date
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
                  text: `Product Demand from ${startDate} to ${endDate}`,
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
