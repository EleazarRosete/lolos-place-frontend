import React, { useState, useEffect } from 'react';
import styles from './AddItemModal.module.css';

function AddItemModal({ item, onAddItem, onUpdateItem, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        items: [''],
        img: '',
        stocks: '',
    });

    useEffect(() => {
        if (item) {
            setFormData({
                ...item,
                items: item.items || [''], // Ensure items is always an array
            });
        } else {
            resetFormData();
        }
    }, [item]);

    const resetFormData = () => {
        setFormData({
            name: '',
            description: '',
            category: '',
            price: '',
            items: [''],
            img: '',
            stocks: '',
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleItemChange = (index, event) => {
        const newItems = [...formData.items];
        newItems[index] = event.target.value;
        setFormData({ ...formData, items: newItems });
    };

    const addInput = (e) => {
        e.preventDefault();
        setFormData({ ...formData, items: [...formData.items, ''] });
    };

    const removeInput = (index, e) => {
        e.preventDefault();
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);

            try {
                const response = await fetch('http://localhost:5000/upload', {
                    method: 'POST',
                    body: uploadFormData,
                });

                if (!response.ok) {
                    throw new Error('File upload failed');
                }

                const data = await response.json();
                setFormData((prevData) => ({ ...prevData, img: data.filePath }));
            } catch (err) {
                console.error('Error uploading file:', err.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Filter out blank items
        const filteredItems = formData.items.filter(item => item.trim() !== '');

        const updatedFormData = { ...formData, items: filteredItems };

        try {
            if (item) {
                await handleUpdateItem(updatedFormData);
                onUpdateItem(updatedFormData);
            } else {
                await handleAddItem(updatedFormData);
                onAddItem(updatedFormData);
            }
            onClose();
        } catch (err) {
            console.error('Error submitting form:', err.message);
        }
    };

    const handleUpdateItem = async (updatedItem) => {
        try {
            const response = await fetch(`http://localhost:5000/menu/edit-product/${updatedItem.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedItem),
            });

            if (!response.ok) {
                throw new Error('Failed to update item');
            }
        } catch (err) {
            console.error('Error updating item:', err.message);
        }
    };

    const handleAddItem = async (newItem) => {
        try {
            const response = await fetch('http://localhost:5000/menu/add-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newItem),
            });

            if (!response.ok) {
                throw new Error(`Failed to add item: ${response.statusText}`);
            }

            const addedProduct = await response.json();
            return addedProduct;
        } catch (err) {
            console.error('Error adding item:', err.message);
        }
    };

    return (
        <div className={styles.modalInventory}>
            <div className={styles.modal}>
                <div className={styles.modalContent}>
                    <h2 className={styles.modalHeader}>{item ? 'Edit Item' : 'Add Item'}</h2>
                    <form onSubmit={handleSubmit} className={styles.modalForm}>
                        <label>Product Name:</label>
                        <input
                            type="text"
                            name="name"
                            className={styles.modalInput}
                            placeholder="Product Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <label>Category:</label>
                        <input
                            type="text"
                            name="category"
                            className={styles.modalInput}
                            placeholder="Category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        />
                        <label>Price:</label>
                        <input
                            type="number"
                            name="price"
                            className={styles.modalInput}
                            placeholder="Price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                        <label>Insert Image:</label>
                        <input
                            type="file"
                            name="img"
                            className={styles.modalInput}
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
                        <label>Description:</label>
                        <textarea
                            name="description"
                            className={styles.modalInput}
                            placeholder="Description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                        <label>Product Items (*If bundle):</label>
                        <div className={styles.itemsContainer}>
                            {formData.items.length > 0 ? (
                                formData.items.map((input, index) => (
                                    <div key={index} className={styles.itemRow}>
                                        <input
                                            type="text"
                                            className={styles.modalInput}
                                            value={input}
                                            onChange={(e) => handleItemChange(index, e)}
                                        />
                                        <button onClick={(e) => removeInput(index, e)} className={styles.buttonCancel}>
                                            Remove
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p>No items available</p>
                            )}
                            <button onClick={addInput} className={styles.buttonSubmit}>
                                Add Input
                            </button>
                        </div>

                        <label>Stocks:</label>
                        <input
                            type="number"
                            name="stocks"
                            className={styles.modalInput}
                            placeholder="Stocks"
                            value={formData.stocks}
                            onChange={handleChange}
                            required
                        />
                        <div className={styles.buttonGroup}>
                            <button type="submit" className={styles.buttonSubmit}>
                                {item ? 'Update Product' : 'Add Product'}
                            </button>
                            <button className={styles.buttonCancel} onClick={onClose}>
                                Close
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddItemModal;
