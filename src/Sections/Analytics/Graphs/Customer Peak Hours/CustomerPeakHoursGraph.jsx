import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import styles from "./CustomerPeakHoursGraph.module.css";

// Register necessary chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CustomerPeakHoursGraph = () => {
  const [peakHoursData, setPeakHoursData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGraphAndData = async () => {
      try {
        setLoading(true);

        // Fetch the peak hours data
        const dataResponse = await axios.get("http://localhost:5001/peak-hours-data");
        setPeakHoursData(dataResponse.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      }
    };

    fetchGraphAndData();
  }, []);

  const formatHour = (hour) => {
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour} ${period}`;
  };

  const generatePeakHourInsight = () => {
    if (!peakHoursData) {
      return "Loading insights...";
    }

    const highestOrders = peakHoursData.highest_orders;
    const weekOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return weekOrder
      .map((day) => {
        if (!highestOrders[day] || highestOrders[day].order_count === 0) {
          return `${day}: No orders`;
        }

        const { hour, order_count } = highestOrders[day];
        const time = formatHour(hour);
        return `${day}: Peak orders (${order_count}) at ${time}`;
      })
      .join("<br>"); // Use <br> for line breaks
  };

  // Prepare data for the line chart
  const chartData = () => {
    if (!peakHoursData) return {};

    const highestOrders = peakHoursData.highest_orders;
    const hours = [];
    const orders = [];

    const weekOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    weekOrder.forEach((day) => {
      if (highestOrders[day] && highestOrders[day].order_count > 0) {
        hours.push(`${day}: ${formatHour(highestOrders[day].hour)}`); // Include both day and hour
        orders.push(highestOrders[day].order_count);
      } else {
        hours.push(`${day}: No orders`);  // Label for no orders
        orders.push(0);    // No orders for that day
      }
    });

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
              <div className={styles.graphContainer}>
                <Line data={chartData()} options={{ responsive: true }} />
              </div>
              <div className={styles.feedbackGraph}>
                <strong>Insights:</strong>
                <p dangerouslySetInnerHTML={{ __html: generatePeakHourInsight() }} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerPeakHoursGraph;
