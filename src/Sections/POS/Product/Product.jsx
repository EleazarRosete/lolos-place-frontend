import React, { useState, useEffect } from 'react';
import styles from './Product.module.css';

function Product({ menu_id, name, price, stock, onAddToOrder, order, onRemove, orders}) {   
    const [products, setProducts] = useState([]);
    const [orderQuantity, setOrderQuantity] = useState(1);

    // Fetch products function
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

    // Fetch products on component mount
    useEffect(() => {
        getProducts(); 
    }, []); // Removed dependency on `products.stocks` to avoid unnecessary re-renders

    // Handle Decrease (- button)
    const handleModifyQuantityAdd = async (menu_id) => {
        const quantity = 1;

        // Check if the item exists in the order
        const existingItem = order.find(item => item.menu_id === menu_id);

        if (existingItem && existingItem.quantity > 1) {
            onAddToOrder(menu_id, name, price, stock, existingItem.quantity - quantity);
            setOrderQuantity(existingItem.quantity - quantity);
        } else {
            setOrderQuantity(1);
            onAddToOrder(menu_id, name, price, stock, 1);
        }

        try {
            const response = await fetch(`http://localhost:10000/menu/add-product-stock-by-one/${menu_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            // Update stock locally
            setProducts(prevProducts =>
                prevProducts.map(product =>
                    product.menu_id === menu_id ? { ...product, stocks: product.stocks + quantity } : product
                )
            );
        } catch (err) {
            console.error("Error updating product stock:", err.message);
        }
    };

    // Handle Increase (+ button)
    const handleAddToOrder = async () => {
        const quantity = 1;
        const existingItem = order.find(item => item.menu_id === menu_id);

        if (existingItem) {
            setOrderQuantity(existingItem.quantity + quantity);
            onAddToOrder(menu_id, name, price, stock, existingItem.quantity + quantity);
        } else {
            onAddToOrder(menu_id, name, price, stock, quantity);
        }

        try {
            const response = await fetch(`http://localhost:10000/menu/minus-product-stock-by-one/${menu_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) throw new Error(`Error updating stock: ${response.statusText}`);

            // Update stock locally
            setProducts(prevProducts =>
                prevProducts.map(product =>
                    product.menu_id === menu_id ? { ...product, stocks: product.stocks - quantity } : product
                )
            );
        } catch (error) {
            console.error("Failed to update stock:", error);
        }
    };

    return (
        <div className={styles.productCard}>
            <div className={styles.productDetails}>
                <h3 className={styles.productText1}>{name}</h3>
                <p className={styles.productText2}>₱{price}</p>
                <p className={styles.productText2}>
                    Stock: {products.find(product => product.menu_id === menu_id)?.stocks ?? stock}
                </p>
                <div className={styles.posButtonAddtoOrder}>
                <button onClick={handleAddToOrder} className={styles.addToOrderBtn1}>
                   +
                </button>
                <button
    className={styles.quantityButton}
    onClick={() => {
        if (orderQuantity === 1) {
            handleModifyQuantityAdd(menu_id);
            onRemove(menu_id); // Remove item if quantity goes to 0
        } else {
            handleModifyQuantityAdd(menu_id); // Otherwise, decrease normally
        }
    }}
    disabled={!order.some(item => item.menu_id === menu_id) || orderQuantity === 0} 
>
    -
</button>

                </div>



            </div>
        </div>
    );
}

export default Product;
