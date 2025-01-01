import React, { useState } from 'react';
import styles from './Product.module.css';

function Product({ menu_id, name, price, image, description, items, stock, onAddToOrder }) {   
    const [quantity, setQuantity] = useState("");  // Default quantity to an empty string
    const [remainingStock, setRemainingStock] = useState(stock);  // Manage local stock state

    const handleAddToOrder = () => {
        // Validate quantity before proceeding
        if (!quantity || quantity <= 0) {
            alert("Please enter a valid quantity!");
            return;
        }

        if (quantity <= remainingStock) {
            onAddToOrder(menu_id, name, price, remainingStock, quantity);
            // Reduce stock by quantity after adding to order
            const newStock = remainingStock - quantity;
            setRemainingStock(newStock);  // Update local stock
            setQuantity("");
        } else {
            alert("Not enough stock available!");
        }
    };

    return (
        <div className={styles.productCard}>
            <img src={image} alt={name} className={styles.productImage} />
            <div className={styles.productDetails}>
                <h3 className={styles.productText1}>{name}</h3>
                <p className={styles.productText1}>{description}</p>
                <p className={styles.productText1}>₱{price}</p>
                <p className={styles.productText1}>Stock: {remainingStock}</p>
                
                {items && items.length > 0 && (
                    <div className={styles.items}>
                        <h4 className={styles.productText2}>Items in this Bundle:</h4>
                        <ul>
                            {items.map((item, index) => (
                                <li key={index} className={styles.itemsList}>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="1"
                    max={remainingStock}
                    placeholder="Quantity"
                    className={styles.productQuantity}
                />
                <button onClick={handleAddToOrder} className={styles.addToOrderBtn1}>
                    Add to Order
                </button>
            </div>
        </div>
    );
}

export default Product;
