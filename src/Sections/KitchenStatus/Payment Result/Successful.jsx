import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Successful.module.css";

function Successful() {
    const navigate = useNavigate();

       
    const handleButtonClick = () => {
      navigate("/admin/orders", { replace: true });
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