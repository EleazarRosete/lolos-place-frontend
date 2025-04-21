import styles from './Dashboard.module.css';
import React, { useState } from 'react';
import FeedbackCard from './Cards/FeedbackCard/FeedbackCard';
import InventoryCard from './Cards/InventoryCard/InventoryCard.jsx';
import SalesTodayCard from './Cards/SalesTodayCard/SalesTodayCard.jsx';
import SoldProducts from './Cards/BestProductCard/BestProductCard.jsx';
import UpcomingReservation from './Cards/DeliveriesCard/DeliveriesCard.jsx';
import ReservationCard from './Cards/ReservationCard/ReservationCard.jsx';
import CustomerPeakHours from './Cards/Customer Peak Hours/CustomerPeakHoursGraph.jsx';
import CustomerReviews from './Cards/Customer Reviews/CustomerReviewsGraph.jsx';
import ProductDemand from './Cards/Product Demand/HighestProductDemandGraph.jsx';
import SalesForecast from './Cards/Sales Forecast/SalesForecastingGraph.jsx';

function Dashboard() { 
    const [activeGraph, setActiveGraph] = useState('productDemand');
    const [activeReservationTab, setActiveReservationTab] = useState('today'); // 'today', 'upcoming', or 'sold'


    const renderGraph = () => {
      switch (activeGraph) {
        case 'productDemand':
          return <ProductDemand />;
        case 'salesForecast':
          return <SalesForecast />;
        case 'customerReviews':
          return <CustomerReviews />;
        case 'peakHours':
        default:
          return <CustomerPeakHours />;
      }
    };

    return (
        <section className={styles.section}>
            <div className={styles.cardContainer}>
                <FeedbackCard/>
                <InventoryCard/>
                <SalesTodayCard/>
            </div>
            <div className={styles.analyticsContainer}>
      <div className={styles.graphNavButtons}>
        <button
          className={styles.graphButtons}
          onClick={() => setActiveGraph('productDemand')}
        >
          Product Demand
        </button>
        <button
          className={styles.graphButtons}
          onClick={() => setActiveGraph('peakHours')}
        >
          Peak Hours
        </button>
        <button
          className={styles.graphButtons}
          onClick={() => setActiveGraph('salesForecast')}
        >
          Sales Forecast
        </button>
        <button
          className={styles.graphButtons}
          onClick={() => setActiveGraph('customerReviews')}
        >
          Customer Reviews
        </button>
      </div>

      <div className={styles.graphContainer}>
        {renderGraph()}
      </div>
    </div>


    <div className={styles.secondCardContainer}>
        <div className={styles.reservationNavButtons}>
          <button
            className={`${styles.reservationButton} ${activeReservationTab === 'today' ? styles.active : ''}`}
            onClick={() => setActiveReservationTab('today')}
          >
            Today's Reservation
          </button>
          <button
            className={`${styles.reservationButton} ${activeReservationTab === 'upcoming' ? styles.active : ''}`}
            onClick={() => setActiveReservationTab('upcoming')}
          >
            Upcoming Reservation
          </button>
          <button
            className={`${styles.reservationButton} ${activeReservationTab === 'sold' ? styles.active : ''}`}
            onClick={() => setActiveReservationTab('sold')}
          >
            Product Sold
          </button>
        </div>

        <div className={styles.reservationCardContainer}>
          {activeReservationTab === 'today' && <ReservationCard />}
          {activeReservationTab === 'upcoming' && <UpcomingReservation />}
          {activeReservationTab === 'sold' && <SoldProducts />}
        </div>
      </div>

        </section>
    );
}

export default Dashboard;
