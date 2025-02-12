import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import styles from "./CustomerPeakHoursGraph.module.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CustomerPeakHoursGraph = () => {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = daysOfWeek[new Date().getDay()];
  
  // Set default date range to January 1 - January 31 of the current year
  const now = new Date();
  const currentYear = now.getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-01-31`);
  const [selectedDay, setSelectedDay] = useState(today);
  const [peakHoursData, setPeakHoursData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:10000/graphs/peak-hours-data", {
          params: { start_date: startDate, end_date: endDate, selected_day: selectedDay },
        });
        setPeakHoursData(response.data);
      } catch (err) {
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchGraphData();
  }, [startDate, endDate, selectedDay]);

  const formatHour = (hour) => {
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour} ${period}`;
  };

  const chartData = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 10); // 10 AM to 9 PM
    const labels = hours.map(formatHour);
    const categoryData = {};
    
    peakHoursData.forEach(({ hour, main_category, total_order_quantity }) => {
      if (!categoryData[main_category]) {
        categoryData[main_category] = new Array(hours.length).fill(0);
      }
      const index = hours.indexOf(hour);
      if (index !== -1) {
        categoryData[main_category][index] = parseInt(total_order_quantity, 10);
      }
    });
    
    const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9966FF", "#FF9F40"];
    const datasets = Object.keys(categoryData).map((category, i) => ({
      label: category,
      data: categoryData[category],
      borderColor: colors[i % colors.length],
      backgroundColor: colors[i % colors.length] + "33",
      tension: 0.3,
      fill: false,
    }));
    
    return { labels, datasets };
  };

  return (
    <div className={styles.section}>
      <h1>Customer Peak Hours</h1>
      <div className={styles.filters}>
        <label>Start Date:
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>End Date:
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <label>Select Day:
          <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading graph and insights...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <div className={styles.graphContainer}>
          <Line data={chartData()} options={{ responsive: true, plugins: { legend: { position: "bottom" } }, scales: { y: { title: { display: true, text: "Quantity Sold" } }, x: { title: { display: true, text: "Hours" } } } }} />
        </div>
      )}
    </div>
  );
};

export default CustomerPeakHoursGraph;
