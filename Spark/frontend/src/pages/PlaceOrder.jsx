import React, { useState } from 'react';
import axios from 'axios';
import { useCustomer } from '../App';
import '../index.css';

const ITEMS = [
  'soap', 'shampoo', 'toothpaste', 'biscuits', 'mosquito net',
  'chocolate box', 'diyas', 'light bulb', 'washing powder', 'sanitizer'
];

export default function PlaceOrder() {
  const { customerId } = useCustomer();
  const [item, setItem] = useState(ITEMS[0]);
  const [qty, setQty] = useState(1);
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('http://127.0.0.1:5000/orders', {
        customer_id: customerId,
        items: [{ item, qty: Number(qty) }],
        lat: Number(lat),
        lon: Number(lon)
      });
      setMessage('Order placed! Order ID: ' + res.data.order_id);
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  return (
    <div className="page-root">
      <h2 className="page-title">Place Order</h2>
      <div className="card">
        <form className="order-form" onSubmit={handleSubmit}>
          <label className="form-label">Customer ID: <span style={{ color: '#1976d2', fontWeight: 600 }}>{customerId}</span></label>
          <label className="form-label">Item</label>
          <select className="form-select" value={item} onChange={e => setItem(e.target.value)}>
            {ITEMS.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <label className="form-label">Quantity</label>
          <input className="form-input" type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} required />
          <label className="form-label">Latitude</label>
          <input className="form-input" value={lat} onChange={e => setLat(e.target.value)} required />
          <label className="form-label">Longitude</label>
          <input className="form-input" value={lon} onChange={e => setLon(e.target.value)} required />
          <button className="form-button" type="submit" disabled={loading}>
            {loading ? 'Placing...' : 'Place Order'}
          </button>
        </form>
        {message && <div className="status-banner" style={{ background: message.startsWith('Error') ? '#e53935' : '#43a047' }}>{message}</div>}
      </div>
    </div>
  );
} 