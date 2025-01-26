import React, { useEffect, useRef, useState } from "react";
import './SuccessPage.css';
import MainLayout from '../../components/MainLayout';
import { useCustomer } from '../../api/CustomerProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";

const SuccessPage = () => {
  const {
    customer,
    cartReservations,
    setCartReservations,
    cartOrders,
    setCartOrders,
    isAdvanceOrder,
    formData,
    setIsAdvanceOrder,
    initialFormData,
    setFormData
  } = useCustomer();

  const urlLocation = useLocation();
  const queryParams = new URLSearchParams(urlLocation.search);
  const sessionId = queryParams.get('session_id');
  const navigate = useNavigate();
  const hasCalledPayment = useRef(false);

  const [products, setProducts] = useState([]);
  const [salesData, setSalesData] = useState({
    amount: '',
    service_charge: '',
    gross_sales: '',
    product_name: '',
    category: '',
    quantity_sold: '',
    price_per_unit: '',
    mode_of_payment: '',
    order_type: ''
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
  
    try {
      const response = await axios.post('https://lolos-place-backend.onrender.com/api/orders', orderDetails);
  
      if (response.status === 201) {
        const updateStockPromises = cartOrders.map(async ({ menu_id, quantity }) => {
          try {
            const response = await fetch(`https://lolos-place-backend.onrender.com/menu/update-product-stock/${menu_id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ quantity }),
            });
        
            if (!response.ok) {
              throw new Error(`Error updating stock for menu_id ${menu_id}: ${response.statusText}`);
            }
        
            setProducts((prevProducts) =>
              prevProducts.map((product) =>
                product.menu_id === menu_id
                  ? { ...product, stocks: product.stocks - quantity }
                  : product
              )
            );
          } catch (error) {
            console.error(error);
          }
        });
        
      
        let products = [];
        try {
          const productResponse = await axios.get('https://lolos-place-backend.onrender.com/menu/get-product');
          products = productResponse.data;
        } catch (err) {
          console.error('Error fetching products:', err.message);
          return; // Exit if fetching products fails
        }
  
        const salesPromises = orderDetails.cart.map(async (orderedItem) => {
          const product = products.find(p => p.menu_id === orderedItem.menu_id);
  
          console.log("PRODUCTS:", products);
          console.log("FOUND PRODUCT:", product);
  
          if (product) {
            const price = parseFloat(product.price) || 0;
            const updatedSalesData = {
              ...salesData,
              amount: parseFloat((orderedItem.quantity * price).toFixed(2)),
              service_charge: parseFloat((price * 0.1).toFixed(2)),
              gross_sales: parseFloat(((price + price * 0.1) * orderedItem.quantity).toFixed(2)),
              product_name: product.name,
              category: product.category,
              quantity_sold: orderedItem.quantity,
              price_per_unit: parseFloat(price.toFixed(2)),
              mode_of_payment: 'GCash',
              order_type: 'Delivery',
            };
  
            try {
              const salesResponse = await axios.post('https://lolos-place-backend.onrender.com/sales/add-sales', updatedSalesData);
              console.log("Sales data added successfully:", salesResponse.data);
            } catch (err) {
              console.error("Error adding sales data:", err.message);
            }
          } else {
            console.warn(`Product with menu_id ${orderedItem.menu_id} not found.`);
          }
        });
  
        await Promise.all(salesPromises);
        setCartOrders([]); // Clear the cart only after all sales data is processed
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
      })),
      guestNumber: formData.guests,
      userId: customer.id,
      reservationDate: formData.date,
      reservationTime: formData.time,
      advanceOrder: isAdvanceOrder,
      totalAmount: getTotalAmountReservation(),
    };
  
    try {
      // Save reservation details first
      const response = await axios.post('https://lolos-place-backend.onrender.com/api/reservations', orderDetails);
  
      if (response.status === 201) {
        const updateStockPromises = cartReservations.map(async ({ menu_id, quantity }) => {
          try {
            const response = await fetch(`https://lolos-place-backend.onrender.com/menu/update-product-stock/${menu_id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ quantity }),
            });
        
            if (!response.ok) {
              throw new Error(`Error updating stock for menu_id ${menu_id}: ${response.statusText}`);
            }
        
            setProducts((prevProducts) =>
              prevProducts.map((product) =>
                product.menu_id === menu_id
                  ? { ...product, stocks: product.stocks - quantity }
                  : product
              )
            );
          } catch (error) {
            console.error(error);
          }
        });


        // Fetch products after reservation is saved
        let products = [];
        try {
          const productResponse = await axios.get('https://lolos-place-backend.onrender.com/menu/get-product');
          products = productResponse.data;
        } catch (err) {
          console.error('Error fetching products:', err.message);
          return; // Exit early if fetching products fails
        }
  
        // Loop through the cart and add sales data
        const salesPromises = orderDetails.cart.map(async (orderedItem) => {
          const product = products.find(p => p.menu_id === orderedItem.menu_id);
  
          if (product) {
            const price = parseFloat(product.price) || 0;
            const updatedSalesData = {
              amount: parseFloat((orderedItem.quantity * price).toFixed(2)),
              service_charge: parseFloat((price * 0.1).toFixed(2)),
              gross_sales: parseFloat(((price + price * 0.1) * orderedItem.quantity).toFixed(2)),
              product_name: product.name,
              category: product.category,
              quantity_sold: orderedItem.quantity,
              price_per_unit: parseFloat(price.toFixed(2)),
              mode_of_payment: 'GCash',  // Adjust payment method as needed
              order_type: 'Reservation',
            };
  
            try {
              const salesResponse = await axios.post('https://lolos-place-backend.onrender.com/sales/add-sales', updatedSalesData);
              console.log("Sales data added successfully:", salesResponse.data);
            } catch (err) {
              console.error("Error adding sales data:", err.message);
            }
          } else {
            console.warn(`Product with menu_id ${orderedItem.menu_id} not found.`);
          }
        });
  
        // Wait for all sales data to be processed before clearing cart and resetting form
        await Promise.all(salesPromises);
  
        // Reset the cart and form after successful reservation and sales processing
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
  

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      const user_id = customer.id;
      try {
        const response = await axios.get(`https://lolos-place-backend.onrender.com/api/check-payment-status/${user_id}`);
        if (sessionId === response.data.session_id && response.data.payment_status === 'pending') {
          if (isAdvanceOrder) {
            handleReservation();
          } else {
            handleConfirmOrder();
          }
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking payment status:', error.message);
        navigate('/');
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
