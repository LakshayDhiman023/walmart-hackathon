import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../index.css';

const ITEMS = [
  'soap', 'shampoo', 'toothpaste', 'biscuits', 'mosquito net',
  'chocolate box', 'diyas', 'light bulb', 'washing powder', 'sanitizer'
];

export default function EditOrder() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [item, setItem] = useState(ITEMS[0]);
  const [qty, setQty] = useState(1);
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/orders/${orderId}`);
        const o = res.data.orders[0];
        setOrder(o);
        setItem(o.items[0]?.item || ITEMS[0]);
        setQty(o.items[0]?.qty || 1);
        setLat(o.lat);
        setLon(o.lon);
      } catch (err) {
        setMessage('Error fetching order');
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await axios.put(`http://127.0.0.1:5000/orders/${orderId}`, {
        items: [{ item, qty: Number(qty) }],
        lat: Number(lat),
        lon: Number(lon)
      });
      setMessage('Order updated!');
      setTimeout(() => navigate('/my-orders'), 1000);
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  if (!order) return <div className="page-root">Loading...</div>;

  return (
    <div className="page-root">
      <h2 className="page-title">Edit Order</h2>
      <div className="card">
        <form className="order-form" onSubmit={handleSubmit}>
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
            {loading ? 'Updating...' : 'Update Order'}
          </button>
        </form>
        {message && <div className="status-banner" style={{ background: message.startsWith('Error') ? '#e53935' : '#43a047' }}>{message}</div>}
      </div>
    </div>
  );
} 