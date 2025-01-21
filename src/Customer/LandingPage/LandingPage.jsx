import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './LandingPage.css';
import { useCustomer } from '../../api/CustomerProvider'; // Adjust the import path if necessary
import MainLayout from '../../components/MainLayout';

// Image imports for carousel
import carousel1 from '../../assets/carousel1.jpeg';
import carousel2 from '../../assets/carousel2.jpeg';
import carousel5 from '../../assets/carousel5.jpeg';
import carousel6 from '../../assets/carousel6.jpeg';

const LandingPage = () => {
  const { customer, setCustomer } = useCustomer(); // Get the customer from context
  const [dropdownActive, setDropdownActive] = useState(false);
  const [topSellers, setTopSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleDropdown = () => {
    setDropdownActive((prev) => !prev);
  };

  const handleOutsideClick = (e) => {
    const btn = document.querySelector('.profile-dropdown-btn');
    if (btn && !btn.contains(e.target)) {
      setDropdownActive(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/top-best-sellers');
        const data = await response.json();
        setTopSellers(data.data || []); // Safely set the data or an empty array
        setLoading(false); // Set loading to false after fetching
      } catch (error) {
        console.error('Error fetching top sellers:', error);
        setTopSellers([]); // Default to an empty array on error
        setLoading(false); // Ensure loading is stopped on error
      }
    };

    fetchTopSellers();
  }, []);

  const handleLogout = () => {
    setCustomer(null); // Clear customer context on logout
    setDropdownActive(false);
  };

  // Carousel settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };

  return (
    <MainLayout>
      <div className="landing-page">
        {/* Welcome Section */}
        <section className="intro-section">
          <h1>Welcome to Lolo's Place</h1>
          <p>
            Enjoy a unique dining experience with our freshly made meals, private dining, and events venue.
          </p>
        </section>

        {/* Carousel Section */}
        <Slider {...sliderSettings} className="landing-carousel">
          <div>
            <img src={carousel1} alt="Slide 1" className="carousel-image" />
          </div>
          <div>
            <img src={carousel2} alt="Slide 2" className="carousel-image" />
          </div>
          <div>
            <img src={carousel5} alt="Slide 5" className="carousel-image" />
          </div>
          <div>
            <img src={carousel6} alt="Slide 6" className="carousel-image" />
          </div>
        </Slider>

        {/* About Section */}
        <section className="about-section">
          <h2>About Us</h2>
          <p>
            Lolo's Place was established in 2017, located at Sitio Maligaya, Cuta, Batangas City. What started as a simple selection of Filipino comfort food has grown to serve a diverse range of customers.
          </p>
          <Link to="/about">
            <button className="about_button">Learn more about Lolo's Place</button>
          </Link>
        </section>

        {/* Best Sellers Section */}
        <section className="best-sellers-section">
          <h2>Top 3 Best Sellers</h2>
          <p>Discover our most loved dishes, crafted to perfection and adored by our customers.</p>
          {loading ? (
            <p>Loading top sellers...</p>
          ) : (
            <div className="best-sellers">
              {topSellers && Array.isArray(topSellers) && topSellers.length > 0 ? (
                topSellers.map((product, index) => (
                  <div key={index} className="best-seller-card">
                    <h3>{product.product_name}</h3>
                  </div>
                ))
              ) : (
                <p>No top sellers available.</p>
              )}
            </div>
          )}
        </section>

        {/* Order Now Section */}
        <section className="order-now-section">
          <h2>Order Now</h2>
          <p>
            Ready to indulge? Place your order online and enjoy our meals in the comfort of your home or have a reservation with us.
          </p>
          <Link to="/delivery-and-reservation">
            <button className="order-button">Place Your Order</button>
          </Link>
        </section>
      </div>
    </MainLayout>
  );
};

export default LandingPage;
