import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link for routing
import './Login.css';
import logo from '../../assets/logo.png'; // Correct path to the logo
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../../api/CustomerProvider';
import MainLayout from '../../components/MainLayout';

const LoginPage = () => {
  // State to manage form visibility
  const [isLoginVisible, setIsLoginVisible] = useState(true);
  const navigate = useNavigate();
  const { setCustomer } = useCustomer();
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
    }, []);
    


  // Function to toggle between login and signup forms
  const toggleForms = () => {
    setIsLoginVisible(!isLoginVisible);
  };

  const handleLoginSubmit = async () => {
    const identifier = document.getElementById('login-identifier').value;
    const password = document.getElementById('login-password').value; 

    // Check if the identifier is either a valid email or phone number
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^\d{10,15}$/.test(identifier);

    if (!identifier || (!isEmail && !isPhone)) {
      alert("Please enter a valid Email or Phone Number.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    // If both fields are valid, you can proceed with the form submission
    try {
      const response = await axios.post('https://lolos-place-backend.onrender.com/api/login', {
        identifier, 
        password,
      });

      if (response.status === 200) {
        if (identifier === adminData.email) {
          console.log(adminData.email);
          navigate('/admin'); // Redirect to admin dashboard if the identifier matches
        }
        else if(identifier == cashierData.email){
          console.log(cashierData.email);

          navigate('/cashier')
        }
        else{
          const customer = response.data.data; // Adjust according to your API response structure
          setCustomer(customer); // Set customer context with the logged-in user
          navigate('/', { replace: true }); // Redirect to home
        }
      } else if (response.status === 401) {
        alert(`Invalid credentials`);
      } else if (response.status === 404) {
        alert(`Login failed. Account not found.`);
      }
    } catch (error) {
      alert(error.response?.data?.message || `Login failed. Incorrect username or Password.`);
    }
  };

  const handleSignUpSubmit = async () => {
    const firstName = document.getElementById('signup-firstname').value;
    const lastName = document.getElementById('signup-lastname').value;
    const address = document.getElementById('signup-address').value;
    const email = document.getElementById('signup-email').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;

    // Validate the input fields
    if (!firstName || !lastName || !address || !email || !phone || !password) {
      alert("Please fill in all fields.");
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhone = /^\d{10,15}$/.test(phone);

    if (!isEmail) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!isPhone) {
      alert("Please enter a valid phone number.");
      return;
    }
    
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    // Proceed with the signup request
    try {
      const response = await axios.post('https://lolos-place-backend.onrender.com/api/signup', {
        firstName,
        lastName,
        address,
        email,
        phone,
        password,
      });

      if (response.status === 201) {
        alert('Sign up successful! You can now log in.');
        toggleForms(); // Switch to the login form
      } else {
        alert('Sign up failed. Please try again.');
      }
    } catch (error) {
      alert(error.response?.data?.message || `Sign up failed. Please check your information.`);
    }
  };

  return (
       <MainLayout>
       <section>
    <div className="login-page">
        {/* Login Section */}
        {isLoginVisible && (
          <section id="loginSection">
            <h2>Login</h2>
            <form className="login" id="loginForm">
              {/* Email or Phone Number Field */}
              <input 
                type="text" 
                id="login-identifier" 
                placeholder="Email or Phone Number" 
                required 
              />
              {/* Password Field */}
              <input 
                type="password" 
                id="login-password" 
                placeholder="Password" 
                required 
              />
              {/* Submit Button */}
              <button 
                id="login-submit" 
                type="button" 
                onClick={handleLoginSubmit}
              >
                Login
              </button>
              <p>
                Don't have an account? 
                <button type="button" onClick={toggleForms}>Sign Up</button>
              </p>
            </form>
          </section>
        )}

        {/* Sign Up Section */}
        {!isLoginVisible && (
          <section id="signupSection">
            <h2>Sign Up</h2>
            <form className="signup" id="signupForm">
              <input type="text" id="signup-firstname" placeholder="First Name" required />
              <input type="text" id="signup-lastname" placeholder="Last Name" required />
              <input type="text" id="signup-address" placeholder="Complete Address" required />
              <input type="email" id="signup-email" placeholder="Email" required />
              <input type="text" id="signup-phone" placeholder="Phone Number" required />
              <input type="password" id="signup-password" placeholder="Password" required />
              <button id="signup-submit" type="button" onClick={handleSignUpSubmit}>Sign Up</button>

              <p>
                Already have an account? 
                <button type="button" onClick={toggleForms}>Login</button>
              </p>
            </form>
            
          </section>
          
        )}
          <div className='white'></div>


    </div>
    </section>
    </MainLayout>
  );
};

export default LoginPage;
