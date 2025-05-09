import React, { useState, useEffect } from "react";
import styles from './InventoryCard.module.css';

function InventoryCard() { 
    const [product, setProduct] = useState([]);  // Renamed state to product
    const [showModal, setShowModal] = useState(false); // State for showing the modal

    const getProduct = async () => {
        try {
            const response = await fetch("https://lolos-place-backend.onrender.com/menu/get-low-stocks", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const jsonData = await response.json();
            setProduct(jsonData); // Update product state with fetched data
        } catch (err) {
            console.error('Error fetching products:', err.message);
        }
    };

    const stockLevel = () => {
        if (product.length > 0) {
            return `LOW STOCKS - ${product.length} Products`; // If there are low stock items
        }
        return "HIGH STOCKS"; // If there are no low stock items
    };

    const toggleModal = () => setShowModal(!showModal); // Toggle modal visibility

    useEffect(() => {
        getProduct();
    }, []); // Fetch products when component mounts

    return (
        <div className={styles.InventoryCard}>
            <h1 className={styles.InventoryCardHeaderTxt}>Stock Levels:</h1>
            <button 
                className={`${styles.stockIndicator} ${product.length === 0 ? styles.highStocks : styles.lowStocks}`}
                onClick={toggleModal} // Show modal on button click
            >
                {stockLevel()}
            </button>

            {/* Modal for displaying products with low stock */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button className={styles.closeModalButton} onClick={toggleModal}>X</button>
                        <h2 className={styles.inventoryCardDetailsHeader}>Low Stock Products</h2>
                        <ul className={styles.InventoryCardDetailsStock}>
                            {product.length > 0 ? (
                                product.map((item) => (
                                    <li key={item.menu_id}>
                                        {item.name} - {item.stocks} in stock
                                    </li>
                                ))
                            ) : (
                                <li className={styles.noLowStocks}>No low stock items available.</li>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InventoryCard;
