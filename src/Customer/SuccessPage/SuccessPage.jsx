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
      const response = await axios.post('http://localhost:5000/api/orders', orderDetails);
  
      if (response.status === 201) {
        const updateStockPromises = cartOrders.map(async ({ menu_id, quantity }) => {
          try {
            const response = await fetch(`http://localhost:5000/menu/update-product-stock/${menu_id}`, {
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
          const productResponse = await axios.get('http://localhost:5000/menu/get-product');
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
              const salesResponse = await axios.post('http://localhost:5000/sales/add-sales', updatedSalesData);
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
      const response = await axios.post('http://localhost:5000/api/reservations', orderDetails);
  
      if (response.status === 201) {
        const updateStockPromises = cartReservations.map(async ({ menu_id, quantity }) => {
          try {
            const response = await fetch(`http://localhost:5000/menu/update-product-stock/${menu_id}`, {
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
          const productResponse = await axios.get('http://localhost:5000/menu/get-product');
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
              const salesResponse = await axios.post('http://localhost:5000/sales/add-sales', updatedSalesData);
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
        const response = await axios.get(`http://localhost:5000/api/check-payment-status/${user_id}`);
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
      <div class="custom-shape-divider-top-1732602286">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill"></path>
        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill"></path>
        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill"></path>
    </svg>
</div>
    <div className="success-page">
      <section className="success-section">
        <h1>Success!</h1>
        <p>Payment Success</p>
      </section>
    </div>
    <div class="custom-shape-divider-bottom-1732602707">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>
    </svg>
</div>
    </section>
    </MainLayout>
  );
};

export default SuccessPage;
