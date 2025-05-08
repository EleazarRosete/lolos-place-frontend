import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import styles from "./CustomerPeakHoursGraph.module.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CustomerPeakHoursGraph = () => {
  const [showModal, setShowModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };


  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = daysOfWeek[new Date().getDay()];
  
  // Set default date range to January 1 - January 31 of the current year
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentDate = now.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(currentDate); // ← now dynamic
  const [selectedDay, setSelectedDay] = useState(today);
  const [peakHoursData, setPeakHoursData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://lolos-place-backend.onrender.com/graphs/peak-hours-data", {
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


  const getInsight = () => {
    const data = chartData();
  
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };
  
    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);
  
    if (!data || !data.labels || data.datasets.length === 0) {
      return `No insights available for ${selectedDay}, between ${formattedStart} and ${formattedEnd}.`;
    }
  
    const insights = data.datasets
      .filter(dataset => dataset.data.some(value => value > 0))
      .map((dataset) => {
        const max = Math.max(...dataset.data);
        const min = Math.min(...dataset.data.filter(v => v > 0));
        const total = dataset.data.reduce((a, b) => a + b, 0);
        const avg = Math.round(total / dataset.data.filter(v => v > 0).length);
        const peakIndex = dataset.data.indexOf(max);
        const peakHour = data.labels[peakIndex];
  
        let trend = "";
        if (max > avg * 1.5) {
          trend = `A noticeable spike occurred around ${peakHour}`;
        } else {
          trend = `Activity was relatively stable, peaking slightly at ${peakHour}`;
        }
  
        return `${dataset.label}: ${trend} with ${max} orders (avg: ${avg})`;
      });
  
    if (insights.length === 0) {
      return `No significant customer activity detected on ${selectedDay}, between ${formattedStart} and ${formattedEnd}. Consider reviewing product visibility or marketing efforts during this period.`;
    }
  
    const suggestion = insights.length > 2
      ? "Diversify promotional strategies across categories during peak hours for better engagement."
      : "Focus your marketing efforts during the identified peak times for optimal results.";
  
    return `Analysis for every ${selectedDay} from ${formattedStart} to ${formattedEnd}:\n${insights.join("\n")}. ${suggestion}`;
  };
  

  return (
    <div className={styles.section}>
      <h1 className={styles.CustomerPeakHoursGraphHeader}>Customer Peak Hours</h1>
      {/* <button className={styles.filterBtn} onClick={() => setShowModal(true)}>
  Filter Options
</button> */}

      {/* <div className={styles.filters}>
        <label className={styles.filtersDate}>Start Date:
          <input className={styles.filtersDateInput} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label  className={styles.filtersDate}>End Date:
          <input className={styles.filtersDateInput} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <label  className={styles.filtersDay} >Select Day:
          <select className={styles.filtersDayInput} value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </label>
      </div> */}
{loading ? (
  <p className={styles.loading}>Loading graph and insights...</p>
) : error ? (
  <p className={styles.error}>{error}</p>
) : (
  <div className={styles.graphContainer} onClick={() => setShowModal(true)} style={{ cursor: "pointer" }}>
    <Line
      data={chartData()}
      width={1}
      height={0}
      options={{
        responsive: true,
        maintainAspectRatio:false,
        plugins: { legend: { position: "bottom" } },
        labels:{
          font:{
            size:5
          },
        },
        scales: {
          y: { title: { display: true, text: "Quantity Sold" } },
          x: { title: { display: true, text: "Hours" } },
        },
      }}
    />
  </div>
)}

  <div className={styles.peakHoursInsight}>
      <p 
        className={styles.insightss}
        onClick={handleModalOpen}
        style={{ cursor: 'pointer' }} // Optional: Change the cursor to a pointer on hover
      >
        {getInsight()}
      </p>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContentP}>
            <button className={styles.closeModalBtn} onClick={handleModalClose}>X</button>
            <div>{getInsight()}</div>
          </div>
        </div>
      )}
    </div>


{showModal && (
  <div className={styles.modalOverlay} onClick={(e) => e.target.classList.contains(styles.modalOverlay) && setShowModal(false)}>
    <div className={styles.modalContent}>
      <button className={styles.closeModalBtn} onClick={() => setShowModal(false)}>×</button>
      <h2>Filter Options</h2>
      <div className={styles.filters}>
        <label className={styles.filtersDate}>
          Start Date:
          <input
            className={styles.filtersDateInput}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className={styles.filtersDate}>
          End Date:
          <input
            className={styles.filtersDateInput}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <label className={styles.filtersDay}>
          Select Day:
          <select
            className={styles.filtersDayInput}
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  </div>
)}


    </div>
    
  );
};

export default CustomerPeakHoursGraph;
