import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import styles from "./CustomerPeakHoursGraph.module.css";

// Register necessary chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CustomerPeakHoursGraph = () => {
  // Get today's day of the week
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = daysOfWeek[new Date().getDay()];

  const [peakHoursData, setPeakHoursData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(today); // Default to today's day

  useEffect(() => {
    const fetchGraphAndData = async () => {
      try {
        setLoading(true);

        // Fetch the peak hours data from the Node.js backend
        const dataResponse = await axios.get("https://lolos-place-backend.onrender.com/graphs/peak-hours-data", {
          params: { day: selectedDay }
        });

        setPeakHoursData(dataResponse.data.order_data); // Assuming the data is in 'order_data'

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      }
    };

    fetchGraphAndData();
  }, [selectedDay]); // Fetch data when the selected day changes

  const formatHour = (hour) => {
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour} ${period}`;
  };

  // Prepare data for the line chart
  const chartData = () => {
    if (!peakHoursData) return {}; // Early exit if no peakHoursData

    const hours = [];
    const orders = [];

    // Collect data from 10 AM to 9 PM (inclusive)
    for (let i = 10; i <= 21; i++) {
      hours.push(formatHour(i)); // Add the hour in AM/PM format (10 AM to 9 PM)
      orders.push(peakHoursData[i] || 0); // If no orders for that hour, set to 0
    }

    return {
      labels: hours,
      datasets: [
        {
          label: "Orders",
          data: orders,
          borderColor: "#4caf50",
          backgroundColor: "rgba(76, 175, 80, 0.2)",
          tension: 0.1,
          fill: true,
        },
      ],
    };
  };

  return (
    <div className={styles.section}>
      {loading ? (
        <p className={styles.loading}>Loading graph and insights...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <div className={styles.graphFeedbackContainer}>
          {peakHoursData && (
            <>
              <div className={styles.filterContainer}>
                <label htmlFor="daySelect">Select Day:</label>
                <select
                  id="daySelect"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className={styles.daySelect}
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.graphContainer}>
                <Line data={chartData()} options={{ responsive: true }} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerPeakHoursGraph;
