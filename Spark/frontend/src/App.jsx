import React, { createContext, useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PlaceOrder from './pages/PlaceOrder';
import MyOrders from './pages/MyOrders';
import EditOrder from './pages/EditOrder';
import OrderDetails from './pages/OrderDetails';
import './index.css';

// Customer context for global customer ID
const CustomerContext = createContext();
export const useCustomer = () => useContext(CustomerContext);

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded font-semibold transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : 'text-blue-600 hover:bg-blue-50'}`}
    >
      {children}
    </Link>
  );
}

function CustomerBar({ customerId, setCustomerId }) {
  return (
    <div className="flex items-center gap-2 ml-auto">
      <span className="text-gray-600">Customer ID:</span>
      <input
        className="border rounded px-2 py-1 text-sm"
        value={customerId}
        onChange={e => setCustomerId(e.target.value)}
        style={{ width: 120 }}
      />
    </div>
  );
}

export default function App() {
  const [customerId, setCustomerId] = useState('customer123');

  return (
    <CustomerContext.Provider value={{ customerId, setCustomerId }}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow p-4 flex items-center gap-4">
            <span className="text-2xl font-bold text-blue-700 mr-6">Spark Logistics</span>
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/place-order">Place Order</NavLink>
            <NavLink to="/my-orders">My Orders</NavLink>
            <CustomerBar customerId={customerId} setCustomerId={setCustomerId} />
          </nav>
          <div className="p-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/place-order" element={<PlaceOrder />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/edit-order/:orderId" element={<EditOrder />} />
              <Route path="/order/:orderId" element={<OrderDetails />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </CustomerContext.Provider>
  );
}
