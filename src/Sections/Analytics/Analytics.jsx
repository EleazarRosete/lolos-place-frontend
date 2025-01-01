import React, { useState } from "react";
import styles from "./Analytics.module.css";
import CustomerReviewsGraph from "./Graphs/Customer Reviews/CustomerReviewsGraph.jsx";
import CustomerPeakHoursGraph from "./Graphs/Customer Peak Hours/CustomerPeakHoursGraph.jsx";
import SalesForecastingGraph from "./Graphs/Sales Forecast/SalesForecastingGraph.jsx";
import HighestProductDemandGraph from "./Graphs/Product Demand/HighestProductDemandGraph.jsx";

function Analytics() {
    // Set the default graph to "highestProductDemand"
    const [selectedGraph, setSelectedGraph] = useState("highestProductDemand");

    const handleGraphChange = (graphName) => {
        setSelectedGraph(graphName);
    };

    return (
        <section className={styles.section}>
            <h2>Analytics</h2>
            <div className={styles.buttonContainerWrapper}>
                <button
                    className={styles.analyticsButton}
                    onClick={() => handleGraphChange("highestProductDemand")}
                >
                    Product Demand
                </button>
                <button
                    className={styles.analyticsButton}
                    onClick={() => handleGraphChange("customerPeakHours")}
                >
                    Customer Peak Hours
                </button>
                <button
                    className={styles.analyticsButton}
                    onClick={() => handleGraphChange("salesForecasting")}
                >
                    Sales Forecasting
                </button>
                <button
                    className={styles.analyticsButton}
                    onClick={() => handleGraphChange("customerReviews")}
                >
                    Customer Reviews
                </button>
            </div>
            <div className={styles.graphWrapper}>
                {selectedGraph === "customerReviews" && <CustomerReviewsGraph />}
                {selectedGraph === "customerPeakHours" && <CustomerPeakHoursGraph />}
                {selectedGraph === "salesForecasting" && <SalesForecastingGraph />}
                {selectedGraph === "highestProductDemand" && <HighestProductDemandGraph />}
            </div>
        </section>
    );
}

export default Analytics;
