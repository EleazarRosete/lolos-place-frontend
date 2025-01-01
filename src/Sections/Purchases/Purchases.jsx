import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Purchases.module.css';

const Purchases = () => {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('orders');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // Add sortOrder state

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/order/get-order');
      const filteredOrders = response.data.filter(
        (order) => order.user_id === 14 && order.status === 'preparing'
      );
      setOrders(filteredOrders);
    } catch (err) {
      setError('Failed to fetch orders. Please try again later.');
    }
  
  };

  const fetchOrderHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/order/order-history');
      setAllOrders(response.data);
      console.log("ALL ORDERS",allOrders);
    } catch (err) {
      setError('Failed to fetch order history. Please try again later.');
    }

  };

  const fetchDeliveries = async () => {
    try {
      const response = await fetch('http://localhost:5000/order/get-delivery', {
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
        await fetchOrders();
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

  const sortedOrders = orders.sort((a, b) => {
    return sortOrder === 'asc' ? a.order_id - b.order_id : b.order_id - a.order_id;
  });

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
    console.log("ODELIVERY ID", deliveries);
    const matchedDelivery = deliveries.find(delivery => delivery.order_id === selectedOrderId);

    if (matchedDelivery) {
        try {
            const response = await fetch(`http://localhost:5000/order/update-delivery/${matchedDelivery.delivery_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "Delivered" }),
            });
            if (response.ok) {
                setDeliveries(prev =>
                    prev.filter(delivery => delivery.delivery_id !== matchedDelivery.delivery_id)
                );
                closeModal();
            } else {
                console.error("Failed to update delivery status.");
            }
        } catch (err) {
            console.error('Error updating delivery status:', err.message);
        }
    }

    try {
        const response = await axios.put(`http://localhost:5000/order/order-served/${selectedOrderId}`);
        if (response.status === 200) {
            await fetchOrders();
            await fetchOrderHistory();
            handleCloseModal();
        }
    } catch (error) {
        alert('Failed to update order status. Please try again later.');
    }
};

  const filteredOrders = (view === 'orders' && orderTypeFilter === 'deliveries'
    ? sortedAllOrders // Use sortedAllOrders for deliveries
    : sortedOrders // Otherwise, use sortedOrders
  ).filter((order) => {
    const ordertype = filterOrderType(order) || '';
    const searchQueryLower = searchQuery.toLowerCase();
  
    // Match order ID to deliveries and check the status
    const matchingDelivery = deliveries.find(delivery => delivery.order_id === order.order_id);
    const isDeliveryPending = matchingDelivery ? matchingDelivery.delivery_status === 'Pending' : false;
  
    return (
      (order.order_id?.toString().toLowerCase().includes(searchQueryLower) || // Search by order_id
      ordertype.toString().toLowerCase().includes(searchQueryLower)) &&
      (orderTypeFilter ? ordertype.includes(orderTypeFilter) : true) &&
      (orderTypeFilter === 'deliveries' ? isDeliveryPending : true) // Filter deliveries with pending status
    );
  });
  
  

  const filteredAllOrders = sortedAllOrders.filter((order) => {
    const ordertype = filterOrderType(order) || '';
    const searchQueryLower = searchQuery.toLowerCase();
    return (
      (order.order_id?.toString().toLowerCase().includes(searchQueryLower) || // Search by order_id
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
            {filteredOrders.length > 0 ? (
              <ul className={styles.orderList}>
                {filteredOrders.map((order) => {
                  const matchingOrder = allOrders.find(
                    (allOrder) => allOrder.order_id === order.order_id
                  );
                  return (
                    <li key={order.order_id} className={styles.orderItem}>
                      <h3>Order #{order.order_id}</h3>
                      <p>Name: {order.customer_name ? order.customer_name : `${order.firstName} ${order.lastName}`}</p>                      
                      <p>Number of people: {order.number_of_people ? order.number_of_people : "2"}</p>
                      <p>Date: {formatDate(order.date)}</p>
                      <p>Time: {formatTime(order.time)}</p>
                      <p>Items:</p>
                      <ul>
                        {(matchingOrder?.items || []).map((item, index) => (
                          <li key={index}>
                            {item.menu_name} (Qty: {item.order_quantity})
                          </li>
                        ))}
                      </ul>
                      <p>Order Type: {order.order_type}</p>
                      <p>Total: ₱{order.total_amount}</p>
                      <button onClick={() => handleStatusClick(order.order_id)}>Preparing</button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.noOrdersTxt}>No Orders</p>
            )}
          </div>
        ) : (
          <div className={styles.historyOrdersContainer}>
            <h1 className={styles.historyOrdersHeader}>Order History</h1>
            <ul className={styles.orderList1}>
              {filteredAllOrders.map((order) => {
                const matchingDelivery = deliveries.find(
                  (delivery) => delivery.order_id === order.order_id
                );
                return (
                  <li key={order.order_id} className={styles.orderItem}>
                    <h3>Order #{order.order_id}</h3>
                    <p>Name: {order.firstName && order.lastName ? `${order.firstName} ${order.lastName}` : "Lolo's Place"}</p>

<p>Number of people: {order.numberOfPeople ? order.numberOfPeople : "1"}</p>

                    <p>Date: {formatDate(order.date)}</p>
                    <p>Time: {formatTime(order.time)}</p>
                    <p>Items:</p>
                    <ul>
                      {(order.items || []).map((item, index) => (
                        <li key={index}>
                          {item.menu_name} (Qty: {item.order_quantity})
                        </li>
                      ))}
                    </ul>
                    <p>Order Type: {matchingDelivery ? `Delivery #${matchingDelivery.delivery_id}` : order.reservation_id != null ? `Reservation #${order.reservation_id}` : order.orderType}</p>

                    <p>Total: ₱{order.total_amount}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {modalOpen && selectedOrderId && (
        <div className={styles.modalOrders}>
        <div className={styles.modalOrder}>
          <div className={styles.modalContents}>
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
