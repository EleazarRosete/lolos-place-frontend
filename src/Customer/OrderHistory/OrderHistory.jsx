import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCustomer } from "../../api/CustomerProvider";
import "./OrderHistory.css";
import MainLayout from "../../components/MainLayout";

const OrderHistory = () => {
  const { customer } = useCustomer();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customer) {
      setError("You need to be logged in to view your order history.");
      setLoading(false);
      return;
    }

    const fetchOrderHistory = async () => {
      try {
        const response = await axios.get(
          `https://lolos-place-backend.onrender.com/api/order-history?user_id=${customer.id}`
        );
        setOrders(response.data || []);
      } catch (err) {
        console.error("Error fetching order history:", err.message);
        setError("Failed to fetch order history. Please try again later.");
      } finally {
        setLoading(false);
      }

      console.log("ORDERS", orders);

    };

    fetchOrderHistory();
  }, [customer]);










  const addHoursToTime = (timeStr, hoursToAdd) => {
    const [hour, minute, second] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hour + hoursToAdd);
    date.setMinutes(minute);
    date.setSeconds(second || 0);
    return date; // Return Date object
  };
  


  const formatReservationTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };
  







const formatTime = (timeStr, order_type) => {
  const [hour, minute, second] = timeStr.split(":").map(Number);
  const time = new Date();

  time.setHours(hour);
  time.setMinutes(minute);
  time.setSeconds(second);

  // Apply offset ONLY if not a Delivery
  if (order_type !== "Delivery") {
    time.setHours(time.getHours());
  }

  return time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};




  
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <MainLayout>
      <div className="order-history-page">
        <h1>{customer?.fullName}'s Order History</h1>

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="order-list">
            {orders.map((order) => {
              const midIndex = Math.ceil(order.items.length / 2);
              const firstColumn = order.items.slice(0, midIndex);
              const secondColumn = order.items.slice(midIndex);

              return (
                <div className="order-card" key={order.order_id}>
<p><strong>Order Type:</strong> {
  order.order_type 
    ? order.order_type 
    : order.delivery
      ? 'Delivery' 
      : 'Reservation'
}</p>
                  <p><strong>Date:</strong> {formatDate(order.date)}</p>
                  <p><strong>Time:</strong> {formatTime(order.time, order.order_type)}</p>

{order.order_type === "Reservation" && (
  <>
    <p><strong>Reservation Date:</strong> {formatDate(order.reservation_date)}</p>
    <p><strong>Reservation Time:</strong> {formatReservationTime(addHoursToTime(order.time, 12))}</p>
    </>
)}


                  <h3 className="item-header">Ordered Items</h3>
                  <div className="items-columns">
                    <div className="items-column">
                      {firstColumn.map((item, index) => (
                        <div key={index} className="item-row">
                          <p className="item-name">{item.menu_name}</p>
                          <p className="item-quantity">{item.order_quantity}</p>
                        </div>
                      ))}
                    </div>
                    <div className="items-column">
                      {secondColumn.map((item, index) => (
                        <div key={index} className="item-row">
                          <p className="item-name">{item.menu_name}</p>
                          <p className="item-quantity">{item.order_quantity}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p><strong>Total Amount:</strong> ₱{order.total_amount.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OrderHistory;
