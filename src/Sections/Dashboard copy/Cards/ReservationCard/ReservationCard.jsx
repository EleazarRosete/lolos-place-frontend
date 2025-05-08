import React, { useState, useEffect } from "react";
import styles from './ReservationCard.module.css';

function ReservationCard() {
    const [reservations, setReservations] = useState({
        today: [],
    });
    const [orders, setOrders] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [reservationToCancel, setReservationToCancel] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [modalData, setModalData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [sendModal, setSendModal] = useState(false);




    const sendOrder = async (custEmail, id) => {

        await fetch('https://lolos-place-backend.onrender.com/api/send-confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: custEmail
            })
        });

        try {
            const response = await fetch('https://lolos-place-backend.onrender.com/order/accepted-reservation', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reservation_id: id }),
              });

            if (!response.ok) {
                throw new Error('Failed to accept reservation.');
            }
        
            const result = await response.json(); // Assuming the response is in JSON format
            const { message, data } = result;
        
            if (message === "Reservation accepted.") {
                // Update the state with the accepted reservation
                setReservations(prevState => ({
                    today: prevState.today.map(reservation =>
                        reservation.reservation_id === data.reservation_id
                            ? { ...reservation, acceptance_status: 'accepted' }
                            : reservation
                    ),
                }));
        
                setSendModal(false);  // Close the modal
            } else {
                throw new Error('Unexpected response from server.');
            }
        } catch (err) {
            console.error('Error:', err.message);
            alert('Error accepting reservation. Please try again.');
        }
        

    };
    


    const sendCancelReservation = async (custEmail, fname, lname, guestNum, date, time, id) => {
        
        await fetch('https://lolos-place-backend.onrender.com/api/cancel-reservation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: custEmail,
                customerName: `${fname} ${lname}`,
                reservationDetails: `For guest #${guestNum} on ${date} at ${time}`
            })
        });

        try {
            const response = await fetch('https://lolos-place-backend.onrender.com/order/canceled-reservation', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reservation_id: id }),
              });

            if (!response.ok) {
                throw new Error('Failed to cancel reservation.');
            }
        
            const result = await response.json(); // Assuming the response is in JSON format
            const { message, data } = result;
        
            if (message === "Reservation canceled.") {
                // Update the state with the accepted reservation
                setReservations(prevState => ({
                    today: prevState.today.map(reservation =>
                        reservation.reservation_id === data.reservation_id
                            ? { ...reservation, acceptance_status: 'canceled' }
                            : reservation
                    ),
                }));
                cancelReservation(id);
            } else {
                throw new Error('Unexpected response from server.');
            }
        } catch (err) {
            console.error('Error:', err.message);
            alert('Error accepting reservation. Please try again.');
        }

    };
    






    const getReservations = async () => {
        try {
            const response = await fetch("https://lolos-place-backend.onrender.com/order/get-reservation", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch reservations");
            }
            const jsonData = await response.json();

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayISOString = today.toLocaleDateString('en-CA').split("T")[0];

            const sortedReservations = jsonData.sort((a, b) => new Date(a.reservation_date) - new Date(b.reservation_date));

            const todayReservations = sortedReservations.filter(reservation => {
                // Parse the reservation date in local time and format as "YYYY-MM-DD"
                const reservationDate = new Date(reservation.reservation_date).toLocaleDateString('en-CA');
            
            
                return reservationDate === todayISOString;
            });


            setReservations({
                today: todayReservations,
            });

        } catch (err) {
            setErrorMessage(err.message);
            console.error('Error fetching reservations:', err.message);
        }

        try {
            const response = await fetch("https://lolos-place-backend.onrender.com/order/order-history", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const jsonData = await response.json();
            setOrders(jsonData);
        } catch (err) {
            console.error('Error fetching order history:', err.message);
        }
    };



    const cancelReservation = async (reservation_id) => {
        try {
            const response = await fetch(`https://lolos-place-backend.onrender.com/order/cancel-reservation/${reservation_id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error canceling reservation: ${response.status} - ${errorText}`);
            }

            setReservations(prevState => ({
                today: prevState.today.filter(res => res.reservation_id !== reservation_id),
            }));
            setShowConfirmation(false);
            setSendModal(false);  // Close the modal
        } catch (err) {
            setErrorMessage(err.message);
            console.error('Error canceling reservation:', err.message);
        }
    };



    const formatTime = (timeStr) => {
        const date = new Date(`1970-01-01T${timeStr}Z`); // Parse the time string
        const hours = date.getUTCHours(); // Get the hour in UTC
        const minutes = date.getUTCMinutes(); // Get the minutes in UTC
    
        // Determine AM or PM
        const period = hours >= 12 ? 'PM' : 'AM';
    
        // Convert the hour to 12-hour format
        const hours12 = hours % 12 || 12; // Converts hour 0 to 12 (midnight) and hours > 12 to 12-hour format
        const formattedTime = `${hours12}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
    
        return formattedTime;
    };
    
    
    
    
    
    
    
    

    const formatDate = (timeStr) => {
        
        const date = new Date(timeStr);
    
        // Convert to UTC+8 by adding 8 hours (8 * 60 * 60 * 1000 ms)
        const utc8 = new Date(date.getTime() + 8 * 60 * 60 * 1000);
    
        const months = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
        
        const month = months[utc8.getUTCMonth()];
        const day = utc8.getUTCDate();
        const year = utc8.getUTCFullYear();
    
        return `${month} ${day}, ${year}`;
    };
    
    
    
    
    
    
    
    
    

    const handleCancelClick = (reservation_id) => {
        setReservationToCancel(reservation_id);
        setShowConfirmation(true);
        setShowModal(false);
    };

    const openModal = (reservationDetails) => {
        setModalData(reservationDetails);
        if (reservationDetails.acceptance_status === 'pending') {
            setSendModal(true);
        } else {
            setShowModal(true);
        }
    
        const filteredOrders = orders.filter(o => o.reservation_id === reservationDetails.reservation_id);
        setModalData(prevData => ({ ...prevData, order: filteredOrders }));
    };
    

    const closeModal = () => {
        setShowModal(false);
        setModalData(null);
    };

    useEffect(() => {
        getReservations();
    }, []);

    return (
        <section className={styles.section}>
            <h2 className={styles.txtStyles1}>Today's Reservations</h2>
            {reservations.today.length > 0 ? (
                reservations.today.map(({ reservation_id, first_name, last_name, guest_number, reservation_date, reservation_time,acceptance_status }) => (
                    <div key={reservation_id} className={styles.reservationItem}>
                        <p><strong>Name:</strong> {first_name} {last_name}</p>
                        <p><strong>Reservation Date:</strong> {formatDate(reservation_date)}</p>
                        <p><strong>Reservation Time:</strong> {formatTime(reservation_time)}</p>
                        <button 
                            className={styles.detailsButton}
                            onClick={() => openModal({ reservation_id, guest_number, customer_name: `${first_name} ${last_name}`, reservation_date, acceptance_status })}
                        >
                            View Details
                        </button>
                    </div>
                ))
            ) : (
                <p className={styles.noReservationTxt}>No Reservations Today</p>
            )}  

            {errorMessage && <p className={styles.error}>{errorMessage}</p>}

            {showConfirmation && (
                <div className={styles.confirmationModal}>
                    <div className={styles.modalContent}>
                        <p>Are you sure you want to mark this reservation as completed?</p>
                        <div className={styles.modalButtons}>
                            <button onClick={() => setShowConfirmation(false)} className={styles.cancelReservationProcess}>Cancel</button>
                            <button onClick={() => cancelReservation(reservationToCancel)} className={styles.confirmReservationCancel}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && modalData && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>Reservation Details</h3>
                        <p><strong>Reservation Number:</strong>#{modalData.reservation_id}</p>
                        <p><strong>Customer Name:</strong> {modalData.customer_name}</p>
                        <p><strong>Contact Number:</strong>{orders.find(order => order.reservation_id === modalData.reservation_id)?.phone}</p>
                        <p><strong>Reservation Date:</strong> {formatDate(modalData.reservation_date)}</p>
                        {modalData.order && modalData.order.length > 0 ? (
                            <div>
                                <h4>Order Details</h4>
                                {modalData.order.map(order => (
                                    <div key={order.order_id}>
                                        <p><strong>Order ID:</strong> #{order.order_id}</p>
                                        <ul>
                                            {order.items.map(item => (
                                                <li key={item.menu_name}>{item.menu_name} - {item.order_quantity}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No orders yet!</p>
                        )}
                        <div className={styles.navButtonsReservation}>
                            <button onClick={closeModal} className={styles.closeModalStyles}>Close</button>
                            <button onClick={() => handleCancelClick(modalData.reservation_id)} className={styles.confirmReservationCancel}>Completed</button>
                        </div>
                    </div>
                </div>
            )}



{sendModal && modalData &&(
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>Accept Reservation?</h3>
                        <p className={styles.note}>Accepting will send an email to customer.</p>
                        <div className={styles.navButtonsReservation}>
                        <button 
    onClick={() => sendOrder(
        orders.find(order => order.reservation_id === modalData.reservation_id)?.email, modalData.reservation_id
    )} 
    className={styles.closeModalStyles}
>
    Accept
</button>
<button 
    onClick={() => {
        const reservation = orders.find(order => order.reservation_id === modalData.reservation_id);
        if (reservation) {
            handleCancelClick(
                sendCancelReservation(
                    reservation.email,
                    reservation.first_name,
                    reservation.last_name,
                    reservation.guest_number,
                    reservation.reservation_date,
                    reservation.reservation_time,
                    modalData.reservation_id
                )
            );
        }
    }} 
    className={styles.confirmReservationCancel}
>
    Cancel
</button>
<button 
    onClick={() => {
       setSendModal(false);
    }} 
    className={styles.confirmReservationCancel}
>
    Close
</button>

                        </div>
                    </div>
                </div>
            )}


            
        </section>
    );
}

export default ReservationCard;
