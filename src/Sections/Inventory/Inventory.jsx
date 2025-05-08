import React, { useState, useEffect } from 'react';
import Item from './Items/Items.jsx';
import AddItemModal from './AddItemModal/AddItemModal.jsx';
import styles from './Inventory.module.css';

function Inventory() {
    const [product, setProduct] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showConfirmRemove, setShowConfirmRemove] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [mainCategories, setMainCategories] = useState([]);

    const [sortByQuantityAsc, setSortByQuantityAsc] = useState(true);
    const [sortByNameAsc, setSortByNameAsc] = useState(true);      

    const getProduct = async () => {
        try {
            const response = await fetch("https://lolos-place-backend.onrender.com/menu/get-product", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const jsonData = await response.json();
            console.log("Fetched products:", jsonData);

            const sortedData = jsonData.sort((a, b) => a.name.localeCompare(b.name));
            setProduct(sortedData);
            setFilteredItems(sortedData);
            extractCategories(sortedData);
        } catch (err) {
            console.error('Error fetching products:', err.message);
        }
    };

        useEffect(() => {
        getProduct();
    }, []);
    
    const extractCategories = (product) => {
        const uniqueCategories = [...new Set(product.map(item => item.main_category))];
        setMainCategories(uniqueCategories);
    };


    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);
        setSelectedSubCategory(''); // reset sub-category when category changes
        const filteredMainCategories = product.filter(product => product.main_category === category);
        setCategories([...new Set(filteredMainCategories.map(item => item.category))]);
        console.log("KEFKE", categories);

    };

    // Handle sub-category change
    const handleSubCategoryChange = (e) => {
        setSelectedSubCategory(e.target.value);
    };



    useEffect(() => {
        const filtered = product.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredItems(filtered);
    }, [searchTerm, product]);

    useEffect(() => {
        let filtered = product;
    
        // Filter by main category
        if (selectedCategory !== "All") {
            filtered = filtered.filter(item => item.main_category === selectedCategory);
        }
    
        // Filter by sub-category only if a valid sub-category is selected
        if (selectedSubCategory && selectedSubCategory !== "All") {
            filtered = filtered.filter(item => item.category === selectedSubCategory);
        }
    
        // Set the filtered results
        setFilteredItems(filtered);
    }, [selectedCategory, selectedSubCategory, product]);
    
    

    const handleAddItem = (newItem) => {
        const newItemsList = [...product, { menu_id: Date.now(), ...newItem }];
        console.log("Added new item:", newItem);
        setProduct(newItemsList);
        setFilteredItems(newItemsList);
        extractCategories(newItemsList);
        setIsModalOpen(false);
    };

    const handleRemoveItem = async (id) => {
        try {
            await fetch(`https://lolos-place-backend.onrender.com/menu/delete-product/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            const updatedItems = product.filter(item => item.menu_id !== id);
            console.log("Removed item with ID:", id);
            setProduct(updatedItems);
            setFilteredItems(updatedItems);
            extractCategories(updatedItems);
            setShowConfirmRemove(false);
            setItemToRemove(null);
        } catch (err) {
            console.error('Error removing item:', err.message);
        }
    };

    const handleEditItem = (id) => {

        const itemToEdit = product.find(item => item.menu_id === id);
        setEditingItem(itemToEdit);
        setIsModalOpen(true);
    };

    const confirmRemoveItem = (id) => {
        setItemToRemove(id);
        setShowConfirmRemove(true);
    };

    const handleCloseConfirmModal = () => {
        setShowConfirmRemove(false);
        setItemToRemove(null);
    };

    const handleConfirmRemoval = () => {
        handleRemoveItem(itemToRemove);
    };

    const handleSortByName = () => {
        const sortedItems = [...filteredItems].sort((a, b) => 
            sortByNameAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        );
        setFilteredItems(sortedItems);
        setSortByNameAsc(!sortByNameAsc);
    };

    const handleSortByQuantity = () => {
        const sortedItems = [...filteredItems].sort((a, b) => 
            sortByQuantityAsc ? a.stocks - b.stocks : b.stocks - a.stocks
        );
        setFilteredItems(sortedItems);
        setSortByQuantityAsc(!sortByQuantityAsc);
    };

    return (
        <section className={styles.inventorySection}>
            <div className={styles.inventoryContainer}>
                <h2 className={styles.InventoryH2}>Inventory Management</h2>
                <div className={styles.actions}>
                    <div className={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="Search by name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                            aria-label="Search items"
                        />
                    </div>
                    <div className={styles.topButtons}>
                        <button className={styles.inventoryButtons} onClick={handleSortByName}>Sort by Name</button>
                        <button className={styles.inventoryButtons} onClick={handleSortByQuantity}>Sort by Quantity</button>
                        <select
                className={styles.InventoryCategory}
                value={selectedCategory}
                onChange={handleCategoryChange}
            >
                <option value="All">All</option>
                {mainCategories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                ))}
            </select>

            {selectedCategory !== 'All' && (
                <select
                    className={styles.InventoryCategory}
                    value={selectedSubCategory}
                    onChange={handleSubCategoryChange}
                >
                    <option value="">All</option>
                    {categories.map((subCategory, index) => (
                        <option key={index} value={subCategory}>{subCategory}</option>
                    ))}
                </select>
            )}
                        <button className={styles.inventoryButtons} onClick={() => setIsModalOpen(true)}>Add Item</button>
                    </div>
                </div>

                <div className={styles.itemList}>
                    <table className={styles.itemTable}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length > 0 ? (
                                filteredItems.map((p) => (
                                    <Item
                                        key={p.menu_id}
                                        item={p}
                                        onEdit={() => handleEditItem(p.menu_id)}
                                        onRemove={() => confirmRemoveItem(p.menu_id)}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className={styles.emptyRow}>No items found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {isModalOpen && (
                    <AddItemModal
                        item={editingItem}
                        onAddItem={handleAddItem}
                        onUpdateItem={(updatedItem) => {
                            const updatedItems = product.map(item => 
                                (item.menu_id === updatedItem.menu_id ? updatedItem : item));
                            setProduct(updatedItems);
                            setFilteredItems(updatedItems);
                            extractCategories(updatedItems);
                            setEditingItem(null);
                            setIsModalOpen(false);
                        }}
                        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
                    />
                )}

                {showConfirmRemove && itemToRemove !== null && (
                    <div className={styles.remove}>
                        <div className={styles.removeContent}>
                            <p className={styles.text1}>Are you sure you want to remove this item?</p>
                            <div className={styles.buttonGroup}>
                            <button className={styles.confirmButton} onClick={handleCloseConfirmModal}>
                                    Cancel
                                </button>
                                <button className={styles.confirmButton} onClick={handleConfirmRemoval}>
                                    Yes, Remove Item
                                </button>
   
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Inventory;
