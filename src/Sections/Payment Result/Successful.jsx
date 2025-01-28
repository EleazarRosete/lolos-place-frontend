import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Successful.module.css";

function Successful(order_id) {
    const navigate = useNavigate();
    const [hasError, setHasError] = useState(false);
    const [hasRun, setHasRun] = useState(false);

    const fetchTempDataAndAddOrder = async () => {

        console.log("ORDER ID FROM LABAS", order_id);


        try {
            const response = await fetch("https://lolos-place-backend.onrender.com/order/get-temp-data");
            if (!response.ok) {
                throw new Error(`Failed to fetch temp data. Status: ${response.status}`);
            }
            const data = await response.json();
            const matchingPurchasesId = data
                .flatMap(item => item.paidOrder.filter(order => order.orderID === order_id))
                .map(order => order.purchases_id);

            if (matchingPurchasesId.length === 0) {
                throw new Error("No matching order found for the given order ID");
            }

            const purchaseId = matchingPurchasesId[0]; // Use the first match (if there's only one match)

            const firstData = data.find(item => item.paidOrder.some(order => order.purchases_id === purchaseId));
            
            if (firstData && firstData.paidorder && firstData.order && firstData.salesdata) {
                const paidOrderData = JSON.parse(firstData.paidorder[0]);
                const salesData = JSON.parse(firstData.salesdata[0]);
                let orders = JSON.parse(firstData.order[0]);

                if (!Array.isArray(orders)) {
                    orders = [orders];
                }

                // Update total amount with tax
                paidOrderData.total_amount = paidOrderData.items.reduce((total, item) => {
                    const price = parseFloat(item.price) || 0;
                    const priceWithTax = price + price * 0.1; // Add 10% tax
                    return total + priceWithTax * item.quantity; // Tax-inclusive total
                }, 0);

                const updatedPaidOrder = { ...paidOrderData, total_amount: paidOrderData.total_amount };

                // Add order
                const paidorderResponse = await fetch("https://lolos-place-backend.onrender.com/order/add-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedPaidOrder),
                });

                if (!paidorderResponse.ok) {
                    const errorData = await paidorderResponse.json();
                    console.error("Error response from adding order:", errorData);
                    throw new Error(`Error adding order data: ${errorData.message}`);
                }
                console.log("ORDER ADDED");

                const productResponse = await fetch("https://lolos-place-backend.onrender.com/menu/get-product");
                const jsonData = await productResponse.json();

                // Add sales and update stocks in parallel
                const salesPromises = paidOrderData.items.map(async (orderedItem) => {
                    const product = jsonData.find(p => p.menu_id === orderedItem.menu_id);

                    if (product) {
                        const price = parseFloat(product.price) || 0;

                        const updatedSalesData = {
                            ...salesData,
                            amount: parseFloat((orderedItem.quantity * price).toFixed(2)),
                            service_charge: parseFloat((price * 0.1).toFixed(2)),
                            gross_sales: parseFloat(((price + price * 0.1) * orderedItem.quantity).toFixed(2)),
                            product_name: product.name,
                            category: product.category,
                            quantity_sold: orderedItem.quantity,
                            price_per_unit: parseFloat(price.toFixed(2)),
                            mode_of_payment: "GCash",
                            order_type: paidOrderData.order_type,
                        };

                        const salesResponse = await fetch("https://lolos-place-backend.onrender.com/sales/add-sales", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(updatedSalesData),
                        });

                        if (!salesResponse.ok) {
                            const errorData = await salesResponse.json();
                            console.error("Error response from adding sales:", errorData);
                            throw new Error(`Error adding sales data: ${errorData.message}`);
                        }

                        console.log("SALES ADDED", updatedSalesData);
                    }
                });

                const stockUpdatePromises = paidOrderData.items.map(async (orderedItem) => {
                    const response = await fetch(`https://lolos-place-backend.onrender.com/menu/update-product-stock/${orderedItem.menu_id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ quantity: orderedItem.quantity }),
                    });

                    if (!response.ok) {
                        throw new Error(`Error updating stock for product ${orderedItem.menu_id}: ${response.statusText}`);
                    }
                    console.log("UPDATED PRODUCT STOCKS");
                });

                // Execute sales and stock updates concurrently
                await Promise.allSettled([...salesPromises, ...stockUpdatePromises]);

                const deleteResponse = await fetch(`https://lolos-place-backend.onrender.com/order/delete-temp-data/${purchaseId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                });

                const contentType = deleteResponse.headers.get("Content-Type");
                if (contentType && contentType.includes("application/json")) {
                    const deleteResult = await deleteResponse.json();
                    console.log("Temp data deleted successfully:", deleteResult);
                } else {
                    const deleteText = await deleteResponse.text();
                    console.log("Temp data deleted successfully:", deleteText);
                }




                // Navigate after a slight delay to ensure the page reloads first
                navigate("/admin/pos", { replace: true });
            }
        } catch (error) {
            console.error("Error during data fetching and adding order:", error.message);
            setHasError(true);
        }
    };

    const handleButtonClick = () => {
        if (!hasRun) {
            fetchTempDataAndAddOrder();
            setHasRun(true);
        }
    };

    return (
        <section className={styles.modalPOS}>
            <div className={styles.orderReceipt}>
                <h1>Successful!</h1>
                <button onClick={handleButtonClick} className={styles.handleCloseModal1}>CLOSE</button>
            </div>
        </section>
    );
}

export default Successful;
