import React from 'react';
import styles from './Items.module.css';

function Item({ item, onRemove, onEdit }) {
    if (!item) {
        return (
            <tr>
                <td colSpan={8} className={styles.emptyRow}>No item data available</td>
            </tr>
        );
    }

    const handleConfirmRemove = () => {
        onRemove(item.product_id);
    };

    // Format items with commas
    const formattedItems = item.items && item.items.length > 0
    ? item.items
        .filter(itm => itm.trim() !== '' && itm !== '0') // Filter out blank or '0' items
        .map((itm, index, filteredItems) => (
            <span key={index}>
                {itm}
                {index < filteredItems.length - 1 && ', '}
            </span>
        ))
    : 'No items available';


    return (
        <tr className={styles.itemRow}>
            <td>{item.name || 'No name provided'}</td>
            <td>{item.category || 'No category'}</td>
            <td>{item.price ? parseFloat(item.price).toFixed(2) : 'No price'}</td>
            <td>
                {item.img ? (
                    <img
                        src={item.img}
                        alt={item.name || 'Item image'}
                        className={styles.itemImage}
                    />
                ) : (
                    'No image'
                )}
            </td>
            <td>{item.description || 'No description available'}</td>
            <td>{formattedItems || 'No items available'}</td>
            <td>{item.stocks || 'No stocks'}</td>
            <td>
                <div className={styles.actionGroup}>
                    <button
                        onClick={() => onEdit(item)}
                        className={styles.editButton}
                    >
                        Edit
                    </button>
                    <button
                        onClick={handleConfirmRemove}
                        className={styles.removeButton}
                    >
                        Remove
                    </button>
                </div>
            </td>
        </tr>
    );
}

export default Item;
