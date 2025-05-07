import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import styles from './POS.module.css';
import Product from './Product/Product.jsx';
import Order from './Order/Order.jsx';
import Successful from '../Payment Result/Successful.jsx';
import Failed from '../Payment Result/Failed.jsx';

function POS() {

        const [filteredItems, setFilteredItems] = useState([]);
    
        const [selectedCategory, setSelectedCategory] = useState('All');
        const [selectedSubCategory, setSelectedSubCategory] = useState('');
        const [categories, setCategories] = useState([]);
        const [mainCategories, setMainCategories] = useState([]);

    const navigate = useNavigate();
    const [handleAddNameAndNumberOfPeople, setHandleAddNameAndNumberOfPeople] = useState(false);            
    const [updatedStock, setUpdatedStock] = useState(0);
    const [orderID, setOrderID] = useState();
    const [showModal, setShowModal] = useState(false);
    const [OrderClick, setOrderClick] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [serviceCharge, setServiceCharge] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [products, setProducts] = useState([]);
    const [tableID, setTableID] = useState();
    const [table, setTable] = useState([]);
    const [payment, setPayment] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [orderDetails, setOrderDetails] = useState(false);
    const [GCashDetails, setGCashtDetails] = useState(false);
    const [CashDetails, setCashDetails] = useState(false);
    const [receipt, setReceipt] = useState(false);
    const [receiptPayLater, setReceiptPayLater] = useState(false);
    const [order, setOrder] = useState([]);
    const [input, setInput] = useState('');
    const [change, setChange] = useState('0.00')
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [orderType, setOrderType] = useState(null);
    const [amount, setAmount] = useState(0);
    const [ifDelivery, setIfDelivery] = useState('false');
    const [reservationID, setReservationID] = useState(null);
    const [paymentID, setPaymentID] = useState(null);
    const [isPaid, setIsPaid] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("Lolo's Place");
    const [numberOfPeople, setNumberOfPeople] = useState(1);
    const [showModalPayLater, setShowModalPayLater] = useState(false);
    const [paidOrder, setPaidOrder] = useState({
        mop: '',
        total_amount: '' ,
        delivery: '',
        reservation_id: '',
        order_type: '',
        items: [],
        customer_name: '',
        number_of_people: ''
    });
    const [payLater, setPayLater] = useState({
        mop: '',
        total_amount: '' ,
        delivery: '',
        reservation_id: '',
        order_type: '',
        items: [],
        customer_name: '',
        number_of_people: '',
        ispaid: false,
    });
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
    
    const handleTableChange = (event) => {
        setTableID(event.target.value); // Update state with the selected table_id
        console.log(tableID);
      };

    const calculateServiceCharges = async () => {
        let totalServiceCharge = 0; // Initialize a variable to accumulate service charges
      
        await Promise.all(
          order.map(async (orderedItem) => {
            const product = products.find(p => p.menu_id === orderedItem.menu_id); // Find the product based on menu_id
            if (product) {
              const serviceChargePerItem = product.price * 0.1; // Calculate 10% service charge per item
              totalServiceCharge += serviceChargePerItem * orderedItem.quantity; // Multiply by quantity to get the total service charge for this order
            }
          })
        );
        
        setServiceCharge(totalServiceCharge.toFixed(2)); // Update the state with the accumulated service charge
      };
      
      
      useEffect(() => {
        if (order.length > 0) {
          calculateServiceCharges();
        }
      }, [order]);

    const handleOpenModal = () => {
        setShowModal(true); // Open the confirmation modal
        ifPaid();
      };
    
      const handleOpenModalPayLater = () => {
        setShowModalPayLater(true); // Open the confirmation modal
        ifPaid();
      };

      const handleCloseModal = () => {
        setShowModal(false); // Close the modal without submitting
        setShowModalPayLater(false); // Close the modal without submitting

      };

      const handleCloseModal1 = () => {
        setReceipt(false);
        setReceiptPayLater(false);
        setPaidOrder([]);
        setOrder([]);
        setSalesData([]);
        setPayLater([]);
      };
      
      
      const handleConfirmPayment = () => {
        submitOrder(); // Proceed with the order submission
        setShowModal(false); // Close the modal after submitting
      };

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        items: [''],
        img: '',
        stocks: '',
    });

    
    const handlePaymentAmount = (paymentAmount) => {
        const totalAmount = 
          order.reduce((total, item) => total + item.total, 0) + parseFloat(serviceCharge);
      
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
          alert("Please enter a valid payment amount.");
          return null;
        }
      
        if (paymentAmount < totalAmount) {
            const change = (paymentAmount - totalAmount).toFixed(2);
            setChange(change);
          return null;
        }
      
        const change = (paymentAmount - totalAmount).toFixed(2);
      
        setChange(change);
        return change;
      };
      
      const handlePaymentInputChange = (event) => {
        const paymentAmount = parseFloat(event.target.value);
        if (!isNaN(paymentAmount)) {
          handlePaymentAmount(paymentAmount);
        }
      };
      
      const handleProceedButtonClick = () => {
        const paymentInput = document.querySelector('input[placeholder="Payment Amount"]');
        const paymentAmount = parseFloat(paymentInput.value);
      
        const change = handlePaymentAmount(paymentAmount);
      
        if (change !== null) {
          handleOpenModal();
        }
      };
      

    const handleClick = (value) => {
        setInput((prevInput) => prevInput + value);
    };

    const handleClear = () => {
        setInput('');
    };

    const handleCalculate = () => {
        try {
            setInput(eval(input).toString()); 
            setChange(eval(input).toString());// eval evaluates the expression
        } catch (error) {
            setInput('Error');
        }
    };

        const getProducts = async () => {
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
            setFilteredItems(sortedData);
            extractCategories(sortedData);
                setProducts(sortedData);
                setFilteredProducts(sortedData);
            } catch (err) {
                console.error('Error fetching products:', err.message);
            }
        };


  const getTable = async () => {
            try {
                const response = await fetch("http://localhost:10000/table/get-table", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const jsonData = await response.json();
    
    
                setTable(jsonData);
            } catch (err) {
                console.error('Error fetching table:', err.message);
            }
        };


      useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await getProducts();
        await getTable();
      } catch (err) {
        setError('An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
    
    useEffect(() => {
        const getCategories = async () => {
            try {
                const response = await fetch("http://localhost:10000/menu/get-categories", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const jsonData = await response.json();
                setCategories(jsonData);
            } catch (err) {
                console.error('Error fetching categories:', err.message);
            }
        };

        getCategories();
    }, []);

    const handleSortByCategory = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);

        if (category === "All" || category === "") {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter(product => product.category === category);
            setFilteredProducts(filtered);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            const filtered = products.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProducts(filtered);
        }, 100);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, products]);

    const handleIsOrderClick = () => {
        setOrderClick(prevState => !prevState);
    };
    

    const addToOrder = (menu_id, name, price, stocks, orderQuantity, fromMinus) => {


        
        setOrder(prevOrder => {
            const existingOrderItem = prevOrder.find(item => item.menu_id === menu_id);
    
            if (existingOrderItem) {
                return prevOrder.map(item =>
                    item.menu_id === menu_id
                        ? {
                            ...item,
                            quantity: orderQuantity, // Directly use orderQuantity
                            total: orderQuantity * item.price
                        }
                        : item
                );
            } else {
                return [
                    ...prevOrder,
                    { menu_id, name, price, stocks, quantity: orderQuantity, total: price * orderQuantity }
                ];
            }
        });
    
        console.log("pos", order);
    };
    
    
    
    const modifyOrder = (menu_id, name, price, stocks, quantity) => {
        setOrder(prevOrder => {
            const existingOrderItem = prevOrder.find(item => item.menu_id === menu_id);
    
            if (existingOrderItem) {
                // Update the quantity and total without adding to the previous quantity
                return prevOrder.map(item =>
                    item.menu_id === menu_id
                        ? {
                            ...item,
                            quantity: quantity,  // Use the received quantity directly
                            total: quantity * price // Calculate the total with the new quantity
                        }
                        : item
                );
            } else {
                // Add a new item with the given quantity and calculated total
                return [
                    ...prevOrder,
                    { menu_id, name, price, stocks, quantity, total: price * quantity }
                ];
            }
        });
    };

    
    const handleCancelOrder = () => {
        setOrderDetails(false);
        setOrderType(null);
        setPaymentMethod(null);
    };

    const placeOrder = async () => {
        if (order.length > 0) {
            setOrderDetails(true);
        } else {
            alert('No items in the order!');
        }
    };


    const submitOrder = async () => {
       
            setShowModal(false);
        if (isPaid && !loading) {  // Check if the order is paid and not already loading
            setLoading(true);  // Set loading state to true to block subsequent clicks
            setInput('');  // Reset input field
                


            const paidOrder = {
                mop: paymentMethod,
                total_amount: amount,
                delivery: ifDelivery === 'true',
                reservation_id: reservationID,
                order_type: orderType,
                items: order,
                customer_name: name,
                number_of_people: numberOfPeople,
                ispaid: true,
                table_id:tableID,
            };
    
            try {
                const updateStockPromises = order.map(async ({ menu_id, quantity }) => {
                    const response = await fetch(`http://localhost:10000/menu/update-product-stock/${menu_id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ quantity })
                    });
                    if (!response.ok) throw new Error(`Error updating stock: ${response.statusText}`);
                    setProducts(prevProducts =>
                        prevProducts.map(product =>
                            product.menu_id === menu_id ? { ...product, stocks: product.stocks - quantity } : product
                        )
                    );



                });
    
                // Wait for all stock updates to complete
                await Promise.all(updateStockPromises);
    
                // Add the order to the server
                const response = await fetch(`http://localhost:10000/order/add-order`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(paidOrder),
                });
                
                console.log("Response Status:", response.status);  // Check the response status
                
                if (!response.ok) {
                    const errorText = await response.text(); // Get the response text to debug
                    console.log("Error response:", errorText);  // Log the raw response body
                    throw new Error(`Error adding order: ${response.statusText}`);
                }
                
                const data = await response.json(); // Parse the response body
                console.log("Response Data:", data);  // Log the parsed response
                
    setOrderID(data.orderId);
    console.log("Added Orders with ID:", data.orderId);
                
                const salesPromises = order.map(async (orderedItem, i) => {
                    const product = products.find(p => p.menu_id === orderedItem.menu_id);
                    console.log(product.price);
                    console.log(product.name);
                    console.log(product.price);



                    if (product) {
                        const price = parseFloat(product.price) || 0;
                        console.log("PROCEEEE", price);
                        const updatedSalesData = {
                            ...salesData,
                            amount: parseFloat((orderedItem.quantity * price).toFixed(2)),
                            service_charge: parseFloat((price * 0.1).toFixed(2)),
                            gross_sales: parseFloat((price + price * 0.1)*orderedItem.quantity.toFixed(2)),
                            product_name: product.name,
                            category: product.category,
                            quantity_sold: orderedItem.quantity,
                            price_per_unit: parseFloat(price.toFixed(2)),
                            mode_of_payment: paymentMethod,
                            order_type: orderType,
                        };
                        console.log("Updated Sales Data for index ", i, updatedSalesData);
                        

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

                    }
                });
                
                await Promise.all(salesPromises);
                
                
    
                // Reset order-related states
                setAmount(0);
                setIfDelivery('false');
                setReservationID(null);
                setOrderType(null);
                setPaymentMethod(null);
                setOrderDetails(false);
                setCashDetails(false);
                setReceipt(true);
                setIsPaid(false);
            } catch (err) {
                console.error('Error processing order:', err.message);
                alert('There was an error processing your order. Please try again.');
            } finally {
                setLoading(false);  // Reset loading state
            }
        } else {
            alert("The order must be paid before proceeding");
        }
    };


    const submitOrderPayLater = async () => {
       
        setShowModal(false);
    if (isPaid && !loading) {  // Check if the order is paid and not already loading
        setLoading(true);  // Set loading state to true to block subsequent clicks
        setInput('');  // Reset input field
            


        const payLater = {
            mop: paymentMethod,
            total_amount: amount,
            delivery: ifDelivery === 'true',
            reservation_id: reservationID,
            order_type: orderType,
            items: order,
            customer_name: name,
            number_of_people: numberOfPeople,
            ispaid: false,
            table_id:tableID,
        };

        try {
            const updateStockPromises = order.map(async ({ menu_id, quantity }) => {
                const response = await fetch(`http://localhost:10000/menu/update-product-stock/${menu_id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ quantity })
                });
                if (!response.ok) throw new Error(`Error updating stock: ${response.statusText}`);
                setProducts(prevProducts =>
                    prevProducts.map(product =>
                        product.menu_id === menu_id ? { ...product, stocks: product.stocks - quantity } : product
                    )
                );
            });

            // Wait for all stock updates to complete
            await Promise.all(updateStockPromises);

            const response = await fetch(`http://localhost:10000/order/add-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payLater),
            });
            
            console.log("Response Status:", response.status);  // Check the response status
            
            if (!response.ok) {
                const errorText = await response.text(); // Get the response text to debug
                console.log("Error response:", errorText);  // Log the raw response body
                throw new Error(`Error adding order: ${response.statusText}`);
            }
            
            const data = await response.json(); // Parse the response body
            console.log("Response Data:", data);  // Log the parsed response
            
setOrderID(data.orderId);
console.log("Added Orders with ID:", data.orderId);

            

            const orderedItem = order[0];
            if (!orderedItem) {
                console.error("No ordered item found.");
                return;
            }
        
            const product = products.find((p) => p.menu_id === orderedItem.menu_id);
            if (!product) {
                console.error("No product found for menu_id:", orderedItem.menu_id);
                return;
            }
        
            const price = parseFloat(product?.price) || 0; // Ensure price is a valid number
            const updatedSalesData = {
                amount: parseFloat((orderedItem.quantity * price).toFixed(2)),
                service_charge: parseFloat((price * 0.1).toFixed(2)),
                gross_sales: parseFloat((price + price * 0.1) * orderedItem.quantity),
                product_name: product.name,
                category: product.category,
                quantity_sold: orderedItem.quantity,
                price_per_unit: parseFloat(price.toFixed(2)),
                mode_of_payment: paymentMethod,
                order_type: orderType,
    
            };
        

            // Reset order-related states
            setAmount(0);
            setIfDelivery('false');
            setReservationID(null);
            setOrderType(null);
            setPaymentMethod(null);
            setOrderDetails(false);
            setCashDetails(false);
            setShowModalPayLater(false);
            setReceiptPayLater(true);
            setIsPaid(false);
        } catch (err) {
            console.error('Error processing order:', err.message);
            alert('There was an error processing your order. Please try again.');
        } finally {
            setLoading(false);  // Reset loading state
        }
    } else {
        alert("The order must be paid before proceeding");
    }
};

    
    const handleOpenModalOrders = () => {
        console.log("THIS IS UPDATED",name,numberOfPeople);
        handleGCashPayment();
        setCashDetails(false);
        setOrderDetails(true);
    }
    
    const handleGCashPayment = async () => {
        const admin = 14;
      
        // Removed the add order call; assume orderID is already defined
        // const paidOrder = { ... } and add order API call removed
      
        const orderedItem = order[0];
        if (!orderedItem) {
          console.error("No ordered item found.");
          return;
        }
      
        const product = products.find((p) => p.menu_id === orderedItem.menu_id);
        if (!product) {
          console.error("No product found for menu_id:", orderedItem.menu_id);
          return;
        }
      
        const price = parseFloat(product?.price) || 0; // Ensure price is a valid number
        const updatedSalesData = {
          amount: parseFloat((orderedItem.quantity * price).toFixed(2)),
          service_charge: parseFloat((price * 0.1).toFixed(2)),
          gross_sales: parseFloat(((price + price * 0.1) * orderedItem.quantity).toFixed(2)),
          product_name: product.name,
          category: product.category,
          quantity_sold: orderedItem.quantity,
          price_per_unit: parseFloat(price.toFixed(2)),
          mode_of_payment: paymentMethod,
          order_type: orderType,
        };
      
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
                lineItems: order.map((product) => ({
                  quantity: product.quantity,
                  name: product.name,
                  price: (
                    parseFloat(product.price) +
                    parseFloat(product.price) * 0.1
                  ).toFixed(2),
                })),
                orderId: orderID, // Assumes orderID is already available
                from: "pos",
              }),
            }
          );
      
          if (!checkoutResponse.ok) {
            throw new Error(`HTTP error! status: ${checkoutResponse.status}`);
          }
      
          const checkoutData = await checkoutResponse.json();
          const { url } = checkoutData;
      
          if (!url) {
            console.error("No URL received from the API:", checkoutData);
            return;
          }
      
          // Step 2: Add data to temp_data table
          const tempDataResponse = await fetch(
            "http://localhost:10000/order/add-temp-data",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                order: order, // Send the order data as text[]
                salesdata: [JSON.stringify(updatedSalesData)], // Send sales data as text[]
                paidorder: [
                  JSON.stringify({
                    orderID: orderID,
                    mop: paymentMethod,
                    total_amount: amount,
                    delivery: ifDelivery === "true",
                    reservation_id: reservationID,
                    order_type: orderType,
                    items: order,
                    customer_name: name,
                    number_of_people: numberOfPeople,
                    ispaid: true,
                  }),
                ], // Send paid order as text[]
              }),
            }
          );
      
          if (!tempDataResponse.ok) {
            throw new Error(`Error adding temp data! status: ${tempDataResponse.status}`);
          }
      
          const tempDataResponseData = await tempDataResponse.json();
          console.log("Temporary data added successfully:", tempDataResponseData);
      
          // Step 3: Redirect to the payment provider
          window.location.href = url; // Redirect to the GCash payment provider
        } catch (error) {
          console.error("Error during payment and data addition:", error);
        }
      };
      

    const processOrder = () => {
        const serviceCharge = order.reduce((total, item) =>(total + item.total) * 0.1, 0);
        const total = order.reduce((total, item) => total + item.total, 0) + serviceCharge;
        setAmount(total);
        


        // setAmount(total);
        console.log("mop", paymentMethod, "OT",orderType, 'amount', amount, order);

        if(paymentMethod == null || orderType == null){
            alert("Select a payment method and order type")
        }
        else{

                if(paymentMethod == "GCash"){
                    setHandleAddNameAndNumberOfPeople(true);
                }
                else if(paymentMethod == "Paylater"){
                    handleOpenModalPayLater();
                }
                else{
                    setGCashtDetails(false);
                    setCashDetails(true);
                    setOrderDetails(false);
                }
             
        }
    }
    
const handleQuantityByOrder = async (id,orderQuantity)=>{
    if (!id) {
        console.error("Error: Menu ID is missing.");
        return;
    }

    setOrder(prevOrder =>
        prevOrder.map(item =>
            item.menu_id === id
                ? { ...item, quantity: orderQuantity-1, total: orderQuantity * item.price }
                : item
        )
    );
}

const handleRemoveFromCart = (menu_id) => {
    setOrder(prevOrder => prevOrder.filter(item => item.menu_id !== menu_id));
};


     const handleCancelPayment = () => {
        setCashDetails(false);
        setGCashtDetails(false);
        setOrderDetails(true);  
        setChange('0.00');
        setInput('');
    };

    const selectPaymentMethod = (e) => {
        setPaymentMethod(e.target.value)
    }

    const selectOrderType = (e) => {
        setOrderType(e.target.value)
        console.log(orderType);
    }

    const ifPaid = () =>{
        setIsPaid(true); 
    }






    const extractCategories = (products) => {
        const uniqueCategories = [...new Set(products.map(item => item.main_category))];
        setMainCategories(uniqueCategories);
    };


    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);
        setSelectedSubCategory(''); // reset sub-category when category changes
        const filteredMainCategories = products.filter(product => product.main_category === category);
        setCategories([...new Set(filteredMainCategories.map(item => item.category))]);
        console.log("KEFKE", categories);

    };

    // Handle sub-category change
    const handleSubCategoryChange = (e) => {
        setSelectedSubCategory(e.target.value);
    };


 useEffect(() => {
        let filtered = products;
    
        // Filter by main category
        if (selectedCategory !== "All") {
            filtered = filtered.filter(item => item.main_category === selectedCategory);
        }
    
        // Filter by sub-category only if a valid sub-category is selected
        if (selectedSubCategory && selectedSubCategory !== "All") {
            filtered = filtered.filter(item => item.category === selectedSubCategory);
        }
    
        // Set the filtered results
        setFilteredItems(filtered);
    }, [selectedCategory, selectedSubCategory, products]);
    
    




    return (
        <section className={styles.section}>
            <div className={styles.posContainer}>
                <div className={styles.navbar}>
                    <form className={styles.forms}>
                        <div className={styles.searchContainer}>
                        <input
    type="text"
    className={styles.searchBar}
    placeholder="Search..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    onKeyDown={(e) => {
        if (e.key === 'Enter') {
            e.preventDefault();  // Disable Enter key action
        }
    }}
/>

                        </div>

                        <div className={styles.POSFilterContainer}>
   <select
                className={styles.InventoryCategory}
                value={selectedCategory}
                onChange={handleCategoryChange}
            >
                <option value="All">All</option>
                {mainCategories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                ))}
            </select>

            {selectedCategory !== 'All' && (
                <select
                    className={styles.InventoryCategory}
                    value={selectedSubCategory}
                    onChange={handleSubCategoryChange}
                >
                    <option value="">All</option>
                    {categories.map((subCategory, index) => (
                        <option key={index} value={subCategory}>{subCategory}</option>
                    ))}
                </select>
            )}
                        </div>


                    </form>
                </div>

                <div className={styles.menuContainer}>
                    <div className={styles.productContainer}>
                        {filteredItems.length > 0 ? (
                            filteredItems.map(product => (
                                <Product
                                    key={product.menu_id}
                                    menu_id={product.menu_id}
                                    name={product.name}
                                    price={product.price}
                                    image={product.img}
                                    description={product.description}
                                    items={product.items}
                                    stock={product.stocks}
                                    onAddToOrder={addToOrder}
                                    updateStock={setUpdatedStock}
                                    number={quantity}
                                    order={order}
                                    setIsOrderClicked={handleIsOrderClick}
                                    isOrderClicked={OrderClick}
                                    onRemove={handleRemoveFromCart}
                                    orders={order}
                                />
                            ))
                        ) : (
                            <p className={styles.pText}>No products found</p>
                        )}
                    </div>
                </div>

                <div className={styles.orderContainer}>
                    <h1 className={styles.orderTxt}>ORDERS</h1>
                    <div className={styles.orders}>
                        {order.length > 0 ? (
                            order.map((orders, index) => (
                                <Order
                                    key={orders.menu_id}
                                    id={orders.menu_id}
                                    name={orders.name}
                                    price={orders.price}
                                    stock={orders.stocks-orders.quantity}
                                    order={orders.quantity}    
                                    total={orders.total}
                                    onAddToOrder={modifyOrder}
                                    onRemove={handleRemoveFromCart}
                                    index={index}
                                    updateStock={setUpdatedStock}
                                    updatedQuantityByOrder={handleQuantityByOrder}
                                    isOrderClicked={handleIsOrderClick}

                                />
                            ))
                        ) : (
                            <p className={styles.pText}>No orders yet</p>
                        )}
                    </div>

                    <button className={styles.placeOrder} onClick={placeOrder}>
                        Place Order
                    </button>
                </div>
            </div>

            {orderDetails && (
                <div className={styles.modalPOS}>
                <div className={styles.orderDetails}>
                    <h2 className={styles.orderDetailsHeader}>Order Summary</h2>

                    <div className={styles.orderItems}>
                        {order.length > 0 ? (
                            order.map((orders, index) => (
                                <div key={orders.menu_id} className={styles.orderItem}>
                                    <p><strong>{orders.name}</strong></p>
                                    <p>Qty: {orders.quantity}</p>
                                    <p>Price: ₱{orders.price}</p>
                                    <p>Subtotal: ₱{orders.total}</p>
                                    <p>Servive charge: 10%</p>
                                </div>
                            ))
                        ) : (
                            <p className={styles.pText}>No orders yet</p>
                        )}
                    </div>
 
                    <h3 className={styles.totalAmount} >Total Amount: ₱{order.reduce((total, item) => total + item.total, 0)}</h3>
                    <div className={styles.paymentOptions}>
                        <label>
                            <input type="radio" name="payment" value="GCash" checked={paymentMethod === 'GCash'}
                    onClick={selectPaymentMethod} /> GCash
                        </label>
                        <label>
                            <input type="radio" name="payment" value="Cash" checked={paymentMethod === 'Cash'}
                    onClick={selectPaymentMethod}/> Cash
                        </label>
                        <label>
                            <input type="radio" name="payment" value="Paylater" checked={paymentMethod === 'Paylater'}
                    onClick={selectPaymentMethod}/> Pay later
                        </label>
                    </div>
                    

                    <div className={styles.additionalOptions}>
                    <label>
                            <input type="radio" name="order" value="Dine-in" checked={orderType === 'Dine-in'}
                    onClick={selectOrderType}/> Dine-in
                        </label>
                        <label>
                            <input type="radio" name="order" value="Take-out" checked={orderType === 'Take-out'}
                    onClick={selectOrderType}/> Take-out
                        </label>

                    </div>
                    <select 
  className={styles.selectTableDesign} 
  onChange={handleTableChange} 
  value={tableID} 
  disabled={orderType === 'Take-out'}
>
  {table.map((table) => (
    <option key={table.table_id} value={table.table_id}>
      {table.table_name}
    </option>
  ))}
</select>

                        <div className={styles.navOrderDetailButtons}>
                        <button className={styles.cancelOrderButton} onClick={handleCancelOrder}>
                        Cancel
                    </button>
                        <button className={styles.confirmOrderButton} onClick={processOrder}>
                        Confirm Order
                    </button>

                        </div>

                </div>
                </div>
            )}



{CashDetails && paymentMethod && (
    <div className={styles.modalPOS}>
        <div className={styles.paymentDetails}>
            <h1 className={styles.cashHeader}>Cash Payment</h1>
            <div className={styles.contentContainer}>

                <div className={styles.details}>
                    <div className={styles.paymentInfo}>
                        <div className={styles.customerDetails}>
                        <label>Username:
                        <input
                            type="text"
                            placeholder="Enter your name"
                            required
                            onChange={(e) => setName(e.target.value)} // Assuming you have a setter function for name           
                            value={name}
                            className={styles.inputBox}
                        />
                        </label>
                                                <label># of pax:
                        <input
                            type="number"
                            placeholder="Number of people"
                            required
                            onChange={(e) => setNumberOfPeople(e.target.value)} // Assuming you have a setter function for number of people
                            value={numberOfPeople}
                            className={styles.inputBox}

                        />
                        </label>
                        </div>
                        <label className={styles.inputBoxx}
                        >Enter Amount:
                        <input
                            type="number"
                            placeholder="Payment Amount"
                            onChange={handlePaymentInputChange}
                            min="1"
                            className={styles.paymentAmount}
                        />
                        </label>
                        <h1 className={styles.headerPayment}>Order Items:</h1>
                        <div className={styles.orderItems}>
                            {order.length > 0 ? (
                                order.map((orders, index) => (
                                    <div key={orders.menu_id} className={styles.orderItem}>
                                        <p className={styles.txtStyles}><strong>{orders.name}</strong></p>
                                        <p>Qty: {orders.quantity}</p>
                                        <p>Price: ₱{orders.price}</p>
                                        <p>Subtotal: ₱{orders.total}</p>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.pText}>No orders yet</p>
                            )}
                        </div>
                        <h3 className={styles.sum}>
                            Order Total: ₱{order.reduce((total, item) => total + item.total, 0).toFixed(2)}
                        </h3>
                        <h3 className={styles.sum}>
                            Service charge(10%): ₱{serviceCharge}
                        </h3>
                        <h3 className={styles.sum1}>
                            Total Amount: ₱{
                                (order.reduce((total, item) => total + item.total, 0) + parseFloat(serviceCharge)).toFixed(2)
                            }
                        </h3>
                        <h3 className={styles.sum1}>Change: ₱{change}</h3>
                    </div>

                    <div className={styles.navButton}>
                        <button className={styles.cancelPaymentButton} onClick={handleCancelPayment}>CANCEL</button>
                        <button 
                            onClick={handleOpenModal} 
                            className={styles.cancelPaymentButton}
                            disabled={!name || !numberOfPeople} // Disable the button if either name or numPeople is empty
                        >
                            PROCEED
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
)}

                {receipt && (
                    <div className={styles.modalPOS}>

                    <div className={styles.orderReceipt}>
                        <h1>Successful!</h1>
                        <button className={styles.handleCloseModal1} onClick={handleCloseModal1}>Close</button>
                    </div>
                    </div>

                )}

{receiptPayLater && (
                    <div className={styles.modalPOS}>

                    <div className={styles.orderReceipt}>
                        <h1>Successful!</h1>
                        <button className={styles.handleCloseModal1} onClick={handleCloseModal1}>Close</button>
                    </div>
                    </div>

                )}
    

                      {/* Modal for confirmation */}
      {showModal && (
        <div className={styles.modalPOS}>
          <div className={styles.modalConfirmation}>
            <h2 className={styles.modalH2}>Confirm Payment</h2>
            <p  className={styles.modalP}>Are you sure you want to proceed with the payment?</p>
            <div className={styles.modalButtons}>
              <button onClick={handleCloseModal} className={styles.cancelModalConfirmation}>CANCEL</button>
              <button onClick={submitOrder } disabled={loading} className={styles.cancelModalConfirmation}>CONTINUE</button>
            </div>
          </div>
        </div>
      )}

{showModalPayLater && (
        <div className={styles.modalPOS}>
          <div className={styles.modalConfirmation}>
            <h2 className={styles.modalH2}>Confirm Pay Later</h2>
            <p  className={styles.modalP}>Are you sure you want to proceed to pay later?</p>
            <div className={styles.modalButtons}>
              <button onClick={handleCloseModal} className={styles.cancelModalConfirmation}>CANCEL</button>
              <button onClick={submitOrderPayLater } disabled={loading} className={styles.cancelModalConfirmation}>CONTINUE</button>
            </div>
          </div>
        </div>
      )}


{handleAddNameAndNumberOfPeople && (
    <div className={styles.modalPOS}>
        <div className={styles.modalConfirmation1}>
            <label>Enter username:</label>
            <input
                type="text"
                placeholder="Enter your name"
                required
                onChange={(e) => setName(e.target.value)} // Assuming you have a setter function for name
                value={name}
            />
                        <label>Number of pax:</label>

            <input
                type="number"
                placeholder="Number of people"
                required
                onChange={(e) => setNumberOfPeople(e.target.value)} // Assuming you have a setter function for number of people
                value={numberOfPeople}
            />
            <div className={styles.navButtonForGcash}>
            <button className={styles.cancelPaymentButton} onClick={()=> {setHandleAddNameAndNumberOfPeople(false)}}>CANCEL</button>
                        <button 
                            onClick={handleOpenModalOrders} 
                            className={styles.cancelPaymentButton}
                            disabled={!name || !numberOfPeople} // Disable the button if either name or numPeople is empty
                        >
                            PROCEED
                        </button>
            </div>
                                  
        </div>
    </div>
)}



      <Routes>
        <Route path="successful" element={<Successful orderID/>} />
        <Route path="failed" element={<Failed orderID/>} />
      </Routes>
        </section>
    );
}

export default POS;
