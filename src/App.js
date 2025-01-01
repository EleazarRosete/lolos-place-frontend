import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import necessary components from react-router-dom
import './App.css';
import Menu from './Customer/Menu/Menu';
import LandingPage from './Customer/LandingPage/LandingPage';
import LoginPage from './Customer/Login/Login';
import UserProfile from './Customer/UserProfile/UserProfile';
import AboutPage from './Customer/About/About';
import DeliveryAndReservation from './Customer/DeliveryAndReservation/DeliveryAndReservation';
import Delivery from './Customer/Delivery/Delivery';
import Reservation from './Customer/Reservation/Reservation';
import Feedback from './Customer/Feedback/Feedback';
import { CustomerProvider } from './api/CustomerProvider';
import SuccessPage from './Customer/SuccessPage/SuccessPage';
import OrderHistory from './Customer/OrderHistory/OrderHistory';
import Admin from './Admin';
function App() {
  return /*#__PURE__*/React.createElement(CustomerProvider, null, /*#__PURE__*/React.createElement(Router, null, " ", /*#__PURE__*/React.createElement(Routes, null, " ", /*#__PURE__*/React.createElement(Route, {
    path: "/",
    element: /*#__PURE__*/React.createElement(LandingPage, null)
  }), " ", /*#__PURE__*/React.createElement(Route, {
    path: "/about",
    element: /*#__PURE__*/React.createElement(AboutPage, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/menu",
    element: /*#__PURE__*/React.createElement(Menu, null)
  }), " ", /*#__PURE__*/React.createElement(Route, {
    path: "/login",
    element: /*#__PURE__*/React.createElement(LoginPage, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/profile",
    element: /*#__PURE__*/React.createElement(UserProfile, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/delivery-and-reservation",
    element: /*#__PURE__*/React.createElement(DeliveryAndReservation, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/delivery",
    element: /*#__PURE__*/React.createElement(Delivery, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/reservation",
    element: /*#__PURE__*/React.createElement(Reservation, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/feedback",
    element: /*#__PURE__*/React.createElement(Feedback, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/successpage",
    element: /*#__PURE__*/React.createElement(SuccessPage, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/order-history",
    element: /*#__PURE__*/React.createElement(OrderHistory, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/admin/*",
    element: /*#__PURE__*/React.createElement(Admin, null)
  }))));
}
export default App;
