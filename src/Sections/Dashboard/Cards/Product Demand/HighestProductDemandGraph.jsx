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
    const [showModals, setShowModals] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(""); // Type of modal (top/least)




    

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











    const handleInsightClick = (type) => {
        setModalType(type);
        setShowModal(true);
      };
    
      const handleCloseModal = () => {
        setShowModal(false);
        setModalType("");
      };
    
      const groupedByCategory = filteredData.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {});
    
      const topProductsByCategory = Object.keys(groupedByCategory).map((category) => {
        const productsInCategory = groupedByCategory[category];
        const topProduct = productsInCategory.sort((a, b) => b.total_quantity_sold - a.total_quantity_sold)[0];
        return { category, topProduct };
      });
    
      const bottomProductsByCategory = Object.keys(groupedByCategory).map((category) => {
        const productsInCategory = groupedByCategory[category];
        const bottomProduct = productsInCategory.sort((a, b) => a.total_quantity_sold - b.total_quantity_sold)[0];
        return { category, bottomProduct };
      });
    
      const topProduct = filteredData.sort((a, b) => b.total_quantity_sold - a.total_quantity_sold)[0];
      const bottomProduct = filteredData[filteredData.length - 1];
      const totalQty = filteredData.reduce((acc, item) => acc + item.total_quantity_sold, 0);
      const avgQty = (totalQty / filteredData.length).toFixed(1);



















    return (
        <div className={styles.ProductDemandContainer}>
            <h2 className={styles.productDemandHeader}>Sales Data Visualization</h2>


            {/* Bar Chart */}
            <div onClick={() => setShowModals(true)} className={`${styles.productDemandGraphContainer} cursor-pointer`}>
        <ResponsiveContainer width="100%" height={400}>
          {filteredData.length > 0 ? (
            <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
              <XAxis dataKey="product_name">
                <Label value="Menu Item" offset={-5} position="insideBottom" />
              </XAxis>
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


<div className={styles.insightProductDemand}>
      {filteredData.length === 0 ? (
        <p className={styles.noInsights}>No insights available. Please adjust your filters to see product demand data.</p>
      ) : (
        <div>
          <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
            <li onClick={() => handleInsightClick("top-selling")}>
              <strong>Top-selling product:</strong> {topProduct.product_name} with {topProduct.total_quantity_sold} quantity sold.
            </li>
            <li onClick={() => handleInsightClick("least-selling")}>
              <strong>Least-selling product:</strong> {bottomProduct.product_name} with {bottomProduct.total_quantity_sold} quantity sold.
            </li>
          </ul>
        </div>
      )}

{showModal && (
  <div className={styles.modalOverlay} onClick={handleCloseModal}>
    <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
      <div className={styles.modalHeader}>
        <button onClick={handleCloseModal} className={styles.closeButton}>
          X
        </button>
        <h3 className={styles.modalTitle}>Top and Least Products per Category</h3>
      </div>
      <div className={styles.modalBody}>
        <div>
          <button
            className={styles.button}
            onClick={() => setModalType("top-selling")}
          >
            View Top Products per Category
          </button>
          <button
            className={styles.button}
            onClick={() => setModalType("least-selling")}
          >
            View Least Products per Category
          </button>
        </div>
        {modalType === "top-selling" && (
          <div className={styles.modalContent}>
            <h4 className={styles.modalSubTitle}>Top Products per Category</h4>
            {topProductsByCategory.map(({ category, topProduct }) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(topProduct.product_name)}
                className={styles.button}
              >
                {category} - {topProduct.product_name}
              </button>
            ))}
          </div>
        )}
        {modalType === "least-selling" && (
          <div className={styles.modalContent}>
            <h4 className={styles.modalSubTitle}>Least Products per Category</h4>
            {bottomProductsByCategory.map(({ category, bottomProduct }) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(bottomProduct.product_name)}
                className={styles.button}
              >
                {category} - {bottomProduct.product_name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}

    </div>




      {/* Modal */}
      {showModals && (
  <div className={styles.modalBackdrop}>
    <div className={styles.modalContent}>
      {/* Close Button */}
      <button onClick={() => setShowModals(false)} className={styles.closeButton}>
        &times;
      </button>

      {/* Modal Title */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: '600' }}>Filter Sales Data</h2>

      {/* Date Pickers */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '0.5rem' }}>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={styles.input}
        />

        <label style={{ marginLeft: '1rem', marginRight: '0.5rem' }}>End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={styles.input}
        />
      </div>

      {/* Category Buttons */}
      <div className={styles.categoryButtons}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`${styles.categoryButton} ${
              selectedCategory === category ? styles.activeCategory : ''
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Fetch Button */}
      <div style={{ marginTop: '1rem' }}>
        <button
          onClick={() => {
            fetchSalesData();
            setShowModals(false);
          }}
          className={styles.fetchButton}
        >
          {loading ? 'Loading...' : 'Fetch Data'}
        </button>
      </div>
    </div>
  </div>
)}

        </div>
    );
};

export default HighestSellingProducts;
