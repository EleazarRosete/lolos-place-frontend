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
        else{
            setKitchenData(prevState => ({
            ...prevState,
            [name]: value || ""  // Ensure it's never undefined
        }));}
    };
    
    
    const handleSave = async () => {
        let passwordsMatch = true;
    
        // Validate passwords
        if (adminData.newPassword || cashierData.newPassword || kitchenData.newPassword) {
            if (
                adminData.newPassword !== adminData.confirmPassword ||
                cashierData.newPassword !== cashierData.confirmPassword ||
                kitchenData.newPassword !== kitchenData.confirmPassword
            ) {
                alert("New password and confirm password do not match.");
                passwordsMatch = false;
            }
        }
    
        try {
            if (passwordsMatch) {
                // Prepare the updated user data (password included only if updated)
                const updatedAdminData = {
                    address: adminData.address,
                    email: adminData.email,
                    first_name: adminData.firstName,
                    last_name: adminData.lastName,
                    phone: adminData.phone,
                    user_id: 14
                };
        
                if (adminData.newPassword) {
                    updatedAdminData.password = adminData.newPassword;
                }
        
                const updatedCashierData = {
                    address: cashierData.address,
                    email: cashierData.email,
                    first_name: cashierData.firstName,
                    last_name: cashierData.lastName,
                    phone: cashierData.phone,
                    user_id: 13
                };
        
                if (cashierData.newPassword) {
                    updatedCashierData.password = cashierData.newPassword;
                }
        
                const updatedKitchenData = {
                    address: kitchenData.address,
                    email: kitchenData.email,
                    first_name: kitchenData.firstName,
                    last_name: kitchenData.lastName,
                    phone: kitchenData.phone,
                    user_id: 55
                };
        
                if (kitchenData.newPassword) {
                    updatedKitchenData.password = kitchenData.newPassword;
                }
    
                // Send data to the server based on selected role
                if (selectedRole === "admin" || selectedRole === "all") {
                    const responseAdmin = await fetch('http://localhost:10000/user/update-user', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedAdminData)
                    });
    
                    if (!responseAdmin.ok) throw new Error('Failed to update admin data');
                }
    
                if (selectedRole === "cashier" || selectedRole === "all") {
                    const responseCashier = await fetch('http://localhost:10000/user/update-user', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedCashierData)
                    });
    
                    if (!responseCashier.ok) throw new Error('Failed to update cashier data');
                }
    
                if (selectedRole === "kitchen" || selectedRole === "all") {
                    const responseKitchen = await fetch('http://localhost:10000/user/update-user', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedKitchenData)
                    });
    
                    if (!responseKitchen.ok) throw new Error('Failed to update kitchen data');
                }
    
                // If all updates succeed, navigate to admin page
                navigate('/admin');
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
            <div className={styles.sectionContainer}>
            <h2 className={styles.adminSettingH2}>Account Settings</h2>
            <div className={styles.accountSettingButtonContainer}>
                <div className={styles.selectAccount}>
                    <button className={styles.selectAccountButton} onClick={() => setSelectedRole("admin")}>Admin Setting</button>
                    <button className={styles.selectAccountButton} onClick={() => setSelectedRole("cashier")}>Cashier Setting</button>
                    <button className={styles.selectAccountButton} onClick={() => setSelectedRole("kitchen")}>Kitchen Setting</button>
                </div>
            </div>
            <div className={styles.accountSetting}>
                    <h3  className={styles.adminSettingAccountSettingH3} >{selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Settings</h3>
                    <div className={styles.AccountSettingForms}>
                    <div className={styles.AccountSettingFormsFields}>
                    <label>First Name: </label>
                    <input 
                        type="text" 
                        name="firstName" 
                        value={roleData[selectedRole].firstName} 
                        onChange={(e) => handleChange(e, selectedRole)} 
                    />
                    </div>
                    <div className={styles.AccountSettingFormsFields}>
                    <label>Last Name:                    </label>

                    <input 
                        type="text" 
                        name="lastName" 
                        value={roleData[selectedRole].lastName} 
                        onChange={(e) => handleChange(e, selectedRole)} 
                    />
                    </div>

                    <div className={styles.AccountSettingFormsFields}>
                    <label>Change Email:                    </label>

                    <input 
                        type="email" 
                        name="email" 
                        value={roleData[selectedRole].email} 
                        onChange={(e) => handleChange(e, selectedRole)} 
                    />
                    </div>

                    <div className={styles.AccountSettingFormsFields}>
                    <label>Change Phone:                    </label>

                    <input 
                        type="tel" 
                        name="phone" 
                        value={roleData[selectedRole].phone} 
                        onChange={(e) => handleChange(e, selectedRole)} 
                    />
</div>

<div className={styles.AccountSettingFormsFields}>
<label>Old Password:                    </label>

<input 
    type="password" 
    name="oldPassword" 
    value={roleData[selectedRole].oldPassword} 
    onChange={(e) => handleChange(e, selectedRole)} 
/>
</div>  

<div className={styles.AccountSettingFormsFields}>
<label>New Password:                    </label>

<input 
    type="password" 
    name="newPassword" 
    value={roleData[selectedRole].newPassword} 
    onChange={(e) => handleChange(e, selectedRole)} 
/>
</div>

<div className={styles.AccountSettingFormsFields}>
<label>Confirm New Password:                    </label>

<input 
    type="password"
    name="confirmPassword" 
    value={roleData[selectedRole].confirmPassword} 
    onChange={(e) => handleChange(e, selectedRole)} 
/>
</div>




  

                    <div className={styles.buttons}>
                        <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
                        <button className={styles.saveBtn} onClick={handleSave}>Save</button>
                    </div>
                    </div>

                </div>
                </div>
        </section>
    );
}

export default Admin;
