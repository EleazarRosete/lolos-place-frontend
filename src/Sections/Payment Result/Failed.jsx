import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Failed.module.css";

function Failed() {
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDataAndDelete = async () => {
            try {
                // Fetch the temp data
                const response = await fetch("http://localhost:5000/order/get-temp-data");
                if (!response.ok) {
                    throw new Error(`Failed to fetch temp data. Status: ${response.status}`);
                }
                const data = await response.json();
                console.log(data.purchases_id);

                // Check if data exists and has the needed property
                if (data && data.length > 0) {
                    // Iterate through the data array
                    for (let i = 0; i < data.length; i++) {
                        const deleteResponse = await fetch(`http://localhost:5000/order/delete-temp-data/${data[i].purchases_id}`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                        });

                        if (!deleteResponse.ok) {
                            throw new Error(`Failed to delete temp data. Status: ${deleteResponse.status}`);
                        }
                    }
                } else {
                    throw new Error('No valid purchases_id found in temp data');
                }

                // Navigate after 1 second
                const timer = setTimeout(() => {
                    navigate("/admin/pos");
                }, 1000);

                return () => clearTimeout(timer); // Cleanup the timer on unmount
            } catch (error) {
                console.error(error);
            }
        };

        fetchDataAndDelete();
    }, [navigate]);

    return (
        <section className={styles.modalPOS}>
            <div className={styles.orderReceipt}>
                <h1>Failed!</h1>
            </div>
        </section>
    );
}

export default Failed;
