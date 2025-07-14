import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../index.css';

export default function MyOrders() {
  const [customerId, setCustomerId] = useState('customer123');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`http://127.0.0.1:5000/orders/${customerId}`);
      setOrders(res.data.orders);
    } catch (err) {
      setError('Error: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  return (
    <div className="page-root">
      <h2 className="page-title">My Orders</h2>
      <div className="card">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
          <input value={customerId} onChange={e => setCustomerId(e.target.value)} className="form-input" placeholder="Customer ID" />
          <button className="form-button" style={{ width: 'auto', minWidth: '120px' }} onClick={fetchOrders}>Fetch Orders</button>
        </div>
        {loading && <div>Loading...</div>}
        {error && <div className="status-banner" style={{ background: '#e53935' }}>{error}</div>}
        {orders.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Items</th>
                <th>Status</th>
                <th>Warehouse</th>
                <th>ETA</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.items.map(i => `${i.item} (${i.qty})`).join(', ')}</td>
                  <td>{order.status}</td>
                  <td>{order.assigned_wh || '-'}</td>
                  <td>{order.eta || '-'}</td>
                  <td>
                    <button onClick={() => navigate(`/order/${order._id}`)} className="details-btn">Details</button>
                    {(!order.dispatch_time || new Date(order.dispatch_time) - new Date() > 30*60*1000) && (
                      <button onClick={() => navigate(`/edit-order/${order._id}`)} className="edit-btn">Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {orders.length === 0 && !loading && <div style={{ color: '#bdbdbd', marginTop: '24px' }}>No orders found.</div>}
      </div>
    </div>
  );
} 