import React, { useEffect, useRef, useState } from "react";
import './SuccessPage.css'
import MainLayout from '../../components/MainLayout';
import { useCustomer } from '../../api/CustomerProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";



const SuccessPage = () => {
  const { customer, cartReservations, setCartReservations, cartOrders, setCartOrders, isAdvanceOrder, formData, setIsAdvanceOrder, initialFormData, setFormData } = useCustomer();
  const urlLocation = useLocation();
  const queryParams = new URLSearchParams(urlLocation.search);
  const sessionId = queryParams.get('session_id');
  const navigate = useNavigate();
  const hasCalledPayment = useRef(false);
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

  const getTotalAmountOrders = () => {
    return cartOrders.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  const getTotalAmountReservation = () => {
    return cartReservations.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleConfirmOrder = async () => {
    if (hasCalledPayment.current) return; 
    hasCalledPayment.current = true;
    const orderDetails = {
      cart: cartOrders.map(item => ({
        menu_id: item.menu_id,
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price,
        items: item.items,
        img: item.img,
        quantity: item.quantity,
      })),
      userId: customer.id,                
      mop: 'GCash',                    
      totalAmount: getTotalAmountOrders(),
      date: new Date().toISOString().split('T')[0], 
      time: new Date().toTimeString().split(' ')[0], 
      deliveryLocation: customer.address,       
      deliveryStatus: 'Pending',                                 
    };
  
    console.log(orderDetails);

    try {
      const response = await axios.post('https://lolos-place-backend.onrender.com/api/orders', orderDetails);
  
      if (response.status === 201) {
        setCartOrders([]);
      } else {
        console.error('Failed to save order and delivery');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handleReservation = async () => {
    if (hasCalledPayment.current) return; 
    hasCalledPayment.current = true;
    const orderDetails = {
        cart: cartReservations.map(item => ({
            menu_id: item.menu_id,
            quantity: item.quantity,
        })), // Cart items to send to the server
        guestNumber: formData.guests, // Number of guests from formData
        userId: customer.id,           // Customer ID
        reservationDate: formData.date, // Date selected in the form
        reservationTime: formData.time, // Time selected in the form
        advanceOrder: isAdvanceOrder,   // Advance order boolean
        totalAmount: getTotalAmountReservation(),  // Total amount of the order
    };


    try {
        const response = await axios.post('https://lolos-place-backend.onrender.com/api/reservations', orderDetails);

        if (response.status === 201) {
            setCartReservations([]);
            setIsAdvanceOrder(false);
            setFormData(initialFormData);
        } else {
            console.error('Failed to save reservation and order');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};






const handleAddSales = async (orderType) => {
  try {
    const salesDataArray = await Promise.all(cartOrders.map(async (item) => {
      const price = parseFloat(item.price) || 0;
      const serviceCharge = parseFloat((price * 0.1).toFixed(2));
      const grossSales = parseFloat(((price + serviceCharge) * item.quantity).toFixed(2));

      return {
        amount: parseFloat((item.quantity * price).toFixed(2)),
        service_charge: serviceCharge,
        gross_sales: grossSales,
        product_name: item.name,
        category: item.category,
        quantity_sold: item.quantity,
        price_per_unit: price,
        mode_of_payment: 'GCash', // or whatever you’re using
        order_type: orderType,   // adjust as needed
      };
    }));

    // Post each sale entry one-by-one
    for (const sale of salesDataArray) {
      const response = await fetch("https://lolos-place-backend.onrender.com/sales/add-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sale),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from adding sales:", errorData);
        throw new Error(`Error adding sales data: ${errorData.message}`);
      }

      console.log("Sale added:", sale);
    }

    console.log("All sales added successfully.");
  } catch (error) {
    console.error("Error adding sales:", error);
  }
};













  useEffect(() => {
    console.log(cartOrders);

    const fetchPaymentStatus = async () => {
        const user_id = customer.id;
        try {
            const response = await axios.get(`https://lolos-place-backend.onrender.com/api/check-payment-status/${user_id}`);
            if (sessionId === response.data.session_id && response.data.payment_status === 'pending') {
              if (isAdvanceOrder) {
                handleReservation();
                handleAddSales("Reservation");
              } else {
                handleConfirmOrder();
                handleAddSales("Delivery");
              } // Call to confirm payment
            } else {
                navigate('/'); // Navigate if payment does not exist or is not pending
            }
        } catch (error) {
            console.error('Error checking payment status:', error.message);
            navigate('/'); // Navigate on error
        }
    };

    fetchPaymentStatus(); 
}, []);
  

  return (
    <MainLayout>
      <section>
    <div className="success-page">
      <section className="success-section">
        <h1>Success!</h1>
        <p>Payment Success</p>
      </section>
    </div>
    </section>
    </MainLayout>
  );
};


export default SuccessPage;
