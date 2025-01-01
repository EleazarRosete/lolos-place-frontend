    import React, { useState, useEffect } from "react";
    import styles from './DeliveriesCard.module.css';

    function DeliveriesCard() {
        const [reservations, setReservations] = useState({
            today: [],
            upcoming: []
        });
        const [orders, setOrders] = useState([]);
        const [showConfirmation, setShowConfirmation] = useState(false);
        const [reservationToCancel, setReservationToCancel] = useState(null);
        const [errorMessage, setErrorMessage] = useState("");
        const [modalData, setModalData] = useState(null);
        const [showModal, setShowModal] = useState(false);
    
        const getReservations = async () => {
            try {
                const response = await fetch("http://localhost:5000/order/get-reservation", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch reservations");
                }
                const jsonData = await response.json();
    
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayISOString = today.toISOString().split("T")[0];
    
                const sortedReservations = jsonData.sort((a, b) => new Date(a.reservation_date) - new Date(b.reservation_date));
    
                const todayReservations = sortedReservations.filter(reservation => {
                    const reservationDate = new Date(reservation.reservation_date).toISOString().split("T")[0];
                    return reservationDate === todayISOString;
                });
    
                const upcomingReservations = sortedReservations.filter(reservation => {
                    const reservationDate = new Date(reservation.reservation_date).toISOString().split("T")[0];
                    return reservationDate > todayISOString;
                });
    
                setReservations({
                    today: todayReservations,
                    upcoming: upcomingReservations
                });
            } catch (err) {
                setErrorMessage(err.message);
                console.error('Error fetching reservations:', err.message);
            }
    
            try {
                const response = await fetch("http://localhost:5000/order/order-history", {
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
                const response = await fetch(`http://localhost:5000/order/cancel-reservation/${reservation_id}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                });
    
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error canceling reservation: ${response.status} - ${errorText}`);
                }
    
                setReservations(prevState => ({
                    today: prevState.today.filter(res => res.reservation_id !== reservation_id),
                    upcoming: prevState.upcoming.filter(res => res.reservation_id !== reservation_id),
                }));
                setShowConfirmation(false);
            } catch (err) {
                setErrorMessage(err.message);
                console.error('Error canceling reservation:', err.message);
            }
        };
    
        const formatTime = (timeStr) => {
            const date = new Date(`1970-01-01T${timeStr}`);
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        };
    
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        };
    
        const handleCancelClick = (reservation_id) => {
            setReservationToCancel(reservation_id);
            setShowConfirmation(true);
            setShowModal(false);
        };
    
        const openModal = (reservationDetails) => {
            setModalData(reservationDetails);
            setShowModal(true);
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
                <h2 className={styles.txtStyles}>Upcoming Reservations</h2>
                {reservations.upcoming.length > 0 ? (
                reservations.upcoming.map(({ reservation_id, first_name, last_name, guest_number, reservation_date, reservation_time }) => (
                    <div key={reservation_id} className={styles.reservationItem}>
                        <p><strong>Reservation Date:</strong> {formatDate(reservation_date)}</p>
                        <p><strong>Reservation Time:</strong> {formatTime(reservation_time)}</p>
                        <button 
                            className={styles.detailsButton}
                            onClick={() => openModal({ reservation_id, guest_number, customer_name: `${first_name} ${last_name}`, reservation_date })}
                        >
                            View Details
                        </button>
                    </div>
                ))
            ) : <p className={styles.noReservationTxt}>No Upcoming Reservations</p>}

{errorMessage && <p className={styles.error}>{errorMessage}</p>}

{showConfirmation && (
    <div className={styles.confirmationModal}>
        <div className={styles.modalContent}>
            <p>Are you sure you want to cancel this reservation?</p>
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
            <p><strong>Customer Name:</strong> {modalData.customer_name}</p>
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
                <button onClick={() => handleCancelClick(modalData.reservation_id)} className={styles.confirmReservationCancel}>Cancel Reservation</button>
            </div>
        </div>
    </div>
)}
            </section>
        );
    }

    export default DeliveriesCard;
