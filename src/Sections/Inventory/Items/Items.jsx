import React, { useState } from 'react';
import styles from './Items.module.css';

function Item({ item, onRemove, onEdit }) {
    const [showDetails, setShowDetails] = useState(false);

    if (!item) {
        return (
            <tr>
                <td colSpan={4} className={styles.emptyRow}>No item data available</td>
            </tr>
        );
    }

    const handleConfirmRemove = () => {
        onRemove(item.product_id);
    };

    const formattedItems = item.items && item.items.length > 0
        ? item.items
            .filter(itm => itm.trim() !== '' && itm !== '0')
            .map((itm, index, filteredItems) => (
                <span key={index}>
                    {itm}
                    {index < filteredItems.length - 1 && ', '}
                </span>
            ))
        : 'No items available';

    return (
        <>
            <tr className={styles.itemRow}>
                <td>{item.name || 'No name provided'}</td>
                <td>{item.price ? parseFloat(item.price).toFixed(2) : 'No price'}</td>
                <td>{item.stocks || 'No stocks'}</td>
                <td>
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className={styles.showDetailsButton}
                    >
                        {showDetails ? 'Hide Details' : 'Show Details'}
                    </button>
                </td>
            </tr>
            {showDetails && (
                <tr className={styles.detailsContainer}>
                    <td colSpan={4}>
                        <div>
                            <p><strong>Category:</strong> {item.category || 'No category'}</p>
                            <p><strong>Description:</strong> {item.description || 'No description available'}</p>
                            <p><strong>Items:</strong> {formattedItems}</p>
                            <p><strong>Image:</strong> {item.img ? <img src={item.img} alt={item.name || 'Item image'} className={styles.itemImage} /> : 'No image'}</p>
                            <div className={styles.actionGroup}>
                                <button onClick={() => onEdit(item)} className={styles.editButton}>Edit</button>
                                <button onClick={handleConfirmRemove} className={styles.removeButton}>Remove</button>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

export default Item;
