import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import styles from "./AdminSettings.module.css";
import axios from "axios";

function Admin() {
    const [selectedRole, setSelectedRole] = useState("admin");

    const [adminData, setAdminData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        oldPassword: "",
        password: "",
        newPassword: "",  
        confirmPassword: ""  
    });

    const [cashierData, setCashierData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        oldPassword: "",
        newPassword: "",  
        confirmPassword: ""  
    });

    const [kitchenData, setKitchenData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        oldPassword: "",
        newPassword: "",  
        confirmPassword: ""  
    });

    const navigate = useNavigate();

    useEffect(() => {
        // Fetch Admin Data
        fetch('http://localhost:10000/user/get-user?id=14')
            .then(response => response.json())
            .then(data => {
                setAdminData({
                    firstName: data.first_name || "",
                    lastName: data.last_name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    password: data.password || "",
                    newPassword: "",  // This should remain empty initially until the user enters a new password
                    confirmPassword: "" // This should remain empty initially until the user enters a new password
                });
            })
            .catch(error => console.error("Error fetching admin data:", error));
        
        // Fetch Cashier Data
        fetch('http://localhost:10000/user/get-user?id=13')
            .then(response => response.json())
            .then(data => {
                setCashierData({
                    firstName: data.first_name || "",
                    lastName: data.last_name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    password: data.password || "",
                    newPassword: "",  // Same here, initially empty
                    confirmPassword: "" // Same here, initially empty
                });
            })
            .catch(error => console.error("Error fetching cashier data:", error));

                    // Fetch Kitchen Data
        fetch('http://localhost:10000/user/get-user?id=55')
        .then(response => response.json())
        .then(data => {
            setKitchenData({
                firstName: data.first_name || "",
                lastName: data.last_name || "",
                email: data.email || "",
                phone: data.phone || "",
                address: data.address || "",
                password: data.password || "",
                newPassword: "",  // This should remain empty initially until the user enters a new password
                confirmPassword: "" // This should remain empty initially until the user enters a new password
            });
        })
        .catch(error => console.error("Error fetching admin data:", error));
    }, []);
    
    
    const handleChange = (e, section) => {
        const { name, value } = e.target;
    
        if (section === "admin") {
            setAdminData(prevState => ({
                ...prevState,
                [name]: value || ""  // Ensure it's never undefined
            }));
        } else if (section === "cashier") {
            setCashierData(prevState => ({
                ...prevState,
                [name]: value || ""  // Ensure it's never undefined
            }));
        }
    };
    
    
    const handleSave = async () => {
        let passwordsMatch = true; // Flag to track password mismatch
        console.log("OLD PASS A", adminData.oldPassword);
        console.log("OLD PASS C", cashierData.oldPassword);
        console.log("OLD PASS K", kitchenData.oldPassword);


        // Check if passwords match
        if (adminData.newPassword || cashierData.newPassword || kitchenData.newPassword) {
            if (adminData.newPassword !== adminData.confirmPassword || cashierData.newPassword !== cashierData.confirmPassword || kitchenData.newPassword !== kitchenData.confirmPassword) {
                alert("New password and confirm password do not match.");
                passwordsMatch = false; // Set flag to false
            }
        }
    
        try {
            // Proceed with password save if passwords match
            if (passwordsMatch) {
                const requests = [];
            
                if (adminData.newPassword) {
                    const adminPayload = {
                        userId: 14,
                        oldPassword: adminData.oldPassword,
                        newPassword: adminData.newPassword,
                        confirmPassword: adminData.confirmPassword
                    };
                    console.log("ADMIN TO", adminPayload);
                    
                    // Add the admin password update request to the requests array
                    requests.push(fetch('http://localhost:10000/user/update-password', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(adminPayload)
                    }));
                }
            
                if (cashierData.newPassword) {
                    const cashierPayload = {
                        userId: 13,
                        oldPassword: cashierData.oldPassword,
                        newPassword: cashierData.newPassword,
                        confirmPassword: cashierData.confirmPassword
                    };
                    console.log("CASHIER TO", cashierPayload);
            
                    // Add the cashier password update request to the requests array
                    requests.push(fetch('http://localhost:10000/user/update-password', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(cashierPayload)
                    }));
                }
            
                // Wait for both requests to complete
                try {
                    const responses = await Promise.all(requests);
            
                    // Handle response for admin
                    const responseAdmin = responses[0];
                    if (!responseAdmin.ok) {
                        alert('Failed to update admin password.');
                    }
            
                    // Handle response for cashier if it exists
                    const responseCashier = responses[1];
                    if (responseCashier && !responseCashier.ok) {
                        alert('Failed to update cashier password.');
                    }
                } catch (error) {
                    alert('Error occurred while updating passwords.');
                }
            }
            
    
            // Update admin and cashier data
            const updatedAdminData = {
                address: adminData.address,
                email: adminData.email,
                first_name: adminData.firstName,
                last_name: adminData.lastName,
                password: adminData.newPassword || adminData.password, // Only include password if it's updated
                phone: adminData.phone,
                user_id: 14
            };
    
            const updatedCashierData = {
                address: cashierData.address,
                email: cashierData.email,
                first_name: cashierData.firstName,
                last_name: cashierData.lastName,
                password: cashierData.newPassword || cashierData.password, // Only include password if it's updated
                phone: cashierData.phone,
                user_id: 13
            };

            const updatedKitchenData = {
                address: cashierData.address,
                email: cashierData.email,
                first_name: cashierData.firstName,
                last_name: cashierData.lastName,
                password: cashierData.newPassword || cashierData.password, // Only include password if it's updated
                phone: cashierData.phone,
                user_id: 55
            };

            // Update user data if fields are not empty
            if (adminData.firstName !== "" || adminData.email !== "" || adminData.phone !== "" || adminData.address !== "") {
                const responseAdmin = await fetch('http://localhost:10000/user/update-user', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedAdminData)
                });
    
                const responseCashier = await fetch('http://localhost:10000/user/update-user', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedCashierData)
                });
    
                if (responseAdmin.ok && responseCashier.ok) {
                    navigate('/admin');
                } else {
                    alert("Failed to update user data.");
                }

                const responseKitchen = await fetch('http://localhost:10000/user/update-user', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedKitchenData)
                });
    
                if (responseAdmin.ok && responseCashier.ok && responseKitchen.ok) {
                    navigate('/admin');
                } else {
                    alert("Failed to update user data.");
                }
            }
        } catch (error) {
            console.error("Error updating user data:", error);
            alert("An error occurred while updating.");
        }
    };
    
    const handleCancel = () => {
        navigate('/admin');
    };


    const roleData = {
        admin: adminData,
        cashier: cashierData,
        kitchen: kitchenData,
    };



    return (
        <section className={styles.section}>
            <h2>Account Settings</h2>
            <div className={styles.accountSettingContainer}>
                <div className={styles.selectAccount}>
                    <button onClick={() => setSelectedRole("admin")}>Admin Setting</button>
                    <button onClick={() => setSelectedRole("cashier")}>Cashier Setting</button>
                    <button onClick={() => setSelectedRole("kitchen")}>Kitchen Setting</button>
                </div>
                <div className={styles.accountSetting}>
                    <h3>{selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Settings</h3>
                    <label>First Name:</label>
                    <input 
                        type="text" 
                        name="firstName" 
                        value={roleData[selectedRole].firstName} 
                        onChange={(e) => handleChange(e, selectedRole)} 
                    />
                    <label>Last Name:</label>
                    <input 
                        type="text" 
                        name="lastName" 
                        value={roleData[selectedRole].lastName} 
                        onChange={(e) => handleChange(e, selectedRole)} 
                    />
                    <label>Change Email:</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={roleData[selectedRole].email} 
                        onChange={(e) => handleChange(e, selectedRole)} 
                    />
                    <label>Change Phone:</label>
                    <input 
                        type="tel" 
                        name="phone" 
                        value={roleData[selectedRole].phone} 
                        onChange={(e) => handleChange(e, selectedRole)} 
                    />
                    <label>Old Password:</label>
                    <input 
                        type="password" 
                        name="oldPassword" 
                        value={roleData[selectedRole].oldPassword} 
                        onChange={(e) => handleChange(e, selectedRole)} 
                    />
                    <label>New Password:</label>
                    <input 
                        type="password" 
                        name="newPassword" 
                        value={roleData[selectedRole].newPassword} 
                        onChange={(e) => handleChange(e, selectedRole)} 
                    />
                    <label>Confirm New Password:</label>
                    <input 
                        type="password" 
                        name="confirmPassword" 
                        value={roleData[selectedRole].confirmPassword} 
                        onChange={(e) => handleChange(e, selectedRole)} 
                    />
                    <div className={styles.buttons}>
                        <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
                        <button className={styles.saveBtn} onClick={handleSave}>Save</button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Admin;
