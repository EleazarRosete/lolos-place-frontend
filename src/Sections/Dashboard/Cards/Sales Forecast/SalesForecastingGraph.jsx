import React, { useState, useEffect } from "react";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import styles from "./SalesForecastingInsightsGraph.module.css";

const monthNames = {
  1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June",
  7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"
};

// Function to format numbers with commas
const formatNumber = (num) => new Intl.NumberFormat().format(num);

const SalesForecastGraph = () => {
  const [salesData, setSalesData] = useState([]);
  const [years, setYears] = useState([]);
const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [prevYear, setPrevYear] = useState(new Date().getFullYear() - 1);

  const handleChartClick = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);


  useEffect(() => {
    const fetchYears = async () => {
      try {
        const { data } = await axios.get("https://lolos-place-backend.onrender.com/graphs/transactions");
        console.log("Fetched Years Data:", data);
        
        if (!Array.isArray(data)) throw new Error("Invalid response format");
        
        const uniqueYears = [...new Set(data.map((item) => parseInt(item.year)))];
        setYears(uniqueYears.sort((a, b) => a - b));
        setSelectedYear(uniqueYears[uniqueYears.length - 1]);
      } catch (error) {
        console.error("Error fetching years:", error);
      }
    };
    fetchYears();
  }, []);

  useEffect(() => {
    if (!selectedYear) return;
    const fetchSalesData = async () => {
      try {
        let url =
          selectedYear === "Predicted Sales"
            ? "https://lolos-place-backend.onrender.com/graphs/predict-sales"
            : "https://lolos-place-backend.onrender.com/graphs/transactions";

        const { data } = await axios.get(url);
        console.log("Fetched Sales Data:", data);

        let formattedData = [];

        if (selectedYear === "Predicted Sales") {
          if (!data.predicted_sales || typeof data.predicted_sales !== "object") {
            throw new Error("Invalid predicted sales response");
          }

          formattedData = Object.entries(data.predicted_sales).map(([key, value]) => ({
            month: monthNames[parseInt(key.split("-")[1])], // Convert 1-12 to "January-December"
            total_sales: Math.round(value) // Round sales to nearest integer
          }));
        } else {
          if (!Array.isArray(data)) throw new Error("Unexpected API response, expected an array.");

          formattedData = data
            .filter((item) => parseInt(item.year) === parseInt(selectedYear))
            .map(item => ({
              month: monthNames[parseInt(item.month)],
              total_sales: parseInt(item.total_sales)
            }));
        }

        setSalesData(formattedData);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };
    fetchSalesData();
  }, [selectedYear]);

  // Calculate dynamic Y-axis domain and ticks based on salesData
  const getYAxisConfig = () => {
    if (salesData.length === 0) return { domain: [0, 400000], ticks: [0, 100000, 200000, 300000, 400000] };

    const salesValues = salesData.map(item => item.total_sales);
    const minSales = Math.min(...salesValues);
    const maxSales = Math.max(...salesValues);

    // Calculate the range, and adjust it to make the graph more readable
    const domainMin = Math.floor(minSales / 50000) * 50000; // Round down to the nearest 50,000
    const domainMax = Math.ceil(maxSales / 50000) * 50000; // Round up to the nearest 50,000

    // Create ticks based on the domain range
    const ticks = [];
    for (let i = domainMin; i <= domainMax; i += 50000) {
      ticks.push(i);
    }

    return { domain: [domainMin, domainMax], ticks };
  };

  const { domain, ticks } = getYAxisConfig();

  return (
    <div style={{ width: "100%", height: "100%", padding: 0}}>
      <h1 className={styles.SalesForecastGraphHeader}>Sales Data & Sales Forecast</h1>

        {/* <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={{ marginBottom: 20, padding: 5 }}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
          <option value="Predicted Sales">Predicted Sales</option>
        </select> */}


<div className={styles.salesGraphContainer} onClick={handleChartClick}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={salesData} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month" 
              interval={0}
              minTickGap={5}
              allowDuplicatedCategory={false}
              label={{ value: "Months of the Year", position: "insideBottom", offset: -1, style:{ fontSize:'12px'} }} tick={{fontSize:10}}
            />
            <YAxis
            domain={[0, 'auto']}
              tickFormatter={formatNumber}
              label={{ value: "Total Sales", angle: -90, position: "insideLeft", offset: -5, style:{ fontSize:'12px'} }} tick={{fontSize:10}}

              ticks={ticks}
            />
            <Tooltip formatter={(value) => formatNumber(value)} />
            <Area
              type="monotone"
              dataKey="total_sales"
              stroke="#FF5733"
              fill="#FF5733"
              fillOpacity={0.5}
              strokeWidth={1}
              dot={{ r: 5 }}
            />
            <Legend />

          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.insightContainer}>
  {salesData.length > 0 ? (
    <>

      <h4 style={{margin:0}}>Key Insights for {selectedYear}:</h4>
      <ul style={{margin:0}} className={styles.insightList }>
        <li style={{margin:0}}>
          <strong>Highest Sales Month:</strong> {salesData.reduce((max, month) => month.total_sales > max.total_sales ? month : max).month}
        </li>
        <li>
          <strong>Lowest Sales Month:</strong> {salesData.reduce((min, month) => month.total_sales < min.total_sales ? month : min).month}
        </li>

      </ul>
    </>
  ) : (
    <p>No sales data available for the selected year. Please select a valid year to view insights.</p>
  )}
</div>


      {/* DIY Modal */}
      {showModal && (
  <div className={styles.modalBackdrop}>
    <div className={styles.modalContent}>
      <h3>Select Year</h3>
      <select
        value={selectedYear}
        onChange={(e) => {
          setSelectedYear(e.target.value);
          handleCloseModal();
        }}
        style={{ marginBottom: 20, padding: 5 }}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
        <option value="Predicted Sales">Predicted Sales</option>
      </select>
      <button onClick={handleCloseModal} style={{ padding: '5px 10px' }}>
        Close
      </button>
    </div>
  </div>
)}

     
    </div>
  );
};

export default SalesForecastGraph;
