import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from './BestProductCard.module.css';

function BestProductCard() {
    const today = new Date();
    today.setHours(today.getHours() + 8);  // Adjust the time to Manila timezone (UTC +8)
    const formattedDate = today.toISOString().split('T')[0];  // Get today's date in YYYY-MM-DD format after adjustment

    const [productSummary, setProductSummary] = useState({});
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(formattedDate);  // Set today's date as the default
    const [filteredOrders, setFilteredOrders] = useState([]); // State for storing filtered orders

    const getOrders = async () => {
        try {
            const response = await axios.get('http://localhost:5000/order/order-history');
            setFilteredOrders(response.data); // Store all orders initially
        } catch (err) {
            setError('Failed to fetch orders. Please try again later.');
        }
    };

    const filterOrdersByDate = (date) => {
        if (!date) {
            setError('Please select a date to filter by.');
            return;
        }

        const currentDate = new Date(date).toLocaleDateString('en-US');  // Convert selected date to local date format
        const filtered = filteredOrders.filter((order) => {
            const orderDate = new Date(order.date); // Convert the order date to a Date object
            const localDate = orderDate.toLocaleDateString('en-US'); // Convert it to local date format
            return localDate === currentDate;
        });

        // Summarize sold items for the filtered orders
        const summary = {};
        filtered.forEach((order) => {
            order.items.forEach((item) => {
                const productName = item.menu_name;
                const quantity = item.order_quantity;
                summary[productName] = (summary[productName] || 0) + quantity;
            });
        });

        setProductSummary(summary); // Update the product summary based on filtered orders
    };

    useEffect(() => {
        getOrders(); // Fetch orders when the component mounts
    }, []);

    useEffect(() => {
        filterOrdersByDate(selectedDate); // Automatically filter when selectedDate changes
    }, [selectedDate, filteredOrders]); // Depend on selectedDate and filteredOrders

    return (
        <section className={styles.section}>
            <h1>Sold Product Items</h1>
            
            {error && <p className={styles.error}>{error}</p>}
            
            <div className={styles.filterSection}>
            <label htmlFor="dateFilter">Select Date: </label>

                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}  // Update selected date
                    className={styles.dateInput}
                    max={new Date().toISOString().split('T')[0]} 
                />
            </div>
            
            {Object.keys(productSummary).length > 0 ? (
                <ul>
                    {/* Sort the products by quantity in descending order */}
                    {Object.entries(productSummary)
                        .sort((a, b) => b[1] - a[1]) // Sort by the second element (quantity)
                        .map(([productName, quantity]) => (
                            <li key={productName}>
                                <p>{productName} - {quantity} sold</p>
                            </li>
                    ))}
                </ul>
            ) : (
                <p>No products sold on this date.</p>
            )}
        </section>
    );
}

export default BestProductCard;
