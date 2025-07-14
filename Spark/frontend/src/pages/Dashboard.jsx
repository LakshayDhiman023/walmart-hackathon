import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCustomer } from '../App';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../index.css';

const ITEMS = [
  'soap', 'shampoo', 'toothpaste', 'biscuits', 'mosquito net',
  'chocolate box', 'diyas', 'light bulb', 'washing powder', 'sanitizer'
];

export default function Dashboard() {
  const { customerId } = useCustomer();
  const [item, setItem] = useState(ITEMS[0]);
  const [qty, setQty] = useState(1);
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    document.title = 'Spark Logistics Dashboard';
    axios.get('http://127.0.0.1:5000/warehouses')
      .then(res => setWarehouses(res.data.warehouses))
      .catch(() => setWarehouses([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setRouteInfo(null);
    setOrderId(null);
    try {
      const orderRes = await axios.post('http://127.0.0.1:5000/orders', {
        customer_id: customerId,
        items: [{ item, qty: Number(qty) }],
        lat: Number(lat),
        lon: Number(lon)
      });
      setOrderId(orderRes.data.order_id);
      const routeRes = await axios.post('http://127.0.0.1:5000/route', {
        order_ids: [orderRes.data.order_id]
      });
      setRouteInfo(routeRes.data.routes[0]);
      setMessage('Order placed and route planned!');
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  const mapCenter = warehouses.length
    ? [
        warehouses.reduce((sum, w) => sum + Number(w.lat), 0) / warehouses.length,
        warehouses.reduce((sum, w) => sum + Number(w.lon), 0) / warehouses.length
      ]
    : [22.9734, 78.6569];

  const warehouseMarkers = warehouses.map(w => (
    <Marker key={w.wh_id} position={[w.lat, w.lon]}>
      <Popup>
        <b>Warehouse {w.wh_id}</b><br />
        Lat: {w.lat}<br />
        Lon: {w.lon}
      </Popup>
    </Marker>
  ));

  const customerMarker = lat && lon ? (
    <Marker position={[Number(lat), Number(lon)]}>
      <Popup>
        <b>Customer Location</b><br />
        Lat: {lat}<br />
        Lon: {lon}
      </Popup>
    </Marker>
  ) : null;

  const routeLine = routeInfo && routeInfo.route ? (
    <Polyline positions={routeInfo.route.map(p => [p.lat, p.lon])} color="#22c55e" weight={4} />
  ) : null;

  return (
    <div className="dashboard-root">
      <h1 className="dashboard-title">Spark Logistics Dashboard</h1>
      <div className="dashboard-cards">
        {/* Order Form Card */}
        <div className="dashboard-card">
          <form className="order-form" onSubmit={handleSubmit}>
            <label>Customer ID: <span style={{ color: '#1976d2', fontWeight: 600 }}>{customerId}</span></label>
            <label>Item</label>
            <select value={item} onChange={e => setItem(e.target.value)}>
              {ITEMS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <label>Quantity</label>
            <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} required />
            <label>Latitude</label>
            <input value={lat} onChange={e => setLat(e.target.value)} required />
            <label>Longitude</label>
            <input value={lon} onChange={e => setLon(e.target.value)} required />
            <button type="submit" disabled={loading}>
              {loading ? 'Placing & Planning...' : 'Place Order & Plan Delivery'}
            </button>
          </form>
        </div>
        {/* Order Status & Map Card */}
        <div className="dashboard-card">
          {routeInfo && message && (
            <div className="status-banner">
              Order placed and route planned!
            </div>
          )}
          {routeInfo && (
            <>
              <div className="order-status">
                <div><b>Order ID:</b> <span style={{ fontFamily: 'monospace' }}>{orderId}</span></div>
                <div><b>Status:</b> {routeInfo.status}</div>
                <div><b>Assigned Warehouse:</b> <span style={{ fontFamily: 'monospace' }}>{routeInfo.assigned_wh || '-'}</span></div>
                <div><b>ETA:</b> {routeInfo.eta || '-'}</div>
                <div><b>Dispatch Time:</b> {routeInfo.dispatch_time || '-'}</div>
              </div>
              <div className="map-container">
                <MapContainer center={mapCenter} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {warehouseMarkers}
                  {customerMarker}
                  {routeLine}
                </MapContainer>
              </div>
            </>
          )}
          {!routeInfo && (
            <div style={{ color: '#bdbdbd', textAlign: 'center', marginTop: '40px' }}>
              <span style={{ fontSize: '2.5rem' }}>🗺️</span>
              <div>Order status and route will appear here after placing an order.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}