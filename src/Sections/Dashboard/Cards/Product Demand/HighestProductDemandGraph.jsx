import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Label } from "recharts";
import styles from './ProductDemandGraph.module.css';

const HighestSellingProducts = () => {
    const today = new Date();
    
    const [startDate, setStartDate] = useState(`${today.getFullYear()}-01-01`); // Start of this year
    const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]); // Today's date
    const [salesData, setSalesData] = useState([]);
    const [categories, setCategories] = useState(["All"]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(false);

    // Fetch sales data based on selected date range
    const fetchSalesData = async () => {
        if (!startDate || !endDate) return;
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:10000/graphs/sales-summary?start_date=${startDate}&end_date=${endDate}`
            );
            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                setSalesData(data);

                // Extract unique categories dynamically & add "All"
                const uniqueCategories = ["All", ...new Set(data.map(item => item.category))];
                setCategories(uniqueCategories);
            } else {
                setSalesData([]);
                setCategories(["All"]);
            }

            setSelectedCategory("All");
        } catch (error) {
            console.error("Error fetching sales data:", error);
            setSalesData([]);
            setCategories(["All"]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSalesData(); // Fetch on mount with default dates
    }, []);

    // Filter data based on selected category (show all if "All" is selected)
    const filteredData = selectedCategory === "All" ? salesData : salesData.filter(item => item.category === selectedCategory);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Sales Data Visualization</h2>

            {/* Date Selectors */}
            <div className="mb-4">
                <label className="mr-2">Start Date:</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-1" />
                
                <label className="ml-4 mr-2">End Date:</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-1" />
                
                <button onClick={fetchSalesData} className="ml-4 px-4 py-1 bg-blue-500 text-white rounded">
                    {loading ? "Loading..." : "Fetch Data"}
                </button>
            </div>

            {/* Dynamic Category Buttons */}
            <div className="mb-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-1 rounded ${
                            selectedCategory === category ? "bg-blue-700 text-white" : "bg-gray-200"
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={400}>
                {filteredData.length > 0 ? (
                    <BarChart data={filteredData}>
                        {/* X-Axis (Bottom) - Menu Item */}
                        <XAxis dataKey="product_name">
                            <Label value="Menu Item" offset={-5} position="insideBottom" />
                        </XAxis>

                        {/* Y-Axis (Left) - Quantity Sold */}
                        <YAxis>
                            <Label value="Quantity Sold" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                        </YAxis>

                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total_quantity_sold" fill="#8884d8" />
                    </BarChart>
                ) : (
                    <p className="text-center text-gray-500">No data available</p>
                )}
            </ResponsiveContainer>
        </div>
    );
};

export default HighestSellingProducts;
