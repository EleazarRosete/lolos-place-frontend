import React from 'react';
import styles from './Order.module.css';

function Order({ id, name, price, stock, order, total, onAddToOrder, onRemove, index }) {
    const handleModifyQuantity = (newQuantity) => {
        if (newQuantity > 0 && newQuantity <= stock) {
            onAddToOrder(id, name, price, stock, newQuantity);
        }
    };

    return (
        <div className={styles.orderItem}>
            <div className={styles.orderItemDetails}>
                <div className={styles.productDetails1}>
                    <h4>{name}</h4>
                    <p>Price: ₱{price}</p>
                </div>
                
                <div className={styles.orderItemActions}>
                    <div className={styles.quantityControl}>
                        <button
                            className={styles.quantityButton}
                            onClick={() => handleModifyQuantity(order - 1)}
                            disabled={order <= 1}
                        >
                            -
                        </button>
                        <span className={styles.orderItemQuantity}>{order}</span>
                        <button
                            className={styles.quantityButton}
                            onClick={() => handleModifyQuantity(order + 1)}
                            disabled={order >= stock}
                        >
                            +
                        </button>
                    </div>
                    <button onClick={() => onRemove(index)} className={styles.removeItemBtn}>
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Order;
