import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Purchases.module.css';

const Purchases = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('orders');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchOrderHistory = async () => {
    try {
      const response = await axios.get('https://lolos-place-backend.onrender.com/order/order-history');
      setAllOrders(response.data);
    } catch (err) {
      setError('Failed to fetch order history. Please try again later.');
    }
  };

  const fetchDeliveries = async () => {
    try {
      const response = await fetch('https://lolos-place-backend.onrender.com/order/get-delivery', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const jsonData = await response.json();
      setDeliveries(jsonData);
    } catch (err) {
      setError('Failed to fetch deliveries. Please try again later.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchOrderHistory();
        await fetchDeliveries();
      } catch (err) {
        setError('An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSortChange = () => {
    setSortOrder((prevSortOrder) => (prevSortOrder === 'asc' ? 'desc' : 'asc'));
  };

  const filterOrderType = (order) => {
    const matchingOrder = allOrders.find((allOrder) => allOrder.order_id === order.order_id);
    if (!matchingOrder) return order.order_type;

    if (matchingOrder.reservation_id === null) {
      const matchingDelivery = deliveries.find((delivery) => delivery.order_id === order.order_id);
      if (matchingDelivery) return 'deliveries';
      return matchingOrder.orderType === 'Dine-in' ? 'dine-in' : 'take-out';
    } else {
      return 'reservation';
    }
  };

  const sortedAllOrders = allOrders.sort((a, b) => {
    return sortOrder === 'asc' ? a.order_id - b.order_id : b.order_id - a.order_id;
  });

  const toggleView = () => {
    setView((prevView) => (prevView === 'orders' ? 'orderHistory' : 'orders'));
  };

  const handleStatusClick = (orderId) => {
    setSelectedOrderId(orderId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrderId(null);
  };

  const handleServeOrder = async () => {
    const matchedDelivery = deliveries.find(delivery => delivery.order_id === selectedOrderId);

    if (matchedDelivery) {
        try {
            const response = await fetch(`https://lolos-place-backend.onrender.com/order/update-delivery/${matchedDelivery.delivery_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "Delivered" }),
            });
            if (response.ok) {
                setDeliveries(prev =>
                    prev.filter(delivery => delivery.delivery_id !== matchedDelivery.delivery_id)
                );
                handleCloseModal();
            } else {
                console.error("Failed to update delivery status.");
            }
        } catch (err) {
            console.error('Error updating delivery status:', err.message);
        }
    }

    try {
        const response = await axios.put(`https://lolos-place-backend.onrender.com/order/order-served/${selectedOrderId}`);
        if (response.status === 200) {
            await fetchOrderHistory();
            handleCloseModal();
        }
    } catch (error) {
        alert('Failed to update order status. Please try again later.');
    }
  };

  const filteredAllOrders = sortedAllOrders.filter((order) => {
    const ordertype = filterOrderType(order) || '';
    const searchQueryLower = searchQuery.toLowerCase();
    return (
      order.status !== 'preparing' &&
      (!order.reservation_id || new Date(order.reservation_date) <= new Date()) &&
      (order.order_id?.toString().toLowerCase().includes(searchQueryLower) ||
        ordertype.toString().toLowerCase().includes(searchQueryLower)) &&
      (orderTypeFilter ? ordertype.includes(orderTypeFilter) : true)
    );
  });
  
  
  const filteredPreparingOrders = sortedAllOrders.filter((order) => {
    const ordertype = filterOrderType(order) || '';
    const searchQueryLower = searchQuery.toLowerCase();
    return (
      order.status === 'preparing' &&
      (order.order_id?.toString().toLowerCase().includes(searchQueryLower) ||
        ordertype.toString().toLowerCase().includes(searchQueryLower)) &&
      (orderTypeFilter ? ordertype.includes(orderTypeFilter) : true)
    );
  });
  
  
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return 'Invalid Date';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    const time = new Date(`1970-01-01T${timeString}`);
    if (isNaN(time)) return 'Invalid Time';
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <section className={styles.section}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by Order ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <button onClick={handleSortChange}>
          Sort Order {sortOrder === 'asc' ? '▲' : '▼'}
        </button>
        <button className={styles.buttonOrderHistory} onClick={toggleView}>
          {view === 'orders' ? 'View Order History' : 'View Pending Orders'}
        </button>
      </div>
      <div className={styles.navButtons}>
        {view === 'orderHistory' && (
          <div className={styles.filterContainer}>
            <button onClick={() => setOrderTypeFilter('')} className={styles.filterButton}>
              All
            </button>
            <button onClick={() => setOrderTypeFilter('dine-in')} className={styles.filterButton}>
              Dine In
            </button>
            <button onClick={() => setOrderTypeFilter('take-out')} className={styles.filterButton}>
              Take Out
            </button>
            <button onClick={() => setOrderTypeFilter('deliveries')} className={styles.filterButton}>
              Deliveries
            </button>
            <button onClick={() => setOrderTypeFilter('reservation')} className={styles.filterButton}>
              Reservation
            </button>
          </div>
        )}
        {view === 'orders' && (
          <div className={styles.filterContainer}>
            <button onClick={() => setOrderTypeFilter('')} className={styles.filterButton}>
              All
            </button>
            <button onClick={() => setOrderTypeFilter('dine-in')} className={styles.filterButton}>
              Dine In
            </button>
            <button onClick={() => setOrderTypeFilter('take-out')} className={styles.filterButton}>
              Take Out
            </button>
            <button onClick={() => setOrderTypeFilter('deliveries')} className={styles.filterButton}>
              Deliveries
            </button>
          </div>
        )}
      </div>
      <div className={styles.orderPurchasesContainer}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : view === 'orders' ? (
          <div className={styles.pendingOrdersContainer}>
            <h1 className={styles.pendingOrdersHeader}>Pending Orders</h1>
            {filteredPreparingOrders.length > 0 ? (
              <ul className={styles.orderList}>
                {filteredPreparingOrders.map((order) => {
                  return (
                    <li key={order.order_id} className={styles.orderItem}>
                      <h3>Order #{order.order_id}</h3>
                      <p>Name: {order.customer_name ? order.customer_name : `${order.firstName} ${order.lastName}`}</p>                      
                      <p>Number of people: {order.numberOfPeople == null ? "1" : order.numberOfPeople}</p>
                      <p>Contact Number: {order.phone == "09682823420" ? "N/A" : order.phone}</p>
                      <p>Date: {formatDate(order.date)}</p>
                      <p>Time: {formatTime(order.time)}</p>
                      <p>Items:</p>
                      <ul>
                        {order.items.map((item, index) => (
                          <li key={index}>
                            {item.menu_name} (Qty: {item.order_quantity})
                          </li>
                        ))}
                      </ul>
                    <p>Order Type: {order.reservation_id != null ? `Reservation #${order.reservation_id}` : order.delivery === true ? `Delivery #${deliveries.find(delivery => delivery.order_id === order.order_id)?.delivery_id}` : order.orderType}</p>
                      <p>Total: ₱{order.total_amount}</p>
                      <button onClick={() => handleStatusClick(order.order_id)}>Preparing</button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No pending orders available.</p>
            )}
          </div>
        ) : (
          <div className={styles.orderHistoryContainer}>
            <h1 className={styles.orderHistoryHeader}>Order History</h1>
            {filteredAllOrders.length > 0 ? (
              <ul className={styles.orderList}>
                {filteredAllOrders.map((order) => (
                  <li key={order.order_id} className={styles.orderItem}>
                    <h3>Order #{order.order_id}</h3>
                    <p>Name: {order.customer_name ? order.customer_name : `${order.firstName} ${order.lastName}`}</p>
                    <p>Number of people: {order.numberOfPeople == null ? "1" : order.numberOfPeople}</p>
                    <p>Contact Number: {order.phone == "09682823420" ? "N/A" : order.phone}</p>
                    <p>Date: {formatDate(order.date)}</p>
                    <p>Time: {formatTime(order.time)}</p>
                    <p>Items:</p>
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.menu_name} (Qty: {item.order_quantity})
                        </li>
                      ))}
                    </ul>
                    <p>Order Type: {order.reservation_id != null ? `Reservation #${order.reservation_id}` : order.delivery === true ? `Delivery #${deliveries.find(delivery => delivery.order_id === order.order_id)?.delivery_id}` : order.orderType}</p>                    <p>Total: ₱{order.total_amount}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No order history available.</p>
            )}
          </div>
        )}
      </div>
      {modalOpen && selectedOrderId && (
        <div className={styles.modalPurchase}>
        <div className={styles.modalOrders}>
          <div className={styles.modalOrder}>
            <h3>Mark Order as Served</h3>
            <div className={styles.navButtonOrders}>
            <button onClick={handleCloseModal} className={styles.orderButtonsHistory}>Close</button>
              <button onClick={handleServeOrder} className={styles.orderButtonsHistory}>Served</button>

            </div>

          </div>
        </div>
        </div>

      )}
    </section>
  );
};

export default Purchases;
