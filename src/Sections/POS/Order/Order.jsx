import React, { useState, useEffect } from 'react';
import styles from './Order.module.css';

function Order({ id, name, price, stock, order, total, onAddToOrder, onRemove, index, updateStock, updatedQuantityByOrder, isOrderClicked}) {
    const [products, setProducts] = useState([]);
    


    



    const handleModifyQuantityMinus = async (id) => {
        try {
            const response = await fetch(`http://localhost:10000/menu/minus-product-stock-by-one/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            setOrderQty(orderQuantity + 1);
            console.log(orderQuantity);
        } catch (err) {
            console.error("Error updating product stock:", err.message);
        }
    };

    

        useEffect(() => {
            const getProducts = async () => {
                try {
                    const response = await fetch("http://localhost:10000/menu/get-product", {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                    });
                    
                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
                    const jsonData = await response.json();
                    setProducts(jsonData.sort((a, b) => a.name.localeCompare(b.name))); 
                } catch (err) {
                    console.error('Error fetching products:', err.message);
                }
            };
            const product = products.find(p => p.menu_id === id);
        updateStock(product ? product.stocks : 0);
            getProducts();
        }, []); // Run only on mount



    return (
        <div className={styles.orderItem}>
            <div className={styles.orderItemDetails}>
                <div className={styles.productDetails1}>
                    <h4>{name}</h4>
                    <p>Price: ₱{price}</p>
                </div>
                
                <div className={styles.orderItemActions}>
                    <div className={styles.quantityControl}>
                
                        <span className={styles.orderItemQuantity}>{order}</span>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Order;
