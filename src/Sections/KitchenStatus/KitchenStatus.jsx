import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import styles from './KitchenStatus.module.css';
import Successful from './Payment Result/Successful.jsx';
import Failed from './Payment Result/Failed.jsx';

const KitchenStatus = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [all, setAll] = useState(0);
  const [dine, setDine] = useState(0);
  const [take, setTake] = useState(0);
  const [deliverr, setDeliverr] = useState(0);
  const [pay, setPay] = useState(0);
  const [detailss, setDeatilss] = useState([]);
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

      const [isLogoutOpen, setIsLogoutOpen] = useState(false);
      const [isAsideVisible, setIsAsideVisible] = useState(true);

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
      const response = await axios.get('http://localhost:10000/order/order-history');
      setAllOrders(response.data);

    } catch (err) {
      setError('Failed to fetch order history. Please try again later.');
    }
  };

  const fetchDeliveries = async () => {
    try {
      const response = await fetch('http://localhost:10000/order/get-delivery', {
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
      const response = await fetch("http://localhost:10000/table/get-table", {
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
      const response = await fetch("http://localhost:10000/menu/get-product", {
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



  const handleStatusClick = (orderId, name, firstName, lastName, numppl, phone, date, time, tableID, items) => {
    setSelectedOrderId(orderId);
    setDeatilss([orderId, name,firstName, lastName, numppl, phone, date, time, tableID, items]);
    console.log(detailss);
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
            const response = await fetch(`http://localhost:10000/order/update-delivery/${matchedDelivery.delivery_id}`, {
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
        const response = await axios.put(`http://localhost:10000/order/order-served/${selectedOrderId}`);
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
      const response = await fetch("http://localhost:10000/order/get-order", {
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
        const response = await fetch('http://localhost:10000/sales/add-sales', {
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
    
      const response = await fetch(`http://localhost:10000/order/update-is-paid/${selectedOrderId}`, {
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
  
  




  const handleGCashPayment = async (items, order_id) => {
    // Validate that items is defined and is an array (this might be a redundant check
    // if we are going to fetch the order details anyway, but we'll keep it)
    if (!items || !Array.isArray(items)) {
      console.error("Invalid items parameter. Expected an array, but received:", items);
      return;
    }
  
    const admin = 14;
  
    try {
      // Step 1: Create checkout session
      const checkoutResponse = await fetch(
        "http://localhost:10000/api/create-gcash-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: admin,
            lineItems: items.map((product) => {
              const foundProduct = products.find((p) => p.menu_id === product.menu_id);
              const basePrice = parseFloat(foundProduct?.price) || 0;
              const priceWithTax = basePrice + basePrice * 0.1;
              return {
                quantity: product.order_quantity,
                name: product.menu_name,
                price: priceWithTax.toFixed(2),
              };
            }),
          })
        }
      );
  
      if (!checkoutResponse.ok) {
        throw new Error(
          `HTTP error while creating checkout session: ${checkoutResponse.status}`
        );
      }
  
      const checkoutData = await checkoutResponse.json();
      const { url } = checkoutData;
      if (!url) {
        throw new Error("No URL received from the checkout session API");
      }
  
      // Step 2: Update payment status to 'paid'
      const updateResponse = await fetch(
        `http://localhost:10000/order/update-is-paid/${order_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("ORDER IS PAID");
      if (!updateResponse.ok) {
        throw new Error(`Error updating is_paid status: ${updateResponse.status}`);
      }
  
      // Step 3: Fetch order details, order quantities, and products
      // 3a. Get order details
      const orderResponse = await fetch(
        "http://localhost:10000/order/get-order",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!orderResponse.ok) {
        throw new Error(`HTTP error fetching order: ${orderResponse.status}`);
      }
      const ordersData = await orderResponse.json();
      const currentOrder = ordersData.find((order) => order.order_id === order_id);
      if (!currentOrder) {
        throw new Error("Order not found");
      }
  
      // 3b. Get order quantities
      const quantitiesResponse = await fetch(
        "http://localhost:10000/order/get-order-quantities",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!quantitiesResponse.ok) {
        throw new Error(`HTTP error fetching order quantities: ${quantitiesResponse.status}`);
      }
      const orderQuantities = await quantitiesResponse.json();
      // Filter quantities for the current order (assuming each record has order_id, menu_id, and quantity)

      const currentOrderQuantities = orderQuantities.filter(q => q.order_id === order_id);

      // 3c. Get products
      const productResponse = await fetch(
        "http://localhost:10000/menu/get-product",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!productResponse.ok) {
        throw new Error(`HTTP error fetching products: ${productResponse.status}`);
      }
      const productsData = await productResponse.json();
  
      // Step 4: Build and post salesData for each order item
      const salesPromises = currentOrderQuantities.map(async (quantityItem) => {
        // quantityItem should include order_id, menu_id, and quantity
        const product = productsData.find(p => p.menu_id === quantityItem.menu_id);
        if (!product) {
          console.error(`Product with menu_id ${quantityItem.menu_id} not found.`);
          return;
        }
        const pricePerUnit = parseFloat(product.price) || 0;
        const qty = parseFloat(quantityItem.order_quantity) || 0;
        const amount = pricePerUnit * qty;
        const serviceCharge = amount * 0.1;
        const grossSales = amount + serviceCharge;
  
        // Construct the salesData object
        const salesData = {
          amount: parseFloat(amount.toFixed(2)),
          service_charge: parseFloat(serviceCharge.toFixed(2)),
          gross_sales: parseFloat(grossSales.toFixed(2)),
          product_name: product.name,
          category: product.category,
          quantity_sold: qty,
          price_per_unit: parseFloat(pricePerUnit.toFixed(2)),
          mode_of_payment: currentOrder.mop,        // assuming currentOrder.mop is defined (e.g., "GCash")
          order_type: currentOrder.order_type         // assuming currentOrder.order_type is defined
        };
  
        console.log(salesData);

        try {
          const salesResponse = await fetch("http://localhost:10000/sales/add-sales", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(salesData),
          });
          if (!salesResponse.ok) {
            const errorData = await salesResponse.json();
            throw new Error(`Error adding sales data for product ${product.name}: ${salesResponse.status} ${errorData.message || ""}`);
          }
          console.log(`Sales added for product ${product.name}`);
        } catch (err) {
          console.error(`Error adding sales data for product ${product.name}:`, err);
          throw err;
        }
      });
  
      await Promise.all(salesPromises);
      console.log("All sales data added successfully");
  
      // Step 5: Redirect to the GCash payment provider
      window.location.href = url;
    } catch (error) {
      console.error("Error occurred in handleGCashPayment:", error);
      // If an error occurs, attempt to update the order as 'not-paid'
      try {
        const notPaidResponse = await fetch(
          `http://localhost:10000/order/update-not-paid/${order_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!notPaidResponse.ok) {
          console.error(`Failed to update to not-paid status: ${notPaidResponse.status}`);
        } else {
          console.log("Order updated to not-paid status successfully.");
        }
      } catch (updateError) {
        console.error("Error updating not-paid status:", updateError);
      }
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
      (order.status === 'preparing' || !order.ispaid) && // Include unpaid orders
      (order.order_id?.toString().toLowerCase().includes(searchQueryLower) ||
        ordertype.toString().toLowerCase().includes(searchQueryLower)) &&
      (orderTypeFilter ? ordertype.includes(orderTypeFilter) : true)
    );
  });
  
  
  
  
  useEffect(() => {

    const alls = sortedAllOrders.filter(order => order.status === 'preparing' ).length;
    const dineInOrders = new Set([
      ...sortedAllOrders.filter(order => order.orderType === 'Dine-in' && order.status === 'preparing'),
      ...sortedAllOrders.filter(order => order.orderType === 'Dine-in' && !order.ispaid)
    ]).size;
    
    const takeOutOrders = new Set([
      ...sortedAllOrders.filter(order => order.orderType === 'Take-out' && order.status === 'preparing'),
      ...sortedAllOrders.filter(order => order.orderType === 'Take-out' && !order.ispaid)
    ]).size;
    
    const deliveryOrders = new Set([
      ...sortedAllOrders.filter(order => order.delivery === true && order.status === 'preparing'),
      ...sortedAllOrders.filter(order => order.delivery === true && !order.ispaid)
    ]).size;
    
    const payLaterOrders = sortedAllOrders.filter(order => !order.ispaid).length;
  
    const forAll = new Set([...sortedAllOrders.filter(order => !order.ispaid), 
      ...sortedAllOrders.filter(order => order.status === 'preparing')]
    .map(order => order.order_id)).size;



      // setAll(alls + payLaterOrders); // Include pay-later orders in "all"
    setAll(forAll); // Include pay-later orders in "all"

    setDine(dineInOrders);
    setTake(takeOutOrders);
    setDeliverr(deliveryOrders);
    setPay(payLaterOrders);
  }, [sortedAllOrders]);
  
  

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
      <div className={styles.OrdersSearchContainer}>
        <input
          type="text"
          placeholder="Search by Order ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.buttonNavKitchen}>

        <button onClick={handleSortChange}
        className={styles.OrdersSortButton}>
          Sort Order {sortOrder === 'asc' ? '▲' : '▼'}
        </button>
                        <button className={styles.buttonOrderHistory  } onClick={handleLogout}>
                           Logout
                        </button>
                        </div>

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
    {all > 0 && <span className={styles.notificationNumber}>{all}</span>}
  </button>
  <button onClick={() => setOrderTypeFilter('dine-in')} className={styles.filterButton}>
    Dine In
    {dine > 0 && <span className={styles.notificationNumber}>{dine}</span>}
  </button>
  <button onClick={() => setOrderTypeFilter('take-out')} className={styles.filterButton}>
    Take Out
    {take > 0 && <span className={styles.notificationNumber}>{take}</span>}
  </button>
  <button onClick={() => setOrderTypeFilter('deliveries')} className={styles.filterButton}>
    Deliveries
    {deliverr > 0 && <span className={styles.notificationNumber}>{deliverr}</span>}
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
                      <h3 className={styles.ordersH3}>Order #{order.order_id}</h3>
                      <p>Table: {tables.find((table) => table.table_id === order.tableID) 
    ? tables.find((table) => table.table_id === order.tableID).table_name 
    : 'No table applied'}
</p>




                      <p>Items:</p>
                      <ul>
                        {order.items.map((item, index) => (
                          <li key={index}>
                            {item.menu_name} (Qty: {item.order_quantity})
                          </li>
                        ))}
                      </ul>
          
                      <button onClick={() => handleStatusClick(order.order_id,order.customerName, order.firstName, order.lastName, order.numberOfPeople,order.phone,order.date,order.time,order.tableID, order.items)}>Details
</button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.noOrders}>No pending orders available.</p>
            )}
          </div>
        ) : (
          <div className={styles.pendingOrdersContainer}>
            <h1 className={styles.pendingOrdersHeader}>Order History</h1>
            {filteredAllOrders.length > 0 ? (
              <ul className={styles.orderList}>
                {filteredAllOrders.map((order) => (
                  <li key={order.order_id} className={styles.orderItem}>
                    <h3 className={styles.ordersH3}>Order #{order.order_id}</h3>

                    <p>Items:</p>
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.menu_name} (Qty: {item.order_quantity})
                        </li>
                      ))}
                    </ul>
                    <p>Order Type: {order.reservation_id != null ? `Reservation` : order.delivery === true ? `Delivery` : order.orderType}</p>                                          
                
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noOrders}>No order history available.</p>
            )}
          </div>
        )}
      </div>
      {modalOpen && selectedOrderId && (
        <div className={styles.modalPurchase}>
        <div className={styles.modalOrders}>
          <div className={styles.modalOrder}>
            <h3>Mark Order as Served</h3>
            <h3>Order #{detailss[0]}</h3>
    
            <div className={styles.navButtonOrders}>

              <button onClick={handleServeOrder} className={styles.orderButtonsHistory}>Served</button>
              <button onClick={handleCloseModal} className={styles.orderButtonsHistory}>Close</button>

            </div>

          </div>
        </div>
        </div>

      )}


{modalOpenPayLater && selectedOrderId && (
        <div className={styles.modalPurchase}>
        <div className={styles.modalOrders}>
          <div className={styles.modalOrder}>
            <h3>Pay Order Now</h3>
            <h3>Order #{detailss[0]}</h3>
            <p>Name: {detailss[1] !== null ? detailss[1] : `${detailss[2]} ${detailss[3]}`}</p>  
                    <p>Number of people: {detailss[4] == null ? "1" : detailss[4]}</p>
                    <p>Contact Number: {detailss[5] == "09682823420" ? "No number inputed" : detailss[3]}</p>
                    <p>Date: {formatDate(detailss[6])}</p>
                    <p>Time: {formatTime(detailss[7])}</p>
                    <p>Table: {tables.find((table) => table.table_id === detailss[8]) 
    ? tables.find((table) => table.table_id === detailss[8]).table_name 
    : 'No table applied'}
</p>
            <div className={styles.navButtonOrders}>
            <button onClick={handlePayNow} className={styles.orderButtonsHistory}>CASH Pay</button>
            <button 
  onClick={() => handleGCashPayment(detailss[9], detailss[0])} 
  className={styles.orderButtonsHistory}
>
  GCASH Pay
</button>


              <button onClick={handleCloseModal} className={styles.orderButtonsHistory}>Cancel</button>

            </div>

          </div>
        </div>
        </div>

      )}

        {isLogoutOpen && (
                          <div className={styles.logoutModal}>
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
        <Route path="/successful" element={<Successful/>} />
        <Route path="/failed" element={<Failed />} />
      </Routes>

    </section>
  );
};

export default KitchenStatus;
