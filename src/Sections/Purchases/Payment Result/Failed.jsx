import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./Failed.module.css";

function Failed() {
  const navigate = useNavigate();
  const { orderId } = useParams(); // Get the orderId from the URL

  useEffect(() => {

        const timer = setTimeout(() => {
          navigate("/admin/orders");
        }, 1000);

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
