import styles from './Dashboard.module.css';
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
    return (
        <section className={styles.section}>
            <div className={styles.cardContainer}>
                <FeedbackCard/>
                <InventoryCard/>
                <SalesTodayCard/>
                <ReservationCard/>
                <UpcomingReservation/>
                <SoldProducts/>
            </div>
            <div className={styles.analyticsContainer}>
                <ProductDemand/>
                <CustomerPeakHours/>
                <SalesForecast/>
                <CustomerReviews/>
            </div>
        </section>
    );
}

export default Dashboard;
