import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import styles from './KitchenStatus.module.css';
import Successful from './Payment Result/Successful';
import Failed from './Payment Result/Failed';
import logoutIcon from '../../assets/logout.png';

const KitchenStatus = () => {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState([]);
  const [view, setView] = useState('orders');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenPayLater, setModalOpenPayLater] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
      const [salesData, setSalesData] = useState({
          amount:'',
          service_charge:'',
          gross_sales:'',
          product_name:'',
          category:'',
          quantity_sold:'',
          price_per_unit:'',
          mode_of_payment:'',
          order_type:''
      });

      const handleLogout = () => {
        setIsLogoutOpen(true);
    };

    const confirmLogout = () => {
      setIsLogoutOpen(false);
      navigate("/login");
  };


  const cancelLogout = () => {
    setIsLogoutOpen(false);
};

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

  const fetchTables = async () => {
    try {
      const response = await fetch("https://lolos-place-backend.onrender.com/table/get-table", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const jsonData = await response.json();


      setTables(jsonData);
  } catch (err) {
      console.error('Error fetching table:', err.message);
  }
  };


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchOrderHistory();
        await fetchDeliveries();
        await fetchTables();
      } catch (err) {
        setError('An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };
    const fetchProducts = async () =>{
      try {
      const response = await fetch("https://lolos-place-backend.onrender.com/menu/get-product", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const jsonData = await response.json();
  
      // Sort the products alphabetically by name
      const sortedData = jsonData.sort((a, b) => a.name.localeCompare(b.name));
  
      setProducts(sortedData);
    } catch (err) {
      console.error('Error fetching products:', err.message);
    }
  };



    fetchProducts();
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
    if(orderTypeFilter === "pay-later"){
      setModalOpenPayLater(true);
    }
    else{
      setModalOpen(true);
    }
  };

  const handleStatusClickPayLater = (orderId) => {
    setSelectedOrderId(orderId);
    setModalOpenPayLater(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalOpenPayLater(false);
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



  const handlePayNow = async () => {
      try {
      const response = await fetch("https://lolos-place-backend.onrender.com/order/get-order", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const jsonData = await response.json();
  
  
      setOrderData(jsonData.find(order => order.order_id === selectedOrderId));
    } catch (err) {
      console.error('Error fetching products:', err.message);
    }

    const selectedOrder = allOrders.find(order => order.order_id === selectedOrderId);
    const items = selectedOrder ? selectedOrder.items : [];
  
    const salesPromises = items.map(async (orderItem, i) => {
      if (!orderItem || !orderItem.menu_id || !orderItem.order_quantity) {
        console.error(`Invalid item data at index ${i}`);
        return;
      }
  
      // Find product details using menu_id
      const product = products.find(p => p.menu_id === orderItem.menu_id);
  
      if (!product) {
        console.error(`Product not found for menu_id ${orderItem.menu_id} at index ${i}`);
        return;
      }
  
      // If product and quantity are valid
      const price = parseFloat(product.price) || 0;
      const quantity = orderItem.order_quantity;
  
      const updatedSalesData = {
        ...salesData,
        amount: parseFloat((quantity * price).toFixed(2)),
        service_charge: parseFloat((price * 0.1).toFixed(2)),
        gross_sales: parseFloat(((price + price * 0.1) * quantity).toFixed(2)),
        product_name: product.name,
        category: product.category,
        quantity_sold: quantity,
        price_per_unit: parseFloat(price.toFixed(2)),
        mode_of_payment: orderData.mop,
        order_type: orderData.order_type,
      };
  
      
      try {
        const response = await fetch('https://lolos-place-backend.onrender.com/sales/add-sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedSalesData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response from server:", errorData);
            throw new Error(`Error adding sales data: ${errorData.message}`);
        }

        const data = await response.json();
        console.log("Sales data added successfully:", data);
    } catch (err) {
        console.error("Error adding sales data:", err.message);
    }

    });
  
    await Promise.all(salesPromises);

    try {
      if (!selectedOrderId) {
        throw new Error("Selected order ID is not defined.");
      }
    
      const response = await fetch(`https://lolos-place-backend.onrender.com/order/update-is-paid/${selectedOrderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
    
      console.log("SUCCESS");
    
      if (response.status === 200) {
        await fetchOrderHistory();
        handleCloseModal();
      }
    
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from server:", errorData);
        throw new Error(`Error updating order payment status: ${errorData.message}`);
      }
    
    } catch (err) {
      console.error("Error updating order payment status:", err.message);
    }
    

    

  };
  
  











    

const handleGCashPayment = async () => {
    const admin = 14;
    


    const selectedOrder = allOrders.find(order => order.order_id === selectedOrderId);
    const items = selectedOrder ? selectedOrder.items : [];
    

    try {
        // Step 1: Create checkout session
        const response = await fetch("https://lolos-place-backend.onrender.com/api/create-gcash-checkout-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: admin,
                lineItems: items.map((product) => ({
                    quantity: product.order_quantity,
                    name: product.menu_name,
                    price: ((parseFloat(products.find(p => p.menu_id === product.menu_id)?.price) + parseFloat(products.find(p => p.menu_id === product.menu_id)?.price) * 0.1) || 0).toFixed(2)
                })),
            }),
        });
         console.log(price);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        const { url } = responseData;

        if (!url) {
            console.error("No URL received from the API:", responseData);
            return;
        }

        window.location.href = url; // Redirect to the GCash payment provider

    } catch (error) {
        console.error("Error during payment and data addition:", error);
    }
};












  const filteredAllOrders = sortedAllOrders.filter((order) => {
    const ordertype = filterOrderType(order) || '';
    const searchQueryLower = searchQuery.toLowerCase();
    return (
      order.status !== 'preparing' && order.ispaid == true &&
      (!order.reservation_id || new Date(order.reservation_date) <= new Date()) &&
      (order.order_id?.toString().toLowerCase().includes(searchQueryLower) ||
        ordertype.toString().toLowerCase().includes(searchQueryLower)) &&
      (orderTypeFilter ? ordertype.includes(orderTypeFilter) : true)
    );
  });
  
  
  
  const filteredPreparingOrders = sortedAllOrders.filter((order) => {
    const ordertype = filterOrderType(order) || '';
    const searchQueryLower = searchQuery.toLowerCase();
  
    if (orderTypeFilter === 'pay-later') {
      return !order.ispaid && order.order_id?.toString().toLowerCase().includes(searchQueryLower);
    }
  
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
    const time = new Date(`1970-01-01T${timeString}Z`); // Append 'Z' to treat as UTC time
    if (isNaN(time)) return 'Invalid Time';
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Manila', // Philippine Time Zone
    });
  };
  
  

  return (
    <section className={styles.section}>
      <div className={styles.searchContainer}>
      <h1 className={styles.adminType}>LoLo's Place Kitchen</h1>

        <input
          type="text"
          placeholder="Search by Order ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        {/* <button onClick={handleSortChange}>
          Sort Order {sortOrder === 'asc' ? '▲' : '▼'}
        </button> */}
                 <button className={styles.sideButton} onClick={handleLogout}>
                     <img src={logoutIcon} alt="logout" className={styles.buttonIcons} /> Logout
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
            <h1 className={styles.pendingOrdersHeaderkitchen}>Pending Orders</h1>
            {filteredPreparingOrders.length > 0 ? (
              <ul className={styles.orderList}>
                {filteredPreparingOrders.map((order) => {
                  return (
                    <li key={order.order_id} className={styles.orderItem}>
                      <h3>Order #{order.order_id}</h3>




                      <p>Orders:</p>
                      <ul>
                        {order.items.map((item, index) => (
                          <li key={index}>
                            {item.menu_name} (Qty: {item.order_quantity})
                          </li>
                        ))}
                      </ul>
                      <button onClick={() => handleStatusClick(order.order_id)}>{
  orderTypeFilter === "pay-later" 
    ? "Pay now" 
    : orderTypeFilter === "deliveries" 
    ? "Deliver" 
    : (orderTypeFilter === "Dine-in" || orderTypeFilter === "Take-out") 
    ? "Serve" 
    : "Serve"
}
</button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No pending orders available.</p>
            )}
          </div>
        ) : (
          <div className={styles.pendingOrdersContainer}>
            <h1 className={styles.pendingOrdersHeader}>Order History</h1>
            {filteredAllOrders.length > 0 ? (
              <ul className={styles.orderList}>
                {filteredAllOrders.map((order) => (
                  <li key={order.order_id} className={styles.orderItem}>
                    <h3>Order #{order.order_id}</h3>
                    <p>Name: {order.customerName !== null ? order.customerName : `${order.firstName} ${order.lastName}`}</p>  
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
                    <p>Order Type: {order.reservation_id != null ? `Reservation` : order.delivery === true ? `Delivery` : order.orderType}</p>                                          
                    <p>Total: ₱{order.total_amount}  <strong>{order.ispaid === true ? "PAID" : "NOT PAID"}</strong></p>
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
            <h3>Order is ready to served?</h3>
            <div className={styles.navButtonOrders}>
            <button onClick={handleCloseModal} className={styles.orderButtonsHistory}>Not yet</button>
              <button onClick={handleServeOrder} className={styles.orderButtonsHistory}>Yes</button>

            </div>

          </div>
        </div>
        </div>

      )}


  {isLogoutOpen && (
                    <div className={styles.modalLogout}>
                        <div className={styles.logoutOverlay}>
                            <div className={styles.logout}>
                                <h2>Confirm logout</h2>
                                <p>Are you sure you want to log out?</p>
                                <div className={styles.logoutButtons}>
                                    <button onClick={confirmLogout} className={styles.confirmButton}>Yes</button>
                                    <button onClick={cancelLogout} className={styles.cancelButton}>No</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

<Routes>
        <Route path="successful" element={<Successful selectedOrderId/>} />
        <Route path="failed" element={<Failed selectedOrderId/>} />
      </Routes>

    </section>
  );
};

export default KitchenStatus;
