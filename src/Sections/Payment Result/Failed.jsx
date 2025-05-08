import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Failed.module.css";

function Failed() {
  const navigate = useNavigate();

  useEffect(() => {
    const deleteTempData = async () => {
      try {
        const response = await fetch("https://lolos-place-backend.onrender.com/order/delete-temp-data", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to delete temp data. Status: ${response.status}`);
        }

        console.log("Temp data deleted successfully");

        // Navigate after 1 second
        const timer = setTimeout(() => {
          navigate("/cashier/pos");
        }, 1000);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error("Error deleting temp data:", error);
      }
    };

    deleteTempData();
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
