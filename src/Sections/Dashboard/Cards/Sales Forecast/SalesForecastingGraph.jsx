import React, { useState, useEffect } from "react";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

const monthNames = {
  1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June",
  7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"
};

// Function to format numbers with commas
const formatNumber = (num) => new Intl.NumberFormat().format(num);

const SalesForecastGraph = () => {
  const [salesData, setSalesData] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const { data } = await axios.get("http://localhost:10000/graphs/transactions");
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
            ? "http://localhost:10000/graphs/predict-sales"
            : "http://localhost:10000/graphs/transactions";

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

  return (
    <div style={{ width: "100%", height: 400, padding: 20 }}>
      <select
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
      </select>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={salesData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" label={{ value: "Months of the Year", position: "insideBottom", offset: -5 }} />
          <YAxis 
            tickFormatter={formatNumber} 
            label={{ value: "Total Sales", angle: -90, position: "insideLeft" }} 
          />
          <Tooltip formatter={(value) => formatNumber(value)} />
          <Legend />
          <Area type="monotone" dataKey="total_sales" stroke="#FF5733" fill="#FF5733" fillOpacity={0.3} strokeWidth={3} dot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesForecastGraph;
